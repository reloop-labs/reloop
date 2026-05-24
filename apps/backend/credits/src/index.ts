import { log } from "evlog";
import "dotenv/config";
import cors from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";

import { Elysia } from "elysia";
import { creditsConfig } from "./credits.config";
import { loader } from "./loader";
import { creditsRoutes } from "./routes/credits/credits.routes";
import { landing } from "./routes/landing/landing.index";

const port = creditsConfig.PORT;

const app = new Elysia({ prefix: "/api/credits", name: "Credits Service" })
	.use(cors({ origin: "*", credentials: true }))
	.use(
		openapi({
			documentation: {
				info: {
					title: "Credits Service",
					version: "1.0.0",
				},
				components: {
					securitySchemes: {
						cookieAuth: {
							type: "apiKey",
							in: "cookie",
							name: "better-auth.session_token",
						},
					},
				},
			},
		}),
	)
	.use(landing)
	.use(creditsRoutes)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		log.info(
			"server",
			`Credits Server is running on http://localhost:${port}/api/credits`,
		);
	});

export type App = typeof app;
