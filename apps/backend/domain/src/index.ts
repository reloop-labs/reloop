import "dotenv/config";
import { dnsRoutes } from "@be/domain/routes/dns/dns.route";
import { domainRoutes } from "@be/domain/routes/domain/domain.routes";
import { landing } from "@be/domain/routes/landing/landing.index";
import { validationRoutes } from "@be/domain/routes/validation/validation.routes";
import { loader } from "@be/domain/utils/loader";
import { fromTypes, openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
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
