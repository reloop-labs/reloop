import { db } from "@reloop/db/client";
import { Elysia } from "elysia";

export const landing = new Elysia()
	.get(
		"/",
		async () => {
			return `
╔══════════════════════════════════════════════════════════════════════╗
║                        WORKFLOW SERVICE                              ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║   ██╗    ██╗ ██████╗ ██████╗ ██╗  ██╗██╗     ██╗                     ║
║   ██║    ██║██╔═══██╗██╔══██╗██║ ██╔╝██║     ██║                     ║
║   ██║ █╗ ██║██║   ██║██████╔╝█████╔╝ ██║     ██║                     ║
║   ██║███╗██║██║   ██║██╔══██╗██╔═██╗ ██║     ██║                     ║
║   ╚███╔███╔╝╚██████╔╝██║  ██║██║  ██╗███████╗███████╗                ║
║    ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝                ║
║   ███████╗██╗      ██████╗ ██╗    ██╗██╗                             ║
║   ██╔════╝██║     ██╔═══██╗██║    ██║██║                             ║
║   █████╗  ██║     ██║   ██║██║ █╗ ██║██║                             ║
║   ██╔══╝  ██║     ██║   ██║██║███╗██║██║                             ║
║   ██║     ███████╗╚██████╔╝╚███╔███╔╝███████╗                        ║
║   ╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝ ╚══════╝                        ║
║                                                                      ║
║                          ONLINE & READY                              ║
║                         Version: v1.0.0                              ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║ 📚 Docs: https://reloop.sh/docs/workflow                             ║
║ 🐙 GitHub: https://github.com/reloop-labs/reloop                     ║
║ 🆘 Support: https://reloop.sh/support                                ║
║ 💬 Discord: https://discord.gg/reloop                                ║
║ 🐦 Twitter: https://x.com/reloophq                               ║
║ 🛠️ Setup: https://reloop.sh/docs/setup/workflow                      ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  "Automate workflows, deliver results"                                ║
║                    - Your Reloop Team                                ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝


    Powered by ☕ Coffee, 🍕 Pizza & 💻 Late Night Coding

                Made with ❤️ for developers

`;
		},
		{
			detail: {
				tags: ["Service"],
				summary: "Health check for Workflow Service",
				description: "Checks the health of the Workflow Service",
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
