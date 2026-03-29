import { redis } from "@be/contacts/utils/loader";
import { db } from "@reloop/db/client";
import { Elysia } from "elysia";

export const landing = new Elysia()
	.get(
		"/",
		async () => {
			let dbStatus = "UNKNOWN";
			let dbError = "";
			let redisStatus = "UNKNOWN";
			let redisError = "";

			try {
				await db.execute("SELECT 1 as test");
				dbStatus = "CONNECTED";
			} catch (dbErr) {
				dbStatus = "DISCONNECTED";
				dbError = dbErr instanceof Error ? dbErr.message : String(dbErr);
			}

			try {
				await redis.healthCheck();
				redisStatus = "CONNECTED";
			} catch (redisErr) {
				redisStatus = "DISCONNECTED";
				redisError =
					redisErr instanceof Error ? redisErr.message : String(redisErr);
			}

			const dbStatusEmoji = dbStatus === "CONNECTED" ? "✅" : "❌";
			const redisStatusEmoji = redisStatus === "CONNECTED" ? "✅" : "❌";

			return `
╔══════════════════════════════════════════════════════════════════════╗
║                        CONTACTS SERVICE                              ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ██████╗ ██████╗ ███╗  ██╗████████╗ █████╗  ██████╗████████╗███████╗ ║
║ ██╔════╝██╔═══██╗████╗ ██║╚══██╔══╝██╔══██╗██╔════╝╚══██╔══╝██╔════╝ ║
║ ██║     ██║   ██║██╔██╗██║   ██║   ███████║██║        ██║   ███████╗ ║
║ ██║     ██║   ██║██║╚████║   ██║   ██╔══██║██║        ██║   ╚════██║ ║
║ ╚██████╗╚██████╔╝██║ ╚███║   ██║   ██║  ██║╚██████╗   ██║   ███████║ ║
║  ╚═════╝ ╚═════╝ ╚═╝  ╚══╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝   ╚═╝   ╚══════╝ ║
║                                                                      ║
║                          ONLINE & READY                              ║
║                         Version: v1.0.0                              ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║ 🗄️ DATABASE STATUS: ${dbStatusEmoji}                                               ║
║ 🛢️ REDIS STATUS: ${redisStatusEmoji}                                                  ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║ 📚 Docs: https://reloop.sh/docs/contacts                             ║
║ 🐙 GitHub: https://github.com/reloop-labs/reloop                     ║
║ 🆘 Support: https://reloop.sh/support                                ║
║ 💬 Discord: https://discord.gg/reloop                                ║
║ 🐦 Twitter: https://twitter.com/reloop                               ║
║ 🛠️ Setup: https://reloop.sh/dev/setup/contacts                       ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║                                                                      ║
║  "Give us your email — we’ll give you applause-worthy updates."      ║
║                    - Your Reloop Team                                ║
║                                                                      ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝


    Powered by ☕ Coffee, 🍕 Pizza & 💻 Late Night Coding

                Made with ❤️ for developers

`;
		},
		{
			detail: {
				tags: ["Service"],
				summary: "Health check for API Key Service",
				description: "Checks the health of the API Key Service",
			},
		},
	)
	.get(
		"/status",
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
		{
			detail: {
				tags: ["Service"],
				summary: "Status",
				description: "Checks the status of Contact Service",
			},
		},
	);
