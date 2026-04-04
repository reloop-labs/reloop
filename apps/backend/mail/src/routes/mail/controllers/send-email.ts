import { kumomtaClient } from "@reloop/be-mail/lib/kumomta-client";
import type { MailTypes } from "@reloop/be-mail/routes/mail/mail.type.js";
import { db } from "@reloop/db/client";
import {
	type dnsRecordTypeEnum,
	domain,
	domainDnsRecord,
	emailLog,
} from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, inArray, or, sql } from "drizzle-orm";

export async function sendEmail(
	emailData: MailTypes.SendEmailRequest,
	organizationId: string,
): Promise<MailTypes.SendEmailHandlerResponse> {
	const timestamp = new Date().toISOString();

	try {
		// Validate sender email belongs to user's organization
		const domainName = emailData.from.split("@")[1];
		if (!domainName) {
			throw new Error("Invalid 'from' email address");
		}
		const domainRecord = await db
			.select()
			.from(domain)
			.where(
				and(
					eq(domain.organizationId, organizationId),
					or(
						eq(domain.domain, domainName),
						sql`${domainName} LIKE ('%.' || ${domain.domain})`,
					),
				),
			)
			.limit(1);

		if (domainRecord.length === 0) {
			throw new Error(`Domain ${domainName} not found or not authorized`);
		}

		const currentDomain = domainRecord[0];
		if (!currentDomain) {
			throw new Error(`Domain ${domainName} not found or not authorized`);
		}

		// DNS Health Check: Verify domain has valid DNS records before sending
		const dnsHealthCheck = await checkDomainDnsHealth(
			currentDomain.id,
			organizationId,
		);

		if (!dnsHealthCheck.isHealthy) {
			const errorMessage = `Domain ${domainName} has invalid or missing DNS records: ${dnsHealthCheck.missingRecords.join(", ")}. Please verify your DNS records are configured correctly.`;
			throw new Error(errorMessage);
		}

		// Create emailLog record BEFORE sending (status: pending)
		// so we have the ID to inject as X-Email-Log-ID tracking header
		const [logRecord] = await db
			.insert(emailLog)
			.values({
				messageId: `pending_${Date.now()}_${Math.random().toString(36).slice(2)}`,
				organizationId,
				domainId: currentDomain.id,
				fromEmail: emailData.from,
				fromName: emailData.from.split("@")[0],
				toEmails: Array.isArray(emailData.to)
					? emailData.to
					: [emailData.to],
				ccEmails: emailData.cc
					? Array.isArray(emailData.cc)
						? emailData.cc
						: [emailData.cc]
					: undefined,
				bccEmails: emailData.bcc
					? Array.isArray(emailData.bcc)
						? emailData.bcc
						: [emailData.bcc]
					: undefined,
				replyTo: emailData.replyTo,
				subject: emailData.subject,
				textBody: emailData.text,
				htmlBody: emailData.html,
				status: "pending",
				provider: "kumomta",
				size: (emailData.text?.length || 0) + (emailData.html?.length || 0),
			})
			.returning({ id: emailLog.id });

		const emailLogId = logRecord?.id;
		if (!emailLogId) {
			throw new Error("Failed to create email log record");
		}

		// Send email via KumoMTA HTTP injection API with tracking headers
		const result = await kumomtaClient.sendEmail({
			from: emailData.from,
			to: emailData.to,
			subject: emailData.subject,
			text: emailData.text,
			html: emailData.html,
			replyTo: emailData.replyTo,
			cc: emailData.cc,
			bcc: emailData.bcc,
			customHeaders: {
				"X-Org-ID": organizationId,
				"X-Domain-ID": currentDomain.id,
				"X-Email-Log-ID": emailLogId,
			},
		});

		// Update emailLog to "sent" with the real message ID from KumoMTA
		await db
			.update(emailLog)
			.set({
				messageId: result.messageId || emailLogId,
				status: "sent",
				providerMessageId: result.id,
				sentAt: new Date(),
			})
			.where(eq(emailLog.id, emailLogId));

		logger.info(
			{
				emailLogId,
				messageId: result.messageId,
				from: emailData.from,
				to: emailData.to,
				organizationId,
			},
			"Email sent and logged successfully",
		);

		return {
			success: true,
			messageId: result.messageId,
			status: "sent",
			timestamp,
		};
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		logger.error(
			{
				error: errorMessage,
				from: emailData.from,
				to: emailData.to,
				organizationId,
			},
			"Failed to send email",
		);

		throw error;
	}
}

export async function sendEmailHandler(
	organizationId: string,
	body: MailTypes.SendEmailRequest,
): Promise<MailTypes.SendEmailHandlerResponse> {
	logger.info(
		{
			from: body.from,
			to: body.to,
			organizationId,
		},
		"Sending email",
	);

	try {
		const result = await sendEmail(body, organizationId);
		logger.info(
			{
				from: body.from,
				to: body.to,
				organizationId,
			},
			"Email sent successfully",
		);

		return result;
	} catch (error) {
		logger.error(
			{
				from: body.from,
				to: body.to,
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error sending email",
		);
		throw error;
	}
}

/**
 * Checks if domain has valid DNS records configured for email sending
 * Returns lightweight check using cached domain status first, then DNS records table
 */
async function checkDomainDnsHealth(
	domainId: string,
	organizationId: string,
): Promise<{
	isHealthy: boolean;
	missingRecords: string[];
}> {
	// Quick check using cached domain status
	const domainData = await db.query.domain.findFirst({
		where: and(
			eq(domain.id, domainId),
			eq(domain.organizationId, organizationId),
		),
		columns: {
			id: true,
			domain: true,
			systemVerified: true,
			status: true,
			lastVerifiedAt: true,
		},
	});

	if (!domainData) {
		return {
			isHealthy: false,
			missingRecords: ["Domain not found"],
		};
	}

	// If domain status indicates DNS is configured and verified, and recently checked, skip detailed check
	const STALE_THRESHOLD_HOURS = 6;
	const lastVerified = domainData.lastVerifiedAt;
	const isRecent = lastVerified
		? Date.now() - new Date(lastVerified).getTime() <
		STALE_THRESHOLD_HOURS * 60 * 60 * 1000
		: false;

	if (domainData.systemVerified && domainData.status === "active" && isRecent) {
		return {
			isHealthy: true,
			missingRecords: [],
		};
	}

	// Perform detailed check on DNS records table if cached status is uncertain
	const requiredRecordTypes = ["SPF", "DKIM", "DMARC"];
	const dnsRecords = await db
		.select({
			recordType: domainDnsRecord.recordType,
			status: domainDnsRecord.status,
		})
		.from(domainDnsRecord)
		.where(
			and(
				eq(domainDnsRecord.domainId, domainId),
				eq(domainDnsRecord.organizationId, organizationId),
				inArray(
					domainDnsRecord.recordType,
					requiredRecordTypes as (typeof dnsRecordTypeEnum.enumValues)[number][],
				),
			),
		)
		.limit(10);

	const foundRecordTypes = new Set(
		dnsRecords.filter((r) => r.status === "active").map((r) => r.recordType),
	);

	const missingRecords = requiredRecordTypes.filter(
		(type) =>
			!foundRecordTypes.has(
				type as (typeof dnsRecordTypeEnum.enumValues)[number],
			),
	);

	const isHealthy = missingRecords.length === 0;

	if (!isHealthy) {
		logger.warn(
			{
				domainId,
				missingRecords,
				foundRecords: Array.from(foundRecordTypes),
			},
			"Domain DNS health check failed",
		);
	}

	return {
		isHealthy,
		missingRecords,
	};
}
