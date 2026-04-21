import { redis } from "@be/upload/lib/redis";
import { db } from "@reloop/db/client";
import { Elysia } from "elysia";

export const landing = new Elysia()
	.get(
		"/",
		async () => {
			return `
╔════════════════════════════════════════════════════════════════╗
║                        UPLOAD SERVICE                          ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║ ██╗   ██╗██████╗ ██╗      ██████╗  █████╗ ██████╗ ███████╗     ║
║ ██║   ██║██╔══██╗██║     ██╔═══██╗██╔══██╗██╔══██╗██╔════╝     ║
║ ██║   ██║██████╔╝██║     ██║   ██║███████║██║  ██║█████╗       ║
║ ██║   ██║██╔═══╝ ██║     ██║   ██║██╔══██║██║  ██║██╔══╝       ║
║ ╚██████╔╝██║     ███████╗╚██████╔╝██║  ██║██████╔╝███████╗     ║
║  ╚═════╝ ╚═╝     ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚══════╝     ║
║                                                                ║
║                          ONLINE & READY                        ║
║                         Version: v1.0.0                        ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║ 📚 Docs: https://reloop.sh/docs/upload                         ║
║ 🐙 GitHub: https://github.com/reloop-labs/reloop               ║
║ 🆘 Support: https://reloop.sh/support                          ║
║ 💬 Discord: https://discord.gg/reloop                          ║
║ 🐦 Twitter: https://x.com/reloophq                         ║
║ 🛠️ Setup: https://reloop.sh/docs/setup/upload                  ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  "Store your images locally, serve them globally."             ║
║                    - Your Reloop Team                          ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝


    Powered by ☕ Coffee, 🍕 Pizza & 💻 Late Night Coding

                Made with ❤️ for developers

`;
		},
		{
			detail: {
				tags: ["Service"],
				summary: "Health check for Upload Service",
				description: "Checks the health of the Upload Service",
			},
		},
	)
	.get(
		"/health/redis",
		async () => {
			try {
				const startTime = Date.now();
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
		{
			detail: {
				tags: ["Service"],
				summary: "Health check for Redis",
				description: "Checks the health of the Redis database",
			},
		},
	)
	.get(
		"/health/postgres",
		async () => {
			try {
				await db.execute("SELECT 1 as test");
				return {
					status: "CONNECTED",
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
		{
			detail: {
				tags: ["Service"],
				summary: "Health check for Postgres",
				description: "Checks the health of the Postgres database",
			},
		},
	);
