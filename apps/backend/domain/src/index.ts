import "dotenv/config";
import { fromTypes, openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { dnsRoutes } from "@reloop/domain/routes/dns/dns.route";
import { domainRoutes } from "@reloop/domain/routes/domain/domain.routes";
import { landing } from "@reloop/domain/routes/landing/landing.index";
import { validationRoutes } from "@reloop/domain/routes/validation/validation.routes";
import { loader } from "@reloop/domain/utils/loader";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";

const port = 8011;
const emailService = new Elysia({
	prefix: "/api/domain",
	name: "Domain Service",
})
	.use(
		openapi({
			references: fromTypes(
				process.env.NODE_ENV === "production"
					? "dist/index.d.ts"
					: "src/index.ts",
			),
		}),
	)
	.use(serverTiming())
	.use(landing)
	.use(domainRoutes)
	.use(dnsRoutes)
	.use(validationRoutes)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		logger.info(
			`Domain Server is running on http://localhost:${port}/api/domain`,
		);
	});

export type EmailService = typeof emailService;
