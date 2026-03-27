import { redis } from "@be/contacts/utils/loader";
import { Elysia } from "elysia";

export const healthRedisRoute = new Elysia().get(
	"/health/redis",
	async () => {
		try {
			const startTime = Date.now();
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
	{
		detail: {
			hide: true
		}
	},
);
