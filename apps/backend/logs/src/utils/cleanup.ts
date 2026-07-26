import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { lt } from "drizzle-orm";

/**
 * Deletes logs older than the specified number of days.
 * @param days Retention period in days
 */
export async function cleanupOldLogs(days = 100): Promise<number> {
	const safeDays = Math.max(1, Math.floor(Number(days)));

	try {
		const cutoff = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000);
		await db
			.delete(schema.activityLog)
			.where(lt(schema.activityLog.createdAt, cutoff));
		return safeDays;
	} catch (error) {
		console.error(`Failed to cleanup logs older than ${days} days:`, error);
		throw error;
	}
}

/**
 * Deletes all logs from the database.
 */
export async function truncateLogs(): Promise<void> {
	try {
		await db.delete(schema.activityLog);
	} catch (error) {
		console.error("Failed to truncate logs table:", error);
		throw error;
	}
}
