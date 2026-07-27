import { db } from "@reloop/db/client";
import { redis } from "@reloop/logs/utils/loader";
import { sql } from "drizzle-orm";
import { Elysia } from "elysia";

export const healthRoute = new Elysia().get(
	"/health",
	async () => {
		try {
			const startTime = Date.now();
			await db.execute(sql`SELECT 1`);
			await redis.healthCheck();
			const responseTime = Date.now() - startTime;

			return {
				status: "CONNECTED",
				responseTime: `${responseTime}ms`,
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			return {
				status: "DISCONNECTED",
				error: error instanceof Error ? error.message : String(error),
				timestamp: new Date().toISOString(),
			};
		}
	},
	{ detail: { hide: true } },
);
