import "dotenv/config";
import cors from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { initLogger, log, parseError } from "evlog";
import { evlog } from "evlog/elysia";
import { creditsConfig } from "./credits.config";
import { loader } from "./loader";
import { creditsRoutes } from "./routes/credits/credits.routes";
import { agentCardRoute } from "./routes/landing/agent-card.route";
import { healthRoute } from "./routes/landing/health.route";
import { landingRoute } from "./routes/landing/landing.route";

initLogger({ env: { service: "credits" } });

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
	.use(evlog())
	.use(landingRoute)
	.use(healthRoute)
	.use(agentCardRoute)
	.use(creditsRoutes)
	.onError(({ error, set }) => {
		const parsed = parseError(error);
		set.status = parsed.status;
		return {
			message: parsed.message,
			why: parsed.why,
			fix: parsed.fix,
			link: parsed.link,
		};
	})
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		log.info(
			"Credits Service",
			`Running on:\n  - Local: http://localhost:${port}/api/credits\n  - Base:  ${creditsConfig.BASE_URL}/api/credits`,
		);
	});

export type App = typeof app;
