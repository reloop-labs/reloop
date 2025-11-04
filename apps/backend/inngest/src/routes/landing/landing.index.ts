import { db } from "@reloop/db/client";
import { Elysia } from "elysia";

export const landing = new Elysia()
	.get(
		"/",
		async () => {
			let dbStatus = "UNKNOWN";
			let dbError = "";

			try {
				await db.execute("SELECT 1 as test");
				dbStatus = "CONNECTED";
			} catch (dbErr) {
				dbStatus = "DISCONNECTED";
				dbError = dbErr instanceof Error ? dbErr.message : String(dbErr);
			}

			return `
╔════════════════════════════════════════════════════════╗
║                    INNGEST SERVICE                    ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║   ██╗███╗   ██╗███╗   ██╗ ██████╗ ███████╗███████╗████████╗║
║   ██║████╗  ██║████╗  ██║██╔════╝██╔════╝██╔════╝╚══██╔══╝║
║   ██║██╔██╗ ██║██╔██╗ ██║██║     █████╗  ███████╗   ██║   ║
║   ██║██║╚██╗██║██║╚██╗██║██║     ██╔══╝  ╚════██║   ██║   ║
║   ██║██║ ╚████║██║ ╚████║╚██████╗███████╗███████║   ██║   ║
║   ╚═╝╚═╝  ╚═══╝╚═╝  ╚═══╝ ╚═════╝╚══════╝╚══════╝   ╚═╝   ║
║                                                        ║
║                  ONLINE & READY                        ║
║                 Version: v1.0.0                        ║
║                                                        ║
╠════════════════════════════════════════════════════════╣
║ DATABASE STATUS: ${dbStatus.padEnd(25)}             ║
║                                                        ║
${dbError ? `║ DB ERROR: ${dbError.substring(0, 50).padEnd(50)} ║` : "║                                                        ║"}
╠════════════════════════════════════════════════════════╣
║ QUICK START:                                           ║
║ curl -X POST /api/inngest/event \\                       ║
║   -H "Content-Type: application/json" \\                ║
║   -d '{"name":"test/event","data":{}}'                 ║
╠════════════════════════════════════════════════════════╣
║ - SUPPORT                                              ║
║ - https://reloop.sh/dev/setup/backend/inngest          ║
║ - https://github.com/reloop-labs/reloop                ║
╠════════════════════════════════════════════════════════╣
║  "Automate workflows, deliver results"                  ║
║                    - Your Reloop Team                  ║
╚════════════════════════════════════════════════════════╝


    Powered by ☕ Coffee, 🍕 Pizza & 💻 Late Night Coding

                Made with ❤️ for developers

`;
		},
		{
			detail: {
				tags: ["Service"],
				summary: "Health check for Inngest Service",
				description: "Checks the health of the Inngest Service",
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
