import "dotenv/config";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { landing } from "@reloop/be-mailing/routes/landing/landing.index.js";
import { mailRoutes } from "@reloop/be-mailing/routes/mail/mail.routes.js";
import { loader } from "@reloop/be-mailing/utils/loader.js";

import { Elysia } from "elysia";
import { initLogger, log, parseError } from "evlog";
import { evlog } from "evlog/elysia";
import { mailConfig } from "./mail.config";

initLogger({ env: { service: "mailing" } });

const port = mailConfig.port;
const mailService = new Elysia({
	prefix: "/api/mail",
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
	.use(landing)
	.use(mailRoutes)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		log.info(
			"server",
			`Mail Server is running on http://localhost:${port}/api/mail`,
		);
	});

export type MailService = typeof mailService;
