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
║ 🤖 Discovery: https://reloop.sh/api/workflow/agent-card.json         ║
║ 🐙 GitHub: https://github.com/reloop-labs/reloop                     ║
║ 🆘 Support: https://reloop.sh/support                                ║
║ 💬 Discord: https://discord.gg/reloop                                ║
║ 🐦 Twitter: https://x.com/reloophq                               ║
║ 🛠️ Setup: https://reloop.sh/docs/setup/workflow                      ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  "Automate workflows, deliver results"                                ║
		- Your Reloop Team                                ║
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
	)
	.get("/agent-card.json", () => ({
		name: "Workflow Service",
		version: "1.0.0",
		description: "Service for orchestrating long-running workflows and background tasks using Inngest.",
		url: "https://reloop.sh",
		defaultInputModes: ["application/json"],
		defaultOutputModes: ["application/json"],
		supportsStreaming: false,
		skills: [
			{
				id: "inngest_endpoint",
				name: "Inngest Endpoint",
				description: "The main endpoint for Inngest communication and event ingestion.",
				method: "POST",
				path: "/api/workflow/inngest",
				tags: ["workflow"],
				inputSchema: {
					name: { type: "string", required: true, description: "Event name" },
					data: { type: "object", description: "Event payload" }
				},
				outputSchema: {
					ids: { type: "array", description: "Event IDs" }
				},
				errorCodes: [],
				examples: []
			}
		],
		usage_guidelines: "1. Events are handled asynchronously by background workers.\n2. Workflows are defined as code and orchestrated by Inngest.\n3. Idempotency is recommended for all event handlers.",
		authentication: {
			schemes: ["bearer", "apiKey"],
			headerName: "Authorization",
			notes: "Inngest signing key or bearer token required."
		},
		provider: {
			organization: "Reloop labs",
			contact: "https://reloop.sh/support"
		}
	}));
