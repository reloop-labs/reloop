import { sendSlackSigninNotification } from "@reloop/admin/services/slack/slack.service";
import { redis } from "@reloop/admin/utils/redis";
import { BusEvent, bus, type SigninDetectedPayload } from "@reloop/bus";
import { db } from "@reloop/db/client";
import { user } from "@reloop/db/schema";
import { eq } from "drizzle-orm";
import { log } from "evlog";

const SIGNIN_DEDUP_TTL_SECONDS = 60;

async function alreadyNotified(key: string): Promise<boolean> {
	const existing = await redis.get(key);
	if (existing) return true;
	await redis.set(key, "1", SIGNIN_DEDUP_TTL_SECONDS);
	return false;
}

async function userIdForEmail(email: string): Promise<string | null> {
	const [found] = await db
		.select({ id: user.id })
		.from(user)
		.where(eq(user.email, email))
		.limit(1);
	return found?.id ?? null;
}

export async function initSigninSubscriber() {
	try {
		await bus.subscribe(
			BusEvent.USER_CREATED,
			async (payload) => {
				try {
					const dedupKey = `slack:signin:${payload.email}`;
					if (await alreadyNotified(dedupKey)) {
						log.warn(
							"server",
							`Duplicate USER_CREATED Slack alert for ${payload.email}, skipping`,
						);
						return;
					}

					await sendSlackSigninNotification({
						email: payload.email,
						fullName: payload.name || "User",
						userId: payload.id,
						isNewUser: true,
					});
				} catch (err) {
					log.error({
						error: err instanceof Error ? err.message : String(err),
						email: payload.email,
						message: "Failed to process USER_CREATED bus event for Slack alert",
					});
				}
			},
			{ queue: "admin-slack-worker" },
		);

		await bus.subscribe(
			BusEvent.SIGNIN_DETECTED,
			async (payload: SigninDetectedPayload) => {
				try {
					const dedupKey = `slack:signin:${payload.email}`;
					if (await alreadyNotified(dedupKey)) {
						log.warn(
							"server",
							`Duplicate SIGNIN_DETECTED Slack alert for ${payload.email}, skipping`,
						);
						return;
					}

					let userId: string | null = null;
					try {
						userId = await userIdForEmail(payload.email);
					} catch (err) {
						log.warn({
							error: err instanceof Error ? err.message : String(err),
							email: payload.email,
							message: "Could not resolve user id for sign-in Slack alert",
						});
					}

					await sendSlackSigninNotification({
						email: payload.email,
						fullName: payload.fullName,
						userId,
						browser: payload.browser,
						os: payload.os,
						ip: payload.ip,
						location: payload.location,
					});
				} catch (err) {
					log.error({
						error: err instanceof Error ? err.message : String(err),
						email: payload.email,
						message:
							"Failed to process SIGNIN_DETECTED bus event for Slack alert",
					});
				}
			},
			{ queue: "admin-slack-worker" },
		);

		log.info("server", "Slack sign-in subscriber registered");
	} catch (error) {
		log.error({
			error: error instanceof Error ? error.message : String(error),
			message: "Failed to initialize sign-in subscriber for Slack alerts",
		});
	}
}
