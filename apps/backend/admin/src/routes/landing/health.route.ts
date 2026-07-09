import { db } from "@reloop/db/client";
import { Elysia } from "elysia";

export const healthRoute = new Elysia().get(
	"/health",
	async () => {
		try {
			const startTime = Date.now();
			await db.execute("SELECT 1 as test");
			const responseTime = Date.now() - startTime;

			return {
				status: "CONNECTED",
				success: true,
				responseTime: `${responseTime}ms`,
				timestamp: new Date().toISOString(),
			};
		} catch {
			return {
				status: "DISCONNECTED",
				success: false,
				timestamp: new Date().toISOString(),
			};
		}
	},
	{ detail: { hide: true } },
);
