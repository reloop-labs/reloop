import "dotenv/config";
import { serverTiming } from "@elysiajs/server-timing";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import logixlysia from "logixlysia";
import { landing } from "./landing";
import { auth, OpenAPI } from "./lib/auth";
import { loader } from "./loader";

const port = Number(process.env.PORT || 3000);

const app = new Elysia({ prefix: "/api/auth", name: "Auth Service" })
	.use(serverTiming())
	.use(
		logixlysia({
			config: {
				showStartupMessage: true,
				startupMessageFormat: "simple",
				timestamp: { translateTime: "dd-mm-yyyy HH:MM:ss.SSS" },
				logFilePath: "./logs/example.log",
				ip: true,
				customLogFormat:
					"🦊 {now} {level} {duration} {method} {pathname} {status} {message} {ip}",
			},
		}),
	)
	.use(
		swagger({
			path: "/docs",
			documentation: {
				components: await OpenAPI.components(),
				paths: await OpenAPI.getPaths(),
			},
		}),
	)
	.mount("/", auth.handler)
	.use(landing)
	.get("/stats/users", async () => {
		try {
			const { db } = await import("./db/pg");
			const { user } = await import("./db/schema/auth");
			const { count } = await import("drizzle-orm");

			const result = await db.select({ total: count() }).from(user);

			const totalUsers = result[0]?.total || 0;

			return {
				totalUsers,
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			console.error("❌ Error fetching user count:", error);
			console.error("🔍 Error details:", {
				message: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			});
			return {
				error: "Failed to fetch user count",
				totalUsers: 0,
				timestamp: new Date().toISOString(),
			};
		}
	})
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		console.log(`Auth Server is running on http://localhost:${port}/api/auth`);
	});

export type App = typeof app;
