import { withDeadline } from "@be/tool/utils/deadline";
import { redis } from "@be/tool/utils/loader";
import { loadCatalogue } from "@reloop/email-validation";
import { Elysia } from "elysia";

export const healthRoute = new Elysia().get(
	"/health",
	async () => {
		const startTime = Date.now();

		let redisStatus: "connected" | "unavailable";
		try {
			await withDeadline(redis.healthCheck(), 1_000, "Redis");
			redisStatus = "connected";
		} catch {
			redisStatus = "unavailable";
		}

		try {
			const { disposable } = loadCatalogue();
			if (disposable.size === 0) {
				throw new Error("Disposable catalogue is empty");
			}

			return {
				status: "CONNECTED",
				success: true,
				redis: redisStatus,
				catalogueSize: disposable.size,
				responseTime: `${Date.now() - startTime}ms`,
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			return {
				status: "DISCONNECTED",
				success: false,
				redis: redisStatus,
				error: error instanceof Error ? error.message : String(error),
				timestamp: new Date().toISOString(),
			};
		}
	},
	{ detail: { hide: true } },
);
