import { getClickHouseClient } from "@reloop/logs/utils/clickhouse";
import { redis } from "@reloop/logs/utils/loader";
import { Elysia } from "elysia";

export const healthRoute = new Elysia().get(
	"/health",
	async () => {
		try {
			const startTime = Date.now();
			const client = getClickHouseClient();
			await client.query({ query: "SELECT 1 as test", format: "JSON" });
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
