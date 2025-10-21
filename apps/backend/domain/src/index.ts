import "dotenv/config";
import { fromTypes, openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";
import { dnsRoutes } from "./routes/dns/dns.route";
import { domainRoutes } from "./routes/domain/domain.routes";
import { landing } from "./routes/landing/landing.index";
import { validationRoutes } from "./routes/validation/validation.routes";
import { loader } from "./utils/loader";

const port = Number(process.env.PORT || 3000);
const emailService = new Elysia({
	prefix: "/api/domain",
	name: "Domain Service",
})
	.use(openapi({
		references: fromTypes(
			process.env.NODE_ENV === 'production'
				? 'dist/index.d.ts'
				: 'src/index.ts'
		)
	}))
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
