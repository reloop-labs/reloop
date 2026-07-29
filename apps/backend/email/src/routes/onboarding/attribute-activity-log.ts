import { createId } from "@paralleldrive/cuid2";
import { db } from "@reloop/db/client";
import { activityLog } from "@reloop/db/schema";
import { emailConfig } from "@reloop/email/email.config";
import { or, eq, sql } from "drizzle-orm";
import { log } from "evlog";

/**
 * Reassign (or insert) the activity_log row for an onboarding email send
 * so it appears under the customer workspace on the Logs page
 * (GET /api/logs/v1/list filters by activity_log.organization_id).
 */
export async function attributeOnboardingActivityLog({
	emailLogId,
	organizationId,
	userId,
	apikeyId,
	to,
	from,
	subject,
}: {
	emailLogId: string;
	organizationId: string;
	userId: string;
	apikeyId?: string;
	to: string;
	from: string;
	subject: string;
}): Promise<{ updated: boolean; inserted: boolean }> {
	// Show as the public mail send API in the Logs UI (same path customers use).
	const mailSendEndpoint = "/api/mail/v1/send";

	try {
		const updated = await db
			.update(activityLog)
			.set({
				organizationId,
				userId,
				actorType: apikeyId ? "api_key" : "user",
				actorId: apikeyId ?? userId,
				// Normalize display path even when reassigning platform rows.
				requestDetails: {
					endpoint: mailSendEndpoint,
					method: "POST",
					statusCode: 200,
				},
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
			metadata: {
				id: emailLogId,
				email_log_id: emailLogId,
				to,
				from,
				subject,
				mode: "onboarding_test",
			},
			requestDetails: {
				endpoint: mailSendEndpoint,
				method: "POST",
				statusCode: 200,
			},
			requestBody: {},
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
