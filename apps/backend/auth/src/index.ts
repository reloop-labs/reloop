import "dotenv/config";
import { serverTiming } from "@elysiajs/server-timing";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import logixlysia from "logixlysia";
import { landing } from "./landing";
import { auth, OpenAPI } from "./lib/auth";

new Elysia({ prefix: "/api/auth", name: "Auth Service" })
	.use(
		logixlysia({
			config: {
				useColors: true,
				showStartupMessage: true,
				startupMessageFormat: "banner",
				timestamp: {
					translateTime: "HH:MM:ss.SSS yyyy-mm-dd",
				},
				ip: true,
			},
		}),
	)
	.use(serverTiming())
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
	.listen(3000, () => {
		console.log("Server is running on http://localhost:3000/api/auth/docs");
	});
