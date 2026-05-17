import { log } from "evlog";
import "dotenv/config";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";

import { logsConfig } from "@reloop/logs/logs.config";
import { loader } from "@reloop/logs/utils/loader";
import { Elysia } from "elysia";
import { logCleanupCron } from "./cron/cleanup-logs.cron";
import { landing } from "./routes/landing/landing.index";
import { logsRoutes } from "./routes/logs/logs.routes";

const port = logsConfig.port;
const logsService = new Elysia({
	prefix: "/api/logs",
	name: "Logs Service",
})
	.use(
		openapi({
			documentation: {
				info: {
					title: "Logs Service",
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
		}),
	)
	.use(serverTiming())
	.use(landing)
	.use(logsRoutes)
	.use(logCleanupCron)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		log.info(
			"server",
			`Logs Server is running on ${logsConfig.BASE_URL}/api/logs`,
		);
	});

export type LogsService = typeof logsService;
