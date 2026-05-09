import "dotenv/config";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { landing } from "@reloop/be-mailing/routes/landing/landing.index.js";
import { mailRoutes } from "@reloop/be-mailing/routes/mail/mail.routes.js";
import { loader } from "@reloop/be-mailing/utils/loader.js";
import { errorMiddleware } from "./middleware/error";

import { Elysia } from "elysia";
import { initLogger, log } from "evlog";
import { evlog } from "evlog/elysia";
import { mailConfig } from "./mail.config";

initLogger({ env: { service: "mailing" } });

const port = mailConfig.port;
const mailService = new Elysia({
	prefix: "/api/mailing",
	name: "Mailing Service",
})
	.use(evlog())
	.use(
		openapi({
			documentation: {
				info: {
					title: "Mail Service",
					version: "1.0.0",
				},
				components: {
					securitySchemes: {
						apiKey: {
							type: "apiKey",
							name: "x-api-key",
							in: "header",
						},
					},
				},
			},
		}),
	)
	.use(serverTiming())
	.use(landing)
	.use(mailRoutes)
	.use(errorMiddleware)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		log.info("server", `Mail Server is running on http://localhost:${port}/api/mail`);
	});

export type MailService = typeof mailService;
