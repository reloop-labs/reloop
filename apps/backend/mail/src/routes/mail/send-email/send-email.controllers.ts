import { countEmailRecipients } from "@reloop/be-mail/lib/count-recipients";
import {
	assertHasCredits,
	refundCreditsForFailedSend,
	reserveCreditsForSend,
} from "@reloop/be-mail/lib/credits-gate";
import { MailErrors } from "@reloop/be-mail/lib/errors";
import { runOutboundGuard } from "@reloop/be-mail/lib/outbound-guard";
import type { MailModel } from "@reloop/be-mail/model/mail.model";
import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import { scoreOutboundAbuse } from "@reloop/db/outbound-abuse";
import { emailThread, threadMessage } from "@reloop/db/schema";
import { eq, sql } from "drizzle-orm";
import { log } from "evlog";
import { useLogger } from "evlog/elysia";
import {
	checkDnsHealth_step3,
	checkSuppressions_step2b,
	createEmailLog_step4,
	finalizeEmail_step7,
	injectCustomTracking_step5c,
	injectTracking_step5b,
	parseFromAddress_step1,
	resolveTemplate_step5,
	sendEmail_step6,
	verifyDomainAuth_step2,
} from "./steps";

function parseFromName(from: string): string {
	const displayNameMatch = from.match(/^(.+?)\s*<[^>]+>$/);
	if (displayNameMatch?.[1]) {
		return displayNameMatch[1].trim();
	}
	return from.split("@")[0] ?? from;
}

export async function sendEmailController({
	organizationId,
	body: rawBody,
	apiKey,
	apiKeyId,
	userId,
	cookie,
	requestApiKey,
	useInternalInject = false,
}: {
	organizationId: string;
	body: MailModel.SendEmailBody;
	apiKey: string;
	apiKeyId?: string;
	userId?: string;
	cookie?: string | null;
	requestApiKey?: string | null;
	useInternalInject?: boolean;
}): Promise<MailModel.SendEmailResponse> {
	const logger = useLogger();
	logger.set({
		organizationId,
		from: rawBody.from,
		to: rawBody.to,
	});
	log.info("server", "Initiating email send process");

	// Fail closed before DNS/log/Kumo work when the monthly meter is empty.
	await assertHasCredits({ organizationId, body: rawBody });

	// ── Outbound content security ─────────────────────────────────────────
	// Runs before any log or KumoMTA work so phishing/spam payloads are
	// rejected at the API boundary and never touch the mail queue.
	const { sanitizedHeaders } = runOutboundGuard({
		from: rawBody.from,
		subject: rawBody.subject,
		html: rawBody.html,
		text: rawBody.text,
		headers: rawBody.headers,
		replyTo: rawBody.reply_to,
		attachments: rawBody.attachments,
	});
	// Swap in the sanitized headers (CRLF-clean, reserved names stripped)
	let body: MailModel.SendEmailBody = { ...rawBody, headers: sanitizedHeaders };
	log.info({
		message: "Outbound guard passed",
		from: body.from,
		subject: body.subject,
	});

	const { domainName } = parseFromAddress_step1(body.from);

	const { currentDomain } = await verifyDomainAuth_step2({
		organizationId,
		domainName,
	});

	// ── GAP 8: Global suppression list check ──────────────────────────────
	// Runs after auth (org confirmed) but before log creation so suppressed
	// sends are never logged or billed.
	// Platform-global: an email suppressed in ANY org is blocked here too,
	// protecting shared IP reputation across all tenants.
	const { body: cleanBody, suppressed } = await checkSuppressions_step2b({
		body,
	});
	if (suppressed.length > 0) {
		log.warn({
			message: `Removed ${suppressed.length} suppressed recipient(s) before send`,
			suppressed: suppressed.map((s) => s.email),
			organizationId,
		});
	}
	body = cleanBody;

	const abuse = scoreOutboundAbuse({
		from: body.from,
		to: body.to,
		cc: body.cc,
		bcc: body.bcc,
		subject: body.subject,
		text: body.text,
		html: body.html,
	});
	if (abuse.severity !== "none") {
		try {
			await bus.publish(BusEvent.ABUSE_SUSPECTED, {
				organizationId,
				fromEmail: body.from,
				subject: body.subject,
				recipientCount: countEmailRecipients(body),
				severity: abuse.severity,
				reasons: abuse.reasons,
				action: abuse.severity === "high" ? "blocked" : "allowed",
				timestamp: new Date().toISOString(),
			});
		} catch (error) {
			log.warn({
				message: "Failed to publish abuse.suspected event",
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}
	if (abuse.severity === "high") {
		throw MailErrors.abuseBlocked(abuse.reasons);
	}

	const dnsHealthCheck = await checkDnsHealth_step3({
		domainId: currentDomain.id,
		organizationId,
	});

	if (!dnsHealthCheck.ok) {
		if (dnsHealthCheck.code === "not_found") {
			throw MailErrors.domainNotFound(domainName);
		}
		if (dnsHealthCheck.code === "suspended") {
			throw MailErrors.domainSuspended(domainName);
		}
		if (dnsHealthCheck.code === "sending_disabled") {
			throw MailErrors.sendingDisabled(domainName);
		}
		if (dnsHealthCheck.code === "lookup_failed") {
			throw MailErrors.dnsLookupFailed(domainName);
		}
		throw MailErrors.dnsHealthError(domainName, dnsHealthCheck.reason);
	}

	// The live check just confirmed the records. The row loaded in step 2
	// may still say unverified if DNS was fixed after the last stored check.
	currentDomain.systemVerified = true;
	currentDomain.status = "active";
	currentDomain.isTrackingDomain = Boolean(
		currentDomain.isClickTrackingEnabled || currentDomain.isOpenTrackingEnabled,
	);

	// Reserve monthly + daily quota under a row lock so concurrent API/SMTP
	// senders cannot all pass a stale remaining-balance check.
	const reservation = await reserveCreditsForSend({
		organizationId,
		body,
	});

	let injected = false;
	try {
		return await sendReservedEmail({
			organizationId,
			body,
			currentDomain,
			apiKey,
			apiKeyId,
			userId,
			cookie,
			requestApiKey,
			useInternalInject,
			onInjected: () => {
				injected = true;
			},
		});
	} catch (error) {
		if (!injected) {
			await refundCreditsForFailedSend(reservation);
		} else {
			log.error({
				message:
					"Kumo accepted the message but post-inject work failed; credits kept",
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			});
		}
		throw error;
	}
}

async function sendReservedEmail({
	organizationId,
	body,
	currentDomain,
	apiKey,
	apiKeyId,
	userId,
	cookie,
	requestApiKey,
	useInternalInject,
	onInjected,
}: {
	organizationId: string;
	body: MailModel.SendEmailBody;
	currentDomain: Awaited<
		ReturnType<typeof verifyDomainAuth_step2>
	>["currentDomain"];
	apiKey: string;
	apiKeyId?: string;
	userId?: string;
	cookie?: string | null;
	requestApiKey?: string | null;
	useInternalInject?: boolean;
	onInjected?: () => void;
}): Promise<MailModel.SendEmailResponse> {
	// ── Resolve In-Reply-To header if replying to a thread ────────
	const threadHeaders: Record<string, string> = {};
	if (body.thread_id) {
		// Look up the most recent message in the thread to get its Message-ID
		const lastMsg = await db.query.threadMessage.findFirst({
			where: eq(threadMessage.threadId, body.thread_id),
			orderBy: (m, { desc }) => [desc(m.messageAt)],
			columns: { rfc822MessageId: true },
		});

		if (lastMsg?.rfc822MessageId) {
			threadHeaders["In-Reply-To"] = lastMsg.rfc822MessageId;
			threadHeaders["References"] = lastMsg.rfc822MessageId;
		}
	}

	// Merge thread headers into body headers
	if (Object.keys(threadHeaders).length > 0) {
		body.headers = { ...threadHeaders, ...(body.headers || {}) };
	}

	const { emailLogId } = await createEmailLog_step4({
		organizationId,
		domainId: currentDomain.id,
		body,
		apikeyId: apiKeyId,
		userId,
	});

	const { finalSubject, finalHtml, finalText } = await resolveTemplate_step5({
		organizationId,
		template: body.template,
		subject: body.subject,
		html: body.html,
		text: body.text,
	});

	// Step 5b/c: Rewrite links and inject open pixel based on domain tracking flags
	let trackedHtml = finalHtml;
	const isDomainVerified =
		currentDomain.systemVerified && currentDomain.status === "active";

	const hasCustomTracking =
		isDomainVerified &&
		currentDomain.isTrackingDomain &&
		currentDomain.trackingSubdomain &&
		(currentDomain.isClickTrackingEnabled ||
			currentDomain.isOpenTrackingEnabled);

	if (hasCustomTracking) {
		trackedHtml = injectCustomTracking_step5c({
			html: finalHtml,
			emailLogId,
			clickTracking: currentDomain.isClickTrackingEnabled,
			openTracking: currentDomain.isOpenTrackingEnabled,
			trackingDomain: `${currentDomain.trackingSubdomain}.${currentDomain.domain}`,
		});
	} else {
		trackedHtml = injectTracking_step5b({
			html: finalHtml,
			emailLogId,
			clickTracking: currentDomain.isClickTrackingEnabled,
			openTracking: currentDomain.isOpenTrackingEnabled,
		});
	}

	const result = await sendEmail_step6({
		body,
		finalSubject,
		finalHtml: trackedHtml,
		finalText,
		organizationId,
		domainId: currentDomain.id,
		emailLogId,
		apiKey,
		tlsMode: currentDomain.tls ?? "opportunistic",
		cookie,
		requestApiKey,
		userId,
		useInternalInject,
	});
	onInjected?.();

	const response = await finalizeEmail_step7({
		emailLogId,
		result,
		organizationId,
		body,
	});

	// ── Thread linking ────────────────────────────────────────────
	// If a thread_id was provided, append this outbound email to the thread
	if (body.thread_id) {
		try {
			const thread = await db.query.emailThread.findFirst({
				where: eq(emailThread.id, body.thread_id),
				columns: { id: true, organizationId: true },
			});

			if (thread && thread.organizationId === organizationId) {
				const preview = (body.text || body.subject || "").substring(0, 200);
				const fromName = parseFromName(body.from);

				await db.insert(threadMessage).values({
					threadId: body.thread_id,
					direction: "outbound",
					emailLogId,
					fromEmail: body.from,
					fromName,
					subject: body.subject,
					preview,
					messageAt: new Date(),
					rfc822MessageId: response.messageId || undefined,
					inReplyTo: threadHeaders["In-Reply-To"] || undefined,
				});

				await db
					.update(emailThread)
					.set({
						lastMessagePreview: preview,
						lastMessageAt: new Date(),
						messageCount: sql`${emailThread.messageCount} + 1`,
						participants: sql`
							CASE
								WHEN ${emailThread.participants}::jsonb ? ${body.from}
								THEN ${emailThread.participants}
								ELSE ${emailThread.participants}::jsonb || to_jsonb(${body.from}::text)
							END
						`,
					})
					.where(eq(emailThread.id, body.thread_id));

				log.info({
					message: `Appended outbound email to thread ${body.thread_id}`,
					emailLogId,
					threadId: body.thread_id,
				});
			} else {
				log.warn({
					message: `Thread ${body.thread_id} not found or org mismatch, skipping thread link`,
					emailLogId,
				});
			}
		} catch (err) {
			// Don't fail the send if threading fails
			log.error({
				message: `Failed to link email to thread: ${err instanceof Error ? err.message : String(err)}`,
				emailLogId,
				threadId: body.thread_id,
			});
		}
	}

	log.info({
		...{
			emailLogId,
			messageId: response.messageId,
			organizationId,
		},
		message: "Email process completed successfully",
	});

	return response;
}
