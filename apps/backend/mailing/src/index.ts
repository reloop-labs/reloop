import "dotenv/config";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { landing } from "@reloop/be-mailing/routes/landing/landing.index.js";
import { mailRoutes } from "@reloop/be-mailing/routes/mail/mail.routes.js";
import { loader } from "@reloop/be-mailing/utils/loader.js";

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
	.onError(({ code, error, set, log }) => {
		const message = error instanceof Error ? error.message : String(error);

		if (code === "VALIDATION") {
			log?.warn("Validation error", {
				message,
				error: error.message,
			});
			set.status = 422;
			return { message: error.message };
		}

		if (message.includes("not found") || message.includes("not authorized")) {
			log?.warn("Resource not found or unauthorized", { message });
			set.status = 404;
			return { message };
		}

		log?.error("Unhandled error", {
			code,
			message,
			stack: error instanceof Error ? error.stack : undefined,
		});

		set.status = 500;
		return { message: "Internal server error" };
	})
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		log.info("server", `Mail Server is running on http://localhost:${port}/api/mail`);
	});

export type MailService = typeof mailService;
