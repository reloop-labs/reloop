import { cron } from "@elysiajs/cron";
import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import { emailEvent, emailLog } from "@reloop/db/schema";
import { and, eq, inArray, lt } from "drizzle-orm";
import { log } from "evlog";

const STUCK_AFTER_MINUTES = 15;
const BATCH_LIMIT = 100;

/**
 * Pending is never terminal: SMTP log-incoming inserts pending and the
 * logs-kumomta-worker moves it on Reception/Delivery/Bounce/etc.
 * If no email_event arrived within 15m, Kumo never emitted Reception
 * (NATS publish failed, worker down, message lost) — mark failed so the
 * dashboard stops showing a stuck "Pending" with no further updates.
 * Rows with events (e.g. deferred TransientFailure retries) are left alone;
 * Kumo Expiration will fail them if delivery never succeeds.
 */
async function reconcileStuckPending() {
	const cutoff = new Date(Date.now() - STUCK_AFTER_MINUTES * 60 * 1000);

	const stuck = await db
		.select({
			id: emailLog.id,
			organizationId: emailLog.organizationId,
		})
		.from(emailLog)
		.where(and(eq(emailLog.status, "pending"), lt(emailLog.createdAt, cutoff)))
		.limit(BATCH_LIMIT);

	if (stuck.length === 0) return;

	const ids = stuck.map((r) => r.id);
	const withEvents = await db
		.select({ emailLogId: emailEvent.emailLogId })
		.from(emailEvent)
		.where(inArray(emailEvent.emailLogId, ids));

	const eventIds = new Set(withEvents.map((e) => e.emailLogId));
	const orphaned = stuck.filter((r) => !eventIds.has(r.id));
	if (orphaned.length === 0) return;

	const orphanIds = orphaned.map((r) => r.id);
	await db
		.update(emailLog)
		.set({
			status: "failed",
			errorMessage: `No Reception from KumoMTA within ${STUCK_AFTER_MINUTES} minutes (stuck pending, auto-reconciled)`,
			failedAt: new Date(),
		})
		.where(inArray(emailLog.id, orphanIds));

	const timestamp = new Date().toISOString();
	for (const row of orphaned) {
		await bus
			.publish(BusEvent.EMAIL_FAILED, {
				organizationId: row.organizationId,
				emailLogId: row.id,
				errorMessage: "Delivery failed: no Reception from mail server",
				timestamp,
			})
			.catch(() => {});
	}

	log.warn({
		count: orphaned.length,
		message: `Reconciled ${orphaned.length} stuck pending email(s) to failed`,
	});
}

export const reconcilePendingCron = cron({
	name: "reconcile-stuck-pending",
	pattern: "*/5 * * * *",
	async run() {
		try {
			await reconcileStuckPending();
		} catch (error) {
			log.error({
				error: error instanceof Error ? error.message : String(error),
				message: "Failed to reconcile stuck pending emails",
			});
		}
	},
});
