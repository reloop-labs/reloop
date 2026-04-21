import "dotenv/config";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { landing } from "@reloop/be-mail/routes/landing/landing.index.js";
import { mailRoutes } from "@reloop/be-mail/routes/mail/mail.routes.js";
import { loader } from "@reloop/be-mail/utils/loader.js";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";
import { initLogger } from "evlog";
import { evlog } from "evlog/elysia";
import { mailConfig } from "./mail.config";

initLogger({ env: { service: "mail" } });

const port = mailConfig.port;
const mailService = new Elysia({
	prefix: "/api/mail",
	name: "Mail Service",
})
	.use(evlog())
	.use(openapi())
	.use(serverTiming())
	.use(landing)
	.use(mailRoutes)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		logger.info(`Mail Server is running on http://localhost:${port}/api/mail`);
	});

export type MailService = typeof mailService;
