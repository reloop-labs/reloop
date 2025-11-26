import { redis } from "@be/upload/lib/redis";
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
║ DATABASE STATUS: ${dbStatus.padEnd(25)}                     ║
║ REDIS STATUS: ${redisStatus.padEnd(27)}                      ║
║                                                                ║
${dbError ? `║ DB ERROR: ${dbError.substring(0, 50).padEnd(50)} ║` : "║                                                                ║"}
${redisError ? `║ REDIS ERROR: ${redisError.substring(0, 50).padEnd(50)} ║` : "║                                                                ║"}
╠════════════════════════════════════════════════════════════════╣
║ QUICK START:                                                   ║
║ curl -X POST /api/upload/v1/upload \\                            ║
║   -H "Content-Type: multipart/form-data" \\                      ║
║   -F "file=@image.jpg"                                         ║
╠════════════════════════════════════════════════════════════════╣
║ - SUPPORT                                                      ║
║ - https://reloop.sh/dev/setup/backend/upload                  ║
║ - https://github.com/reloop-labs/reloop                        ║
╠════════════════════════════════════════════════════════════════╣
║  "Store your images locally, serve them globally."             ║
║                    - Your Reloop Team                          ║
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
