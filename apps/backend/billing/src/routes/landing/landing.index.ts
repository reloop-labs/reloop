import { db } from "@reloop/db/client";
import { Elysia } from "elysia";

export const landing = new Elysia()
	.get(
		"/",
		async () => {
			return `
╔══════════════════════════════════════════════════════════════════════╗
║                        BILLING SERVICE                               ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║    ██████╗ ██╗██╗     ██╗     ██╗███╗   ██╗ ██████╗                  ║
║    ██╔══██╗██║██║     ██║     ██║████╗  ██║██╔════╝                  ║
║    ██████╔╝██║██║     ██║     ██║██╔██╗ ██║██║  ███╗                 ║
║    ██╔══██╗██║██║     ██║     ██║██║╚██╗██║██║   ██║                 ║
║    ██████╔╝██║███████╗███████╗██║██║ ╚████║╚██████╔╝                 ║
║    ╚══════╝ ╚═╝╚══════╝╚══════╝╚═╝╚═╝  ╚═══╝ ╚═════╝                 ║
║                                                                      ║
║                          ONLINE & READY                              ║
║                         Version: v1.0.0                              ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║ 📚 Docs: https://reloop.sh/docs/billing                              ║
║ 🤖 Discovery: https://reloop.sh/api/billing/agent-card.json          ║
║ 📖 OpenAPI: https://reloop.sh/api/billing/openapi                    ║
║ 🐙 GitHub: https://github.com/reloop-labs/reloop                     ║
║ 🆘 Support: https://reloop.sh/support                                ║
║ 💬 Discord: https://discord.gg/reloop                                ║
║ 🐦 Twitter: https://x.com/reloophq                               ║
║ 🛠️ Setup: https://reloop.sh/docs/setup/billing                      ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  "Money makes the world go round, but clean code                    ║
║   makes the service run."                                            ║
║                - Your Reloop Team                                    ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝


    Powered by ☕ Coffee, 🍕 Pizza & 💻 Late Night Coding

                Made with ❤️ for developers

`;
		},
		{ detail: { hide: true } },
	)
	.get(
		"/health",
		async () => {
			try {
				const startTime = Date.now();
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
	.get("/agent-card.json", () => ({
		name: "Billing Service",
		version: "1.0.0",
		description:
			"Service for managing subscriptions, usage credits, and invoicing for the Reloop platform.",
		url: "https://reloop.sh",
		defaultInputModes: ["application/json"],
		defaultOutputModes: ["application/json"],
		supportsStreaming: true,
		skills: [
			{
				id: "health_check",
				name: "Health Check",
				description: "Check the health of the billing service.",
				method: "GET",
				path: "/api/billing/health",
				tags: ["monitoring"],
				inputSchema: {},
				outputSchema: {
					status: { type: "string" },
					success: { type: "boolean" },
				},
				errorCodes: [],
				examples: [],
			},
			{
				id: "get_usage",
				name: "Get Usage Summary",
				description: "Get real-time usage statistics and credit status.",
				method: "GET",
				path: "/api/billing/usage",
				tags: ["usage"],
				inputSchema: {},
				outputSchema: {
					plan: { type: "object" },
					subscription: { type: "object" },
					stats: { type: "object" },
				},
				errorCodes: [],
				examples: [],
			},
			{
				id: "list_invoices",
				name: "List Invoices",
				description: "Retrieve all invoices for the organization.",
				method: "GET",
				path: "/api/billing/invoices",
				tags: ["billing"],
				inputSchema: {},
				outputSchema: {
					invoices: { type: "array" },
				},
				errorCodes: [],
				examples: [],
			},
		],
		usage_guidelines:
			"1. Usage data is updated in near real-time via NATS events.\n2. Credits are deducted based on email recipients sent.\n3. Subscriptions default to a Free plan upon organization creation.",
		authentication: {
			schemes: ["cookie"],
			headerName: "Cookie",
			notes: "Requires an active session via better-auth.",
		},
		provider: {
			organization: "Reloop labs",
			contact: "https://reloop.sh/support",
		},
	}));
