import { cron } from "@elysiajs/cron";
import { cleanupOldLogs } from "../utils/cleanup";

/**
 * Daily cron job to cleanup logs older than 100 days.
 * Runs every day at midnight.
 */
export const logCleanupCron = cron({
	name: "cleanup-old-logs",
	pattern: "0 0 * * *", // Every day at midnight
	async run() {
		try {
			console.log("[Cron] Starting daily log cleanup...");
			await cleanupOldLogs(100);
			console.log(
				"[Cron] Log cleanup command issued successfully (100 days retention).",
			);
		} catch (error) {
			console.error("[Cron] Log cleanup failed:", error);
		}
	},
});
