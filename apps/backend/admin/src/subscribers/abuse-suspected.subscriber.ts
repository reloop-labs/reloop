import { sendSlackAbuseNotification } from "@reloop/admin/services/slack/slack.service";
import { redis } from "@reloop/admin/utils/redis";
import { type AbuseSuspectedPayload, BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import { organization } from "@reloop/db/schema";
import { eq } from "drizzle-orm";
import { log } from "evlog";

const ABUSE_DEDUP_TTL_SECONDS = 15 * 60;

async function alreadyNotified(orgId: string): Promise<boolean> {
	const key = `slack:abuse:${orgId}`;
	const existing = await redis.get(key);
	if (existing) return true;
	await redis.set(key, "1", ABUSE_DEDUP_TTL_SECONDS);
	return false;
}

async function orgNameFor(orgId: string): Promise<string | null> {
	const [org] = await db
		.select({ name: organization.name })
		.from(organization)
		.where(eq(organization.id, orgId))
		.limit(1);
	return org?.name ?? null;
}

export async function initAbuseSuspectedSubscriber() {
	try {
		await bus.subscribe(
			BusEvent.ABUSE_SUSPECTED,
			async (payload: AbuseSuspectedPayload) => {
				try {
					if (await alreadyNotified(payload.organizationId)) {
						log.warn(
							"server",
							`Duplicate abuse Slack alert for ${payload.organizationId}, skipping`,
						);
						return;
					}

					let orgName: string | null = null;
					try {
						orgName = await orgNameFor(payload.organizationId);
					} catch (err) {
						log.warn({
							error: err instanceof Error ? err.message : String(err),
							organizationId: payload.organizationId,
							message: "Could not enrich abuse Slack alert from database",
						});
					}

					await sendSlackAbuseNotification({
						organizationId: payload.organizationId,
						emailLogId: payload.emailLogId,
						fromEmail: payload.fromEmail,
						subject: payload.subject,
						recipientCount: payload.recipientCount,
						severity: payload.severity,
						reasons: payload.reasons,
						action: payload.action,
						orgName,
					});
				} catch (err) {
					log.error({
						error: err instanceof Error ? err.message : String(err),
						organizationId: payload.organizationId,
						message:
							"Failed to process ABUSE_SUSPECTED bus event for Slack alert",
					});
				}
			},
			{ queue: "admin-slack-worker" },
		);

		log.info("server", "Slack abuse-suspected subscriber registered");
	} catch (error) {
		log.error({
			error: error instanceof Error ? error.message : String(error),
			message:
				"Failed to initialize abuse-suspected subscriber for Slack alerts",
		});
	}
}
