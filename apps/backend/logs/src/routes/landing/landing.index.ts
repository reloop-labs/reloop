import { getClickHouseClient } from "@reloop/logs/utils/clickhouse";
import { Elysia } from "elysia";

export const landing = new Elysia()
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
		{ detail: { hide: true } },
	)
	.get(
		"/health",
		async () => {
			try {
				const startTime = Date.now();
				const client = getClickHouseClient();
				await client.query({ query: "SELECT 1 as test", format: "JSON" });
				const responseTime = Date.now() - startTime;

				return {
					status: "CONNECTED",
					responseTime: `${responseTime}ms`,
					timestamp: new Date().toISOString(),
				};
			} catch (error) {
				return {
					status: "DISCONNECTED",
					error: error instanceof Error ? error.message : String(error),
					timestamp: new Date().toISOString(),
				};
			}
		},
		{ detail: { hide: true } },
	);
