import "dotenv/config";
import cors from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";
import { billingConfig } from "./billing.config";
import { loader } from "./loader";
import { billingRoutes } from "./routes/billing/billing.routes";
import { landing } from "./routes/landing/landing.index";

const port = billingConfig.port;

const app = new Elysia({ prefix: "/api/billing", name: "Billing Service" })
	.use(cors({ origin: "*", credentials: true }))
	.use(
		openapi({
			documentation: {
				info: {
					title: "Billing Service",
					version: "1.0.0",
				},
				components: {
					securitySchemes: {
						cookieAuth: { type: "apiKey", in: "cookie", name: "better-auth.session_token" },
					},
				},
			},
		}),
	)
	.use(landing)
	.use(billingRoutes)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		logger.info(
			`Billing Server is running on http://localhost:${port}/api/billing`,
		);
	});

export type App = typeof app;
