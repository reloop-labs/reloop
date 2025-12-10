import { db } from "@reloop/db/client";
import { Elysia } from "elysia";
import { authConfig } from "./auth.config";
import { redis } from "./lib/redis";

export const landing = new Elysia()
	.get("/", async () => {
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
║                     AUTH SERVICE                       ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║           █████╗ ██╗   ██╗████████╗██╗  ██╗            ║
║          ██╔══██╗██║   ██║╚══██╔══╝██║  ██║            ║
║          ███████║██║   ██║   ██║   ███████║            ║
║          ██╔══██║██║   ██║   ██║   ██╔══██║            ║
║          ██║  ██║╚██████╔╝   ██║   ██║  ██║            ║
║          ╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚═╝  ╚═╝            ║
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
║ curl -X POST /api/auth/login                           ║
║   -H "Content-Type: application/json"                  ║
║   -d '{"email":"dev@reloop.sh","password":"pass"}'     ║
╠════════════════════════════════════════════════════════╣
║ - SUPPORT                                              ║
║ - https://reloop.sh/dev/setup/backend/auth             ║
║ - https://github.com/reloop-labs/reloop                ║
╠════════════════════════════════════════════════════════╣
║  "The best security is invisible security"             ║
║                    - Your Reloop Team                  ║
╚════════════════════════════════════════════════════════╝


    Powered by ☕ Coffee, 🍕 Pizza & 💻 Late Night Coding

                    Made with ❤️ for developers

`;
	})
	.get("/health/redis", async () => {
		try {
			const startTime = Date.now();
			await redis.healthCheck();
			const responseTime = Date.now() - startTime;

			return {
				status: "connected",
				responseTime: `${responseTime}ms`,
				timestamp: new Date().toISOString(),
				redisUrl: authConfig.REDIS_URL || "not configured",
			};
		} catch (error) {
			return {
				status: "disconnected",
				error: error instanceof Error ? error.message : String(error),
				timestamp: new Date().toISOString(),
				redisUrl: authConfig.REDIS_URL || "not configured",
			};
		}
	});

