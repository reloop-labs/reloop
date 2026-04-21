import { getClickHouseClient } from "@reloop/logs/utils/clickhouse";
import { redis } from "@reloop/logs/utils/loader";
import { Elysia } from "elysia";

export const landing = new Elysia()
	.get(
		"/",
		async () => {
			return `
╔══════════════════════════════════════════════════════════════════════╗
║                        LOGS SERVICE                                  ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║   ██╗      ██████╗  ██████╗ ███████╗                                 ║
║   ██║     ██╔═══██╗██╔════╝ ██╔════╝                                 ║
║   ██║     ██║   ██║██║  ███╗███████╗                                 ║
║   ██║     ██║   ██║██║   ██║╚════██║                                 ║
║   ███████╗╚██████╔╝╚██████╔╝███████║                                 ║
║   ╚══════╝ ╚═════╝  ╚═════╝ ╚══════╝                                 ║
║                                                                      ║
║                          ONLINE & READY                              ║
║                         Version: v1.0.0                              ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║ 📚 Docs: https://reloop.sh/docs/logs                                 ║
║ 🐙 GitHub: https://github.com/reloop-labs/reloop                     ║
║ 🆘 Support: https://reloop.sh/support                                ║
║ 💬 Discord: https://discord.gg/reloop                                ║
║ 🐦 Twitter: https://x.com/reloophq                               ║
║ 🛠️ Setup: https://reloop.sh/docs/setup/logs                          ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  "Every event tells a story."                                        ║
║                    - Your Reloop Team                                ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝


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
				await redis.healthCheck();
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
