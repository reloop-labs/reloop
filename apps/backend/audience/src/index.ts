import "dotenv/config";
import { audienceConfig } from "@be/audience/audience.config";
import { audienceRoutes } from "@be/audience/routes/audience/audience.routes";
import { landing } from "@be/audience/routes/landing/landing.index";
import { loader } from "@be/audience/utils/loader";
import { fromTypes, openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";

const port = audienceConfig.port;
const audienceService = new Elysia({ prefix: "/api/audience", name: "Audience Service", })
	.use(
		openapi({
			references: fromTypes(
				audienceConfig.NODE_ENV === "production"
					? "dist/index.d.ts"
					: "src/index.ts",
			),
		}),
	)
	.use(serverTiming())
	.use(landing)
	.use(audienceRoutes)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		logger.info(
			`Audience Server is running on http://localhost:${port}/api/audience`,
		);
	});

export type AudienceService = typeof audienceService;
