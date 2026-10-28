import { cron } from "@elysiajs/cron";
import { logsConfig } from "../logs.config";
import {
	countExpiredEmailLogs,
	deleteExpiredEmailLogs,
	parseRetentionMode,
} from "../utils/email-retention";

/**
 * Daily sent-email retention (plan `dataRetentionDays`, 45 by default).
 * EMAIL_RETENTION_MODE: "dry-run" (default) only reports what would be
 * deleted; "enforce" deletes; "off" skips.
 */
export const emailRetentionCron = cron({
	name: "email-retention",
	pattern: "0 2 * * *", // Every day at 02:00
	async run() {
		const mode = parseRetentionMode(logsConfig.EMAIL_RETENTION_MODE);
		if (mode === "off") return;

		try {
			if (mode === "dry-run") {
				const perOrg = await countExpiredEmailLogs();
				const total = perOrg.reduce((sum, row) => sum + row.expired, 0);
				console.log(
					`[Cron] Email retention dry run: ${total} sent-email logs past retention across ${perOrg.length} organizations. Nothing deleted.`,
					perOrg,
				);
				return;
			}

			const deleted = await deleteExpiredEmailLogs();
			console.log(
				`[Cron] Email retention: deleted ${deleted} sent-email logs past retention.`,
			);
		} catch (error) {
			console.error("[Cron] Email retention failed:", error);
		}
	},
});
