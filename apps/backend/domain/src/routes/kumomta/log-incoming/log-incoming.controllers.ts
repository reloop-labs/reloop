import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import { ensureSendingDomainVerified } from "@reloop/db/ensure-sending-domain-verified";
import { scoreOutboundAbuse } from "@reloop/db/outbound-abuse";
import {
	type CreditReservation,
	refundSendCredits,
	reserveSendCredits,
} from "@reloop/db/reserve-send-credits";
import { checkDomainAgeDailyCap } from "@reloop/db/domain-age-cap";
import { domain, emailLog, organizationPlan } from "@reloop/db/schema";
import { uniqueBareEmails } from "@reloop/db/smtp-recipients";
import { KumoMtaErrors } from "@reloop/domain/error/domain.error-response";
import { and, eq, isNull } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";
import { simpleParser } from "mailparser";

export type LogIncomingParams = {
	domainName: string;
	messageId: string;
	providerMessageId?: string;
	fromEmail: string;
	toEmails: string[];
	subject: string;
	textBody?: string;
	htmlBody?: string;
	rawMessage?: string;
	size: number;
};

export async function logIncomingController({
	body,
	organizationId,
	userId,
	apikeyId,
}: {
	body: LogIncomingParams;
	organizationId: string;
	userId?: string | null;
	apikeyId?: string | null;
}): Promise<{
	id: string;
	trackingDomain: string | null;
	clickTracking: boolean;
	openTracking: boolean;
	tls: "opportunistic" | "enforced";
}> {
	const log = useLogger();
	let textBody = body.textBody || "";
	let htmlBody = body.htmlBody || "";
	let subject = body.subject || "No Subject";

	if (body.rawMessage) {
		log.info(
			`[LOG-INCOMING] Parsing rawMessage (length: ${body.rawMessage.length})`,
		);
		try {
			const parsed = await simpleParser(body.rawMessage);
			log.info(
				`[LOG-INCOMING] Parsed rawMessage (text: ${!!parsed.text}, html: ${!!parsed.html})`,
			);
			textBody = parsed.text || "";
			htmlBody = (parsed.html as string) || "";
			subject = parsed.subject || subject;
		} catch (parseError) {
			log.error(
				`[LOG-INCOMING] mailparser error: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
			);
		}
	}

	const domainQuery = and(
		eq(domain.domain, body.domainName),
		eq(domain.organizationId, organizationId),
		isNull(domain.deletedAt),
	);

	log.info(
		`[LOG-INCOMING] Querying domain: ${body.domainName} (Org: ${organizationId})`,
	);

	const domainRecord = await db.query.domain.findFirst({
		where: domainQuery,
		columns: {
			id: true,
			status: true,
			organizationId: true,
			isClickTrackingEnabled: true,
			isOpenTrackingEnabled: true,
			isTrackingDomain: true,
			trackingSubdomain: true,
			domain: true,
			systemVerified: true,
			tls: true,
			createdAt: true,
		},
	});

	if (!domainRecord) {
		log.warn(
			`[LOG-INCOMING] Domain NOT FOUND: ${body.domainName} (Org: ${organizationId})`,
		);
		throw KumoMtaErrors.domainNotFound(body.domainName);
	}

	// Live DNS check. A stored "active" status is not enough if the customer
	// removed SPF, DKIM, DMARC, or other required records after verification.
	const dns = await ensureSendingDomainVerified({
		domainId: domainRecord.id,
		organizationId,
	});
	if (!dns.ok) {
		log.warn(
			`[LOG-INCOMING] Domain DNS not verified: ${body.domainName} (${dns.code})`,
		);
		if (dns.code === "not_found") {
			throw KumoMtaErrors.domainNotFound(body.domainName);
		}
		if (dns.code === "lookup_failed") {
			const detail = `Email was not sent. DNS for ${body.domainName} could not be checked just now, so the message was not accepted.`;
			throw createError({
				status: 503,
				message: detail,
				why: detail,
				fix: "Retry in a moment. If this keeps happening, confirm the domain's DNS records are still published.",
			});
		}
		if (dns.code === "unverified") {
			throw KumoMtaErrors.domainDnsNotVerified(body.domainName, dns.reason);
		}
		throw KumoMtaErrors.domainNotActive(body.domainName);
	}

	const finalOrgId = organizationId || domainRecord.organizationId;

	const existingLog = await db.query.emailLog.findFirst({
		where: eq(emailLog.messageId, body.messageId),
		columns: { id: true },
	});

	if (existingLog) {
		log.info(`[LOG-INCOMING] Message ID already exists: ${body.messageId}`);
		throw KumoMtaErrors.messageIdConflict(body.messageId);
	}

	const toEmails = uniqueBareEmails(body.toEmails);
	if (toEmails.length === 0) {
		throw createError({
			status: 400,
			message: "No envelope recipients",
			why: "SMTP quota is charged per envelope recipient. This message has none.",
			fix: "Provide at least one RCPT TO address",
		});
	}

	// ── Plan size gate (mirrors REST send-email size-gate) ──────────────
	// organization_plan.max_attachment_bytes is the decoded cap per send
	// (free 1 MB, paid 5 MB). body.size is on-wire MIME, which inflates
	// ~37% via base64 + boundaries, so allow 1.5x headroom before rejecting.
	// Keeps tiers proportional (free ~1.5 MB wire, paid ~7.5 MB wire) while
	// staying under the KumoMTA 15 MB transport ceiling.
	const planRow = await db.query.organizationPlan.findFirst({
		where: eq(organizationPlan.organizationId, organizationId),
		columns: { maxAttachmentBytes: true, planId: true },
	});
	const decodedLimit = planRow?.maxAttachmentBytes ?? 1 * 1024 * 1024;
	const wireLimit = Math.floor(decodedLimit * 1.5);
	if (body.size > wireLimit) {
		throw KumoMtaErrors.messageTooLarge({
			actualBytes: body.size,
			limitBytes: decodedLimit,
			planId: planRow?.planId ?? "free",
		});
	}

	const abuse = scoreOutboundAbuse({
		from: body.fromEmail,
		to: toEmails,
		subject,
		text: textBody,
		html: htmlBody,
	});
	if (abuse.severity !== "none") {
		try {
			await bus.publish(BusEvent.ABUSE_SUSPECTED, {
				organizationId: finalOrgId,
				fromEmail: body.fromEmail,
				subject,
				recipientCount: toEmails.length,
				severity: abuse.severity,
				reasons: abuse.reasons,
				action: abuse.severity === "high" ? "blocked" : "allowed",
				timestamp: new Date().toISOString(),
			});
		} catch (error) {
			log.warn(
				`[LOG-INCOMING] Failed to publish abuse.suspected: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}
	if (abuse.severity === "high") {
		throw KumoMtaErrors.abuseBlocked(abuse.reasons);
	}

	const recipientCount = toEmails.length;

	// ── Domain-age initial daily cap (all packages) ───────────────────────
	const ageCheck = await checkDomainAgeDailyCap({
		domain: { id: domainRecord.id, createdAt: domainRecord.createdAt },
		recipientCount,
	});
	if (!ageCheck.allowed && ageCheck.cap !== null) {
		throw KumoMtaErrors.domainAgeDailyCapExceeded({
			domainName: body.domainName,
			ageDays: ageCheck.ageDays,
			cap: ageCheck.cap,
			sentToday: ageCheck.sentToday,
			required: recipientCount,
		});
	}

	const decision = await reserveSendCredits({
		organizationId: finalOrgId,
		recipientCount,
	});
	if (!decision.ok) {
		if (decision.reason === "daily" && decision.dailyLimit != null) {
			throw KumoMtaErrors.dailyQuotaExceeded({
				used: decision.dailyUsed,
				limit: decision.dailyLimit,
				required: recipientCount,
			});
		}
		throw KumoMtaErrors.quotaExceeded({
			remaining: decision.remaining,
			required: recipientCount,
			monthlyCredits: decision.monthlyCredits,
		});
	}
	const reservation: CreditReservation | undefined = decision.reservation;

	let inserted: { id: string }[] | undefined;
	try {
		inserted = await db
			.insert(emailLog)
			.values({
				messageId:
					body.messageId ||
					`msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
				organizationId: finalOrgId,
				domainId: domainRecord.id,
				userId: userId || null,
				apikeyId: apikeyId || null,
				fromEmail: body.fromEmail,
				toEmails,
				subject: subject,
				textBody: textBody,
				htmlBody: htmlBody,
				rawMessage: body.rawMessage || null,
				status: "pending",
				size: body.size || 0,
				provider: "kumomta",
				providerMessageId: body.providerMessageId,
				source: "smtp",
			})
			.returning({ id: emailLog.id });
	} catch (error) {
		if (reservation) await refundSendCredits({ reservation });
		throw error;
	}

	const insertedId = inserted?.[0]?.id;
	if (!insertedId) {
		if (reservation) await refundSendCredits({ reservation });
		throw KumoMtaErrors.failedToInsertLog();
	}

	await bus.publish(BusEvent.EMAIL_SENT, {
		organizationId: finalOrgId,
		emailLogId: insertedId,
		recipientCount: toEmails.length,
		creditsReserved: true,
		timestamp: new Date().toISOString(),
	});

	const isDomainVerified =
		domainRecord.systemVerified && domainRecord.status === "active";

	const hasCustomTracking =
		isDomainVerified &&
		domainRecord.isTrackingDomain &&
		domainRecord.trackingSubdomain &&
		(domainRecord.isClickTrackingEnabled || domainRecord.isOpenTrackingEnabled);

	const trackingDomain = hasCustomTracking
		? `${domainRecord.trackingSubdomain}.${domainRecord.domain}`
		: null;

	return {
		id: insertedId,
		trackingDomain,
		clickTracking: domainRecord.isClickTrackingEnabled,
		openTracking: domainRecord.isOpenTrackingEnabled,
		tls: domainRecord.tls ?? "opportunistic",
	};
}
