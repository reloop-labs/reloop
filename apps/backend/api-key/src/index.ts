import "dotenv/config";
import { fromTypes, openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { apiKeyRoutes } from "@reloop/api-key/routes/api-key/api-key.routes";
import { landing } from "@reloop/api-key/routes/landing/landing.index";
import { loader } from "@reloop/api-key/utils/loader";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";

const port = 8012;
const apiKeyService = new Elysia({
	prefix: "/api/api-key",
	name: "API Key Service",
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
	.use(apiKeyRoutes)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		logger.info(
			`API Key Server is running on http://localhost:${port}/api/api-key`,
		);
	});

export type ApiKeyService = typeof apiKeyService;
