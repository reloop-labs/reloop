import Elysia from "elysia";
import { db } from "./db";

export const landing = new Elysia().get("/", async () => {
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
║                                                        ║
${dbError ? `║ ERROR: ${dbError.substring(0, 50).padEnd(50)} ║` : "║                                                        ║"}
╠════════════════════════════════════════════════════════╣
║ QUICK START:                                           ║
║ curl -X POST /api/auth/login \                          ║
║   -H "Content-Type: application/json" \                 ║
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
});
