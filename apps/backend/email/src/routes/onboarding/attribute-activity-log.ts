import { createId } from "@paralleldrive/cuid2";
import { db } from "@reloop/db/client";
import { activityLog } from "@reloop/db/schema";
import { emailConfig } from "@reloop/email/email.config";
import {
	ONBOARDING_TEST_SUBJECT,
	ONBOARDING_TEST_TEXT,
} from "@reloop/email/routes/onboarding/onboarding.constants";
import { eq, or, sql } from "drizzle-orm";
import { log } from "evlog";

/** Public mail API path shown on the Logs page. */
const MAIL_SEND_ENDPOINT = "/api/mail/v1/send";

/**
 * Build the request body customers would send to POST /api/mail/v1/send.
 * Shown as "Request body" on the Logs detail panel.
 */
function buildMailSendRequestBody({
	from,
	to,
	subject,
	text,
	html,
}: {
	from: string;
	to: string;
	subject: string;
	text: string;
	html: string;
}): Record<string, unknown> {
	return {
		from,
		to,
		subject,
		text,
		html,
	};
}

/**
 * Build the success response shape for a mail send.
 * Shown as "Response body" (activity_log.metadata) on the Logs detail panel.
 */
function buildMailSendResponseMetadata({
	emailLogId,
	timestamp,
}: {
	emailLogId: string;
	timestamp?: Date;
}): Record<string, unknown> {
	const ts = (timestamp ?? new Date()).toISOString();
	return {
		id: emailLogId,
		status: "sent",
		success: true,
		messageId: emailLogId,
		timestamp: ts,
		email_log_id: emailLogId,
	};
}

/**
 * Reassign (or insert) the activity_log row for an onboarding email send
 * so it appears under the customer workspace on the Logs page
 * (GET /api/logs/v1/list filters by activity_log.organization_id).
 *
 * request_body  → mail send payload (Request body in UI)
 * metadata      → mail send response (Response body in UI)
 */
export async function attributeOnboardingActivityLog({
	emailLogId,
	organizationId,
	userId,
	apikeyId,
	to,
	from,
	subject = ONBOARDING_TEST_SUBJECT,
	text = ONBOARDING_TEST_TEXT,
	html = ONBOARDING_TEST_TEXT,
	sentAt,
}: {
	emailLogId: string;
	organizationId: string;
	userId: string;
	apikeyId?: string;
	to: string;
	from: string;
	subject?: string;
	text?: string;
	html?: string;
	sentAt?: Date;
}): Promise<{ updated: boolean; inserted: boolean }> {
	const requestBody = buildMailSendRequestBody({
		from,
		to,
		subject,
		text,
		html,
	});
	const metadata = buildMailSendResponseMetadata({
		emailLogId,
		timestamp: sentAt,
	});
	const requestDetails = {
		endpoint: MAIL_SEND_ENDPOINT,
		method: "POST",
		statusCode: 200,
		requestBody,
	};

	try {
		const updated = await db
			.update(activityLog)
			.set({
				organizationId,
				userId,
				actorType: apikeyId ? "api_key" : "user",
				actorId: apikeyId ?? userId,
				requestDetails,
				requestBody,
				metadata,
				statusCode: 200,
				service: "mail",
				action: "sent",
				resourceType: "email",
				resourceId: emailLogId,
			})
			.where(
				or(
					eq(activityLog.resourceId, emailLogId),
					sql`${activityLog.metadata}->>'email_log_id' = ${emailLogId}`,
					sql`${activityLog.metadata}->>'id' = ${emailLogId}`,
				),
			)
			.returning({ id: activityLog.id });

		if (updated.length > 0) {
			return { updated: true, inserted: false };
		}

		// Platform mail may not have written activity under a findable resource id
		// (or SMTP fallback never produced one). Insert a customer-visible event.
		await db.insert(activityLog).values({
			id: `req_${createId()}`,
			event: "email.sent",
			level: "info",
			userId,
			organizationId,
			metadata,
			requestDetails,
			requestBody,
			statusCode: 200,
			actorType: apikeyId ? "api_key" : "user",
			actorId: apikeyId ?? userId,
			resourceType: "email",
			resourceId: emailLogId,
			service: "mail",
			action: "sent",
			environment:
				emailConfig.NODE_ENV === "production" ? "production" : "development",
		});

		return { updated: false, inserted: true };
	} catch (error) {
		log.error({
			error: error instanceof Error ? error.message : String(error),
			emailLogId,
			organizationId,
			message: "Failed to attribute onboarding activity_log",
		});
		return { updated: false, inserted: false };
	}
}
