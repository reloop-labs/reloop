import { MailErrors } from "@reloop/be-mail/lib/errors";
import type { MailModel } from "@reloop/be-mail/model/mail.model";
import { db } from "@reloop/db/client";
import { emailThread, organization, threadMessage } from "@reloop/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";
import { log } from "evlog";
import { useLogger } from "evlog/elysia";
import {
	checkDnsHealth_step3,
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
	body,
	apiKey,
	apiKeyId,
	userId,
}: {
	organizationId: string;
	body: MailModel.SendEmailBody;
	apiKey: string;
	apiKeyId?: string;
	userId?: string;
}): Promise<MailModel.SendEmailResponse> {
	const logger = useLogger();
	logger.set({
		organizationId,
		from: body.from,
		to: body.to,
	});
	log.info("server", "Initiating email send process");

	// ── Step 0: Atomic quota check + deduction ─────────────────────────────────
	// Count recipients across to/cc/bcc
	const toList = Array.isArray(body.to) ? body.to : [body.to];
	const ccList = body.cc
		? Array.isArray(body.cc)
			? body.cc
			: [body.cc]
		: [];
	const bccList = body.bcc
		? Array.isArray(body.bcc)
			? body.bcc
			: [body.bcc]
		: [];
	const recipientCount = toList.length + ccList.length + bccList.length;

	// Atomically deduct credits — only succeeds if sufficient credits remain
	const [updatedOrg] = await db
		.update(organization)
		.set({
			creditsRemaining: sql`${organization.creditsRemaining} - ${recipientCount}`,
		})
		.where(
			and(
				eq(organization.id, organizationId),
				gte(organization.creditsRemaining, recipientCount),
			),
		)
		.returning({ creditsRemaining: organization.creditsRemaining });

	if (!updatedOrg) {
		// Fetch current balance for the error message
		const current = await db.query.organization.findFirst({
			where: (o, { eq }) => eq(o.id, organizationId),
			columns: { creditsRemaining: true },
		});
		throw MailErrors.quotaExceeded(current?.creditsRemaining ?? 0);
	}

	const { domainName } = parseFromAddress_step1(body.from);

	const { currentDomain } = await verifyDomainAuth_step2({
		organizationId,
		domainName,
	});

	const dnsHealthCheck = await checkDnsHealth_step3({
		domainId: currentDomain.id,
		organizationId,
		domainData: currentDomain,
	});

	if (!dnsHealthCheck.isHealthy) {
		throw MailErrors.dnsHealthError(domainName, dnsHealthCheck.missingRecords);
	}

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
	});

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

	// ── Fire-and-forget: ingest usage event into Lago ───────────────────────────
	const lagoUrl = process.env.LAGO_API_URL || "http://localhost:3000";
	const lagoKey = process.env.LAGO_API_KEY || "";
	if (lagoKey) {
		fetch(`${lagoUrl}/api/v1/events`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${lagoKey}`,
			},
			body: JSON.stringify({
				event: {
					transaction_id: emailLogId,
					external_customer_id: organizationId,
					code: "emails_sent",
					timestamp: Math.floor(Date.now() / 1000),
					properties: { recipient_count: recipientCount },
				},
			}),
		}).catch(() => {
			// Non-fatal — Lago usage event failure never blocks sending
		});
	}

	return response;
}
