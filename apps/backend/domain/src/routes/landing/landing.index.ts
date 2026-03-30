import { redis } from "@be/domain/lib/redis";
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

			return `
╔════════════════════════════════════════════════════════╗
║                    DOMAIN SERVICE                      ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║   ██████╗  ██████╗ ███╗   ███╗ █████╗ ██╗███╗   ██╗    ║
║   ██╔══██╗██╔═══██╗████╗ ████║██╔══██╗██║████╗  ██║    ║
║   ██║  ██║██║   ██║██╔████╔██║███████║██║██╔██╗ ██║    ║
║   ██║  ██║██║   ██║██║╚██╔╝██║██╔══██║██║██║╚██╗██║    ║
║   ██████╔╝╚██████╔╝██║ ╚═╝ ██║██║  ██║██║██║ ╚████║    ║
║   ╚═════╝  ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝    ║
║                                                        ║
║                  ONLINE & READY                        ║
║                 Version: v1.0.0                        ║
║                                                        ║
╠════════════════════════════════════════════════════════╣
║ DATABASE STATUS: ${dbStatus.padEnd(25)}             ║
║ REDIS STATUS: ${redisStatus.padEnd(27)}              ║
║                                                        ║
${dbError ? `║ DB ERROR: ${dbError.substring(0, 50).padEnd(50)} ║` : "║                                                        ║"}
${redisError ? `║ REDIS ERROR: ${redisError.substring(0, 50).padEnd(50)} ║` : "║                                                        ║"}
╠════════════════════════════════════════════════════════╣
║ QUICK START:                                           ║
║ curl -X GET /api/domain/check \\                        ║
║   -H "Content-Type: application/json" \\                ║
║   -d '{"domain":"example.com"}'                        ║
╠════════════════════════════════════════════════════════╣
║ - SUPPORT                                              ║
║ - https://reloop.sh/dev/setup/backend/domain           ║
║ - https://github.com/reloop-labs/reloop                ║
╠════════════════════════════════════════════════════════╣
║  "In domains we trust, in DNS we verify"               ║
║                    - Your Reloop Team                  ║
╚════════════════════════════════════════════════════════╝


    Powered by ☕ Coffee, 🍕 Pizza & 💻 Late Night Coding

                Made with ❤️ for developers

`;
		}, { detail: { hide: true } },
	)
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
