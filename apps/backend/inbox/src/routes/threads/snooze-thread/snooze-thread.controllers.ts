import { db } from "@reloop/db/client";
import { emailThread } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";

export async function snoozeThreadController(
	id: string,
	organizationId: string,
	until: string,
) {
	const log = useLogger();
	const wakeAt = new Date(until);

	if (Number.isNaN(wakeAt.getTime()) || wakeAt.getTime() <= Date.now()) {
		throw createError({
			status: 400,
			message: "Invalid snooze time",
			why: "Snooze wake time must be a valid future datetime",
			fix: "Provide an ISO 8601 datetime in the future",
		});
	}

	const thread = await db.query.emailThread.findFirst({
		where: and(
			eq(emailThread.id, id),
			eq(emailThread.organizationId, organizationId),
		),
	});

	if (!thread) {
		throw createError({
			status: 404,
			message: "Thread not found",
			why: `Thread ${id} was not found in your organization`,
			fix: "Verify the thread ID and ensure it belongs to your organization",
		});
	}

	await db
		.update(emailThread)
		.set({
			status: "active",
			snoozedUntil: wakeAt,
			deletedAt: null,
		})
		.where(eq(emailThread.id, id));

	log.info(`[THREAD] Snoozed thread ${id} until ${wakeAt.toISOString()}`);
	return { success: true, id, snoozedUntil: wakeAt.toISOString() };
}
