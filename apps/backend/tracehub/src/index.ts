import "dotenv/config";
import { fromTypes, openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { loader } from "@reloop/tracehub/utils/loader";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";
import { tracehubRoutes } from "./routes/tracehub/tracehub.routes";
import { landingRoute } from "./routes/landing/landing.route";

const port = 8016;
const tracehubService = new Elysia({
	prefix: "/api/tracehub",
	name: "tracehub service",
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
	.use(tracehubRoutes)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		logger.info(
			`tracehub server is running on http://localhost:${port}/api/tracehub`,
		);
	});

export type TraceHubService = typeof tracehubService;
