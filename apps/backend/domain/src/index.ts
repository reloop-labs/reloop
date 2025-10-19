import "dotenv/config";
import { serverTiming } from "@elysiajs/server-timing";
import { swagger } from "@elysiajs/swagger";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";
import { landing } from "./routes/landing/landing.index";
import { loader } from "./utils/loader";
import { dnsRoutes } from "./routes/dns/dns.index";
import { domainRoutes } from "./routes/domain/domain.index";
import { validationRoutes } from "./routes/validation/validation.index";

const port = Number(process.env.PORT || 3000);
const emailService = new Elysia({ prefix: "/api/domain", name: "Domain Service" })
	.use(serverTiming())
	.use(swagger({ path: "/docs" }))
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
