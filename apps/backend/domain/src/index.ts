import "dotenv/config";
import { domainConfig } from "@be/domain/domain.config";
import { domainRoutes } from "@be/domain/routes/domain/domain.routes";
import { landing } from "@be/domain/routes/landing/landing.index";
import { loader } from "@be/domain/utils/loader";
import { fromTypes, openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";

const port = domainConfig.port;
const emailService = new Elysia({
	prefix: "/api/domain",
	name: "Domain Service",
})
	.use(
		openapi({
			path: "/openapi",
			documentation: {
				info: {
					title: "Domain Service",
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
			references: fromTypes(
				domainConfig.NODE_ENV === "production"
					? "dist/index.d.ts"
					: "src/index.ts",
			),
		}),
	)
	.use(serverTiming())
	.use(landing)
	.use(domainRoutes)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		logger.info(
			`Domain Server is running on http://localhost:${port}/api/domain`,
		);
	});

export type EmailService = typeof emailService;
