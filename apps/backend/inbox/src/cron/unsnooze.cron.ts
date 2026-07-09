import { cron } from "@elysiajs/cron";
import { db } from "@reloop/db/client";
import { emailThread } from "@reloop/db/schema";
import { and, isNotNull, lte } from "drizzle-orm";

/**
 * Wake snoozed threads whose wake time has passed.
 * Runs every minute.
 */
export const unsnoozeCron = cron({
	name: "unsnooze-threads",
	pattern: "* * * * *",
	async run() {
		try {
			const now = new Date();
			const result = await db
				.update(emailThread)
				.set({ snoozedUntil: null })
				.where(
					and(
						isNotNull(emailThread.snoozedUntil),
						lte(emailThread.snoozedUntil, now),
					),
				)
				.returning({ id: emailThread.id });

			if (result.length > 0) {
				console.log(
					`[Cron] Unsnoozed ${result.length} thread(s): ${result.map((r) => r.id).join(", ")}`,
				);
			}
		} catch (error) {
			console.error("[Cron] Unsnooze failed:", error);
		}
	},
});
