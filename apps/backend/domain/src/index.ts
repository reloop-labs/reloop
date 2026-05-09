import "dotenv/config";
import path from "node:path";
import { domainConfig } from "@be/domain/domain.config";
import { domainVerificationQueue } from "@be/domain/queues/domain-verification.queue";
import { domainRoutes } from "@be/domain/routes/domain/domain.routes";
import { landing } from "@be/domain/routes/landing/landing.index";
import { loader } from "@be/domain/utils/loader";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ElysiaAdapter } from "@bull-board/elysia";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { Elysia } from "elysia";
import { initLogger, log, parseError } from "evlog";
import { evlog } from "evlog/elysia";
import pkg from "../package.json";

initLogger({ env: { service: "domain" } });

const port = domainConfig.port;

const serverAdapter = new ElysiaAdapter({
	prefix: "/bull-board",
	basePath: "/api/domain/bull-board",
});

createBullBoard({
	queues: [new BullMQAdapter(domainVerificationQueue)],
	serverAdapter,
	options: {
		// This configuration fixes a build error on Bun caused by eval (https://github.com/oven-sh/bun/issues/5809#issuecomment-2065310008)
		uiBasePath:
			process.env.NODE_ENV === "production"
				? path.resolve(process.cwd(), "./node_modules/@bull-board/ui")
				: path.resolve(process.cwd(), "../../../node_modules/@bull-board/ui"),
	},
});

const domainService = new Elysia({
	prefix: "/api/domain",
	name: "Domain Service",
})
	.use(evlog())
	.use(
		openapi({
			documentation: {
				info: {
					title: "Domain Service",
					version: pkg.version,
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
	.use(await serverAdapter.registerPlugin())
	.use(landing)
	.use(domainRoutes)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		log.info("server", `Domain Server is running on http://localhost:${port}/api/domain`);
		log.info(
			"server",
			`Bull Board is running on http://localhost:${port}/api/domain/bull-board`,
		);
	});

export type DomainService = typeof domainService;
