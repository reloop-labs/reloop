import "dotenv/config";
import { opentelemetry } from "@elysia/opentelemetry";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { domainConfig } from "@reloop/domain/domain.config";
import { domainRoutes } from "@reloop/domain/routes/domain/domain.routes";
import { landing } from "@reloop/domain/routes/landing/landing.index";
import { loader } from "@reloop/domain/utils/loader";
import { Elysia } from "elysia";
import { initLogger, log, parseError } from "evlog";
import { evlog } from "evlog/elysia";

initLogger({ env: { service: "domain" } });

const port = domainConfig.port;

const domainService = new Elysia({
	prefix: "/api/domain",
	name: "Domain Service",
})
	.use(opentelemetry())
	.use(
		openapi({
			documentation: {
				info: {
					title: "Domain Service",
					version: "1.2.0",
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
	.use(evlog())
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
	.use(domainRoutes)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		log.info(
			"Domain Service",
			`Running on:\n  - Local: http://localhost:${port}/api/domain\n  - Base:  ${domainConfig.BASE_URL}/api/domain`,
		);
	});

export type DomainService = typeof domainService;
