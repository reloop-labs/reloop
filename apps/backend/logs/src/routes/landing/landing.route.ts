import { createClient } from "@clickhouse/client";
import { Elysia } from "elysia";

// Create ClickHouse client for health checks
const clickhouseClient = createClient({
	host: process.env.CLICKHOUSE_HOST || "http://localhost:8123",
	username: process.env.CLICKHOUSE_USER || "reloop",
	password: process.env.CLICKHOUSE_PASSWORD || "reloop123",
	database: process.env.CLICKHOUSE_DATABASE || "reloop_tracehub",
});

export const landingRoute = new Elysia()
	.get(
		"/",
		async () => {
			return `
╔════════════════════════════════════════════════════════╗
║                    LOGS SERVICE                        ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║   ██╗      ██████╗  ██████╗ ███████╗                   ║
║   ██║     ██╔═══██╗██╔════╝ ██╔════╝                   ║
║   ██║     ██║   ██║██║  ███╗███████╗                  ║
║   ██║     ██║   ██║██║   ██║╚════██║                  ║
║   ███████╗╚██████╔╝╚██████╔╝███████║                  ║
║   ╚══════╝ ╚═════╝  ╚═════╝ ╚══════╝                  ║
║                                                        ║
║                  ONLINE & READY                        ║
║                 Version: v1.0.0                        ║
║                                                        ║
╠════════════════════════════════════════════════════════╣
║ QUICK START:                                           ║
║ curl -X GET /api/logs/health/db                        ║
║                                                        ║
╠════════════════════════════════════════════════════════╣
║ - SUPPORT                                              ║
║ - https://reloop.sh/dev/setup/backend/logs             ║
║ - https://github.com/reloop-labs/reloop                ║
╠════════════════════════════════════════════════════════╣
║  "Every event tells a story."                          ║
║                    - Your Reloop Team                  ║
╚════════════════════════════════════════════════════════╝


    Powered by ☕ Coffee, 🍕 Pizza & 💻 Late Night Coding

                Made with ❤️ for developers

`;
		},
		{
			detail: {
				tags: ["Service"],
				summary: "Landing page for logs service",
				description: "Displays the landing page for the logs service",
			},
		},
	)
	.get(
		"/health/db",
		async () => {
			try {
				const startTime = Date.now();
				await clickhouseClient.query({
					query: "SELECT 1 as test",
					format: "JSON",
				});
				const responseTime = Date.now() - startTime;

				return {
					status: "CONNECTED",
					database: "clickhouse",
					responseTime: `${responseTime}ms`,
					timestamp: new Date().toISOString(),
				};
			} catch (error) {
				return {
					status: "DISCONNECTED",
					database: "clickhouse",
					error: error instanceof Error ? error.message : String(error),
					timestamp: new Date().toISOString(),
				};
			}
		},
		{
			detail: {
				tags: ["Service"],
				summary: "Health check for ClickHouse database",
				description: "Checks the health of the ClickHouse database connection",
			},
		},
	);
