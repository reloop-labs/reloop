import "dotenv/config";
import { fromTypes, openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { analyticsRoutes } from "./routes/analytics/analytics.routes";
import { loader } from "./utils/loader";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";

const port = 8016;
const analyticsService = new Elysia({
	prefix: "/api/analytics",
	name: "Analytics Service",
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
	.get(
		"/",
		async () => {
			return `
╔════════════════════════════════════════════════════════╗
║                  ANALYTICS SERVICE                     ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║   █████╗ ███╗   ██╗ █████╗ ██╗  ██╗████████╗██╗ ██████╗ ║
║  ██╔══██╗████╗  ██║██╔══██╗██║ ██╔╝╚══██╔══╝██║██╔═══██╗║
║  ███████║██╔██╗ ██║███████║█████╔╝    ██║   ██║██║   ██║║
║  ██╔══██║██║╚██╗██║██╔══██║██╔═██╗    ██║   ██║██║   ██║║
║  ██║  ██║██║ ╚████║██║  ██║██║  ██╗   ██║   ██║╚██████╔╝║
║  ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ║
║                                                        ║
║                  ONLINE & READY                        ║
║                 Version: v1.0.0                        ║
║                                                        ║
╠════════════════════════════════════════════════════════╣
║ QUICK START:                                           ║
║ curl -X POST /api/analytics/v1/track \\                 ║
║   -H "Content-Type: application/json" \\                ║
║   -d '{"event":"page_viewed","properties":{"page":"/home"}}' ║
╠════════════════════════════════════════════════════════╣
║ - SUPPORT                                              ║
║ - https://reloop.sh/dev/setup/backend/analytics       ║
║ - https://github.com/reloop-labs/reloop               ║
╚════════════════════════════════════════════════════════╝


    Powered by ☕ Coffee, 🍕 Pizza & 💻 Late Night Coding

                Made with ❤️ for developers

`;
		},
		{
			detail: {
				tags: ["Service"],
				summary: "Health check for Analytics Service",
				description: "Checks the health of the Analytics Service",
			},
		},
	)
	.use(analyticsRoutes)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		logger.info(
			`Analytics Server is running on http://localhost:${port}/api/analytics`,
		);
	});

export type AnalyticsService = typeof analyticsService;

