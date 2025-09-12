import "dotenv/config";
import { serverTiming } from "@elysiajs/server-timing";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import logixlysia from "logixlysia";
import { landing } from "./landing";
import { auth, OpenAPI } from "./lib/auth";
import { loader } from "./loader";
import { statsRoutes } from "./routes/stats";

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
	.use(statsRoutes)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		console.log(`Auth Server is running on http://localhost:${port}/api/auth`);
	});

export type App = typeof app;
