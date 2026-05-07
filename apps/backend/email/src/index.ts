import cors from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";
import { emailConfig } from "./email.config";


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
	.get("/health", () => ({ status: "ok" }))
	.listen(port, () => {
		logger.info(`Email Server is running on http://localhost:${port}/api/email`);
	});

export type App = typeof app;
