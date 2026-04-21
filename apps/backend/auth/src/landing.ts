import { db } from "@reloop/db/client";
import { Elysia } from "elysia";
import { redis } from "./lib/redis";

export const landing = new Elysia()
	.get("/", async () => {
		return `
╔══════════════════════════════════════════════════════════════════════╗
║                        AUTH SERVICE                                  ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║           █████╗ ██╗   ██╗████████╗██╗  ██╗                          ║
║          ██╔══██╗██║   ██║╚══██╔══╝██║  ██║                          ║
║          ███████║██║   ██║   ██║   ███████║                          ║
║          ██╔══██║██║   ██║   ██║   ██╔══██║                          ║
║          ██║  ██║╚██████╔╝   ██║   ██║  ██║                          ║
║          ╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚═╝  ╚═╝                          ║
║                                                                      ║
║                          ONLINE & READY                              ║
║                         Version: v1.0.0                              ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║ 📚 Docs: https://reloop.sh/docs/auth                                 ║
║ 🐙 GitHub: https://github.com/reloop-labs/reloop                     ║
║ 🆘 Support: https://reloop.sh/support                                ║
║ 💬 Discord: https://discord.gg/reloop                                ║
║ 🐦 Twitter: https://x.com/reloophq                               ║
║ 🛠️ Setup: https://reloop.sh/docs/setup/auth                          ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  "The best security is invisible security"                           ║
║                    - Your Reloop Team                                ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝


    Powered by ☕ Coffee, 🍕 Pizza & 💻 Late Night Coding

                    Made with ❤️ for developers

`;
	})
	.get(
		"/health",
		async () => {
			try {
				const startTime = Date.now();
				await redis.healthCheck();
				await db.execute("SELECT 1 as test");
				const responseTime = Date.now() - startTime;

				return {
					status: "CONNECTED",
					success: true,
					responseTime: `${responseTime}ms`,
					timestamp: new Date().toISOString(),
				};
			} catch (error) {
				return {
					status: "DISCONNECTED",
					success: false,
					error: error instanceof Error ? error.message : String(error),
					timestamp: new Date().toISOString(),
				};
			}
		},
		{ detail: { hide: true } },
	)
