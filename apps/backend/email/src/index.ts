import { log } from "evlog";
import "dotenv/config";
import cors from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { emailConfig } from "@reloop/email/email.config";
import { agentCardRoute } from "@reloop/email/routes/landing/agent-card.route";
import { healthRoute } from "@reloop/email/routes/landing/health.route";
import { landingRoute } from "@reloop/email/routes/landing/landing.route";
import { loader } from "@reloop/email/utils/loader";
import { Elysia } from "elysia";

const port = emailConfig.port;

const app = new Elysia({ prefix: "/api/email", name: "Email Service" })
	.use(cors({ origin: "*" }))
	.use(
		openapi({
			documentation: {
				info: {
					title: "Email Service",
					version: "1.0.0",
				},
			},
		}),
	)
	.use(landingRoute)
	.use(healthRoute)
	.use(agentCardRoute)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		log.info(
			"server",
			`Email Server is running on http://localhost:${port}/api/email`,
		);
	});

export type App = typeof app;
