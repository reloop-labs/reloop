import { sendSlackEmailFailureNotification } from "@reloop/admin/services/slack/slack.service";
import { BusEvent, bus, type EmailFailedPayload } from "@reloop/bus";
import { db } from "@reloop/db/client";
import { emailLog, organization } from "@reloop/db/schema";
import { eq } from "drizzle-orm";
import { log } from "evlog";

export async function initEmailFailedSubscriber() {
	try {
		await bus.subscribe(
			BusEvent.EMAIL_FAILED,
			async (payload: EmailFailedPayload) => {
				try {
					const [logEntry] = await db
						.select({
							id: emailLog.id,
							organizationId: emailLog.organizationId,
							fromEmail: emailLog.fromEmail,
							toEmails: emailLog.toEmails,
							subject: emailLog.subject,
							errorMessage: emailLog.errorMessage,
						})
						.from(emailLog)
						.where(eq(emailLog.id, payload.emailLogId))
						.limit(1);

					const orgId = logEntry?.organizationId || payload.organizationId;
					let orgName: string | null = null;
					if (orgId) {
						const [org] = await db
							.select({ name: organization.name })
							.from(organization)
							.where(eq(organization.id, orgId))
							.limit(1);
						orgName = org?.name ?? null;
					}

					let toEmails: string[] = [];
					if (Array.isArray(logEntry?.toEmails)) {
						toEmails = logEntry.toEmails.filter(
							(e): e is string => typeof e === "string",
						);
					} else if (typeof logEntry?.toEmails === "string") {
						try {
							const parsed = JSON.parse(logEntry.toEmails);
							toEmails = Array.isArray(parsed)
								? parsed.filter((e): e is string => typeof e === "string")
								: [logEntry.toEmails];
						} catch {
							toEmails = [logEntry.toEmails];
						}
					}

					await sendSlackEmailFailureNotification({
						emailLogId: payload.emailLogId,
						fromEmail: logEntry?.fromEmail || "unknown@mail.reloop.sh",
						toEmails,
						subject: logEntry?.subject || "(No Subject)",
						errorMessage:
							payload.errorMessage ||
							logEntry?.errorMessage ||
							"Delivery failed",
						orgName,
						orgId,
					});
				} catch (err) {
					log.error({
						error: err instanceof Error ? err.message : String(err),
						emailLogId: payload.emailLogId,
						message: "Failed to process EMAIL_FAILED bus event for Slack alert",
					});
				}
			},
		);

		log.info("server", "Slack Email Failed subscriber registered");
	} catch (error) {
		log.error({
			error: error instanceof Error ? error.message : String(error),
			message: "Failed to initialize Email Failed subscriber for Slack alerts",
		});
	}
}
