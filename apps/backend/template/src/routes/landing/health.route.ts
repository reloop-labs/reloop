import { bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import { Elysia } from "elysia";

export const healthRoute = new Elysia().get(
	"/health",
	async () => {
		try {
			const startTime = Date.now();
			await db.execute("SELECT 1 as test");
			await bus.healthCheck();
			const responseTime = Date.now() - startTime;

			return {
				status: "CONNECTED",
				success: true,
				responseTime: `${responseTime}ms`,
				timestamp: new Date().toISOString(),
			};
		} catch {
			// M-3 fix: never expose raw infrastructure error strings (connection
			// strings, hostnames, TLS details) in a public unauthenticated endpoint.
			// The real error is captured by the OpenTelemetry layer.
			return {
				status: "DISCONNECTED",
				success: false,
				timestamp: new Date().toISOString(),
			};
		}
	},
	{ detail: { hide: true } },
);
