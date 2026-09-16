import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import { refreshDomainRegistrationAge } from "@reloop/db/domain-daily-overlay";
import {
	type CreditReservation,
	refundSendCredits,
	reserveSendCredits,
} from "@reloop/db/reserve-send-credits";
import { domain, emailLog } from "@reloop/db/schema";
import { uniqueBareEmails } from "@reloop/db/smtp-recipients";
import { lookupRdapCreatedAt } from "@reloop/dns/rdap-created-at";
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
			registeredAt: true,
			registrationAgeCheckedAt: true,
		},
	});

	if (!domainRecord) {
		log.warn(
			`[LOG-INCOMING] Domain NOT FOUND: ${body.domainName} (Org: ${organizationId})`,
		);
		throw KumoMtaErrors.domainNotFound(body.domainName);
	}

	if (domainRecord.status !== "active") {
		log.warn(
			`[LOG-INCOMING] Domain found but NOT ACTIVE: ${body.domainName} (Status: ${domainRecord.status})`,
		);
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

	let registeredAt = domainRecord.registeredAt;
	try {
		registeredAt = await refreshDomainRegistrationAge({
			domainId: domainRecord.id,
			domainName: domainRecord.domain,
			registeredAt: domainRecord.registeredAt,
			registrationAgeCheckedAt: domainRecord.registrationAgeCheckedAt,
			lookup: lookupRdapCreatedAt,
		});
	} catch (error) {
		log.warn(
			`[LOG-INCOMING] Domain age refresh failed: ${error instanceof Error ? error.message : String(error)}`,
		);
	}

	const recipientCount = toEmails.length;
	const decision = await reserveSendCredits({
		organizationId: finalOrgId,
		recipientCount,
		domainRegisteredAt: registeredAt,
	});
	if (!decision.ok) {
		if (decision.reason === "daily" && decision.dailyLimit != null) {
			if (decision.cause === "domain_age") {
				throw KumoMtaErrors.domainTooNew({
					used: decision.dailyUsed,
					limit: decision.dailyLimit,
					required: recipientCount,
				});
			}
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
