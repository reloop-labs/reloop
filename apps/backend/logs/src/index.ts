import "dotenv/config";
import { fromTypes, openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { logger } from "@reloop/logger";
import { loader } from "@reloop/logs/utils/loader";
import { Elysia } from "elysia";
import { landingRoute } from "./routes/landing/landing.route";
import { logsRoutes } from "./routes/logs/logs.routes";

const port = 8016;
const logsService = new Elysia({
	prefix: "/api/logs",
	name: "logs service",
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
	.use(landingRoute)
	.use(logsRoutes)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		logger.info(
			`logs server is running on http://localhost:${port}/api/logs`,
		);
	});

export type LogsService = typeof logsService;
