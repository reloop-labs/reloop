import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import {
	and,
	count,
	eq,
	inArray,
	lt,
	notExists,
	type SQL,
	sql,
} from "drizzle-orm";

/**
 * Sent-email retention: deletes email_log rows (and, by cascade, their
 * email_event rows) older than the organization's plan `dataRetentionDays`.
 *
 * Kept on purpose:
 *  - Logs linked to inbox thread messages (mailbox conversations).
 *  - email_send billing rows (their email_log_id is cleared, not deleted).
 *  - Contacts and suppressions, which live in other tables.
 */

export type EmailRetentionMode = "off" | "dry-run" | "enforce";

/** Plan default; used when an organization has no plan row. */
export const DEFAULT_RETENTION_DAYS = 45;
const BATCH_SIZE = 1000;
/** Caps one run at 500k rows; the next day's run continues. */
const MAX_BATCHES_PER_RUN = 500;

export function parseRetentionMode(
	value: string | undefined,
): EmailRetentionMode {
	return value === "off" || value === "enforce" ? value : "dry-run";
}

function expiredCondition(): SQL | undefined {
	const retentionDays = sql`coalesce(${schema.organizationPlan.dataRetentionDays}, ${sql.raw(String(DEFAULT_RETENTION_DAYS))})`;
	return and(
		lt(
			schema.emailLog.createdAt,
			sql`now() - make_interval(days => ${retentionDays})`,
		),
		notExists(
			db
				.select({ one: sql`1` })
				.from(schema.threadMessage)
				.where(eq(schema.threadMessage.emailLogId, schema.emailLog.id)),
		),
	);
}

/** Expired logs per organization, without deleting anything. */
export async function countExpiredEmailLogs(): Promise<
	{ organizationId: string; expired: number }[]
> {
	return db
		.select({
			organizationId: schema.emailLog.organizationId,
			expired: count(),
		})
		.from(schema.emailLog)
		.leftJoin(
			schema.organizationPlan,
			eq(
				schema.organizationPlan.organizationId,
				schema.emailLog.organizationId,
			),
		)
		.where(expiredCondition())
		.groupBy(schema.emailLog.organizationId);
}

/** Deletes expired logs in batches. Returns the number of logs deleted. */
export async function deleteExpiredEmailLogs(): Promise<number> {
	let deleted = 0;

	for (let batch = 0; batch < MAX_BATCHES_PER_RUN; batch++) {
		const rows = await db
			.select({ id: schema.emailLog.id })
			.from(schema.emailLog)
			.leftJoin(
				schema.organizationPlan,
				eq(
					schema.organizationPlan.organizationId,
					schema.emailLog.organizationId,
				),
			)
			.where(expiredCondition())
			.limit(BATCH_SIZE);
		if (rows.length === 0) break;

		const ids = rows.map((row) => row.id);
		await db.transaction(async (tx) => {
			// email_send has no ON DELETE action; keep the billing row, drop the link.
			await tx
				.update(schema.emailSend)
				.set({ emailLogId: null })
				.where(inArray(schema.emailSend.emailLogId, ids));
			await tx.delete(schema.emailLog).where(inArray(schema.emailLog.id, ids));
		});

		deleted += ids.length;
		if (rows.length < BATCH_SIZE) break;
	}

	return deleted;
}
