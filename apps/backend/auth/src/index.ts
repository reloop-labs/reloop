import { log } from "evlog";
import "dotenv/config";
import cors from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";

import { Elysia } from "elysia";
import { authConfig } from "./auth.config";
import { landing } from "./landing";
import { auth, OpenAPI } from "./lib/auth";
import { loader } from "./loader";

const port = authConfig.port;

const app = new Elysia({ prefix: "/api/auth", name: "Auth Service" })
	.use(cors({ origin: "*" }))
	.use(
		openapi({
			documentation: {
				info: {
					title: "Auth Service",
					version: "1.0.0",
				},
				components: await OpenAPI.components(),
				paths: await OpenAPI.getPaths(),
			},
		}),
	)
	.mount("/", auth.handler)
	.use(landing)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		log.info(
			"server",
			`Auth Server is running on http://localhost:${port}/api/auth`,
		);
	});

export type App = typeof app;
