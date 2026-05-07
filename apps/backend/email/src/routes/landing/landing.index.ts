import { Elysia } from "elysia";

export const landing = new Elysia()
	.get(
		"/",
		async () => {
			return `
╔══════════════════════════════════════════════════════════════════════╗
║                          EMAIL SERVICE                               ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║    ███████╗███╗   ███╗ █████╗ ██╗██╗                                 ║
║    ██╔════╝████╗ ████║██╔══██╗██║██║                                 ║
║    █████╗  ██╔████╔██║███████║██║██║                                 ║
║    ██╔══╝  ██║╚██╔╝██║██╔══██║██║██║                                 ║
║    ███████╗██║ ╚═╝ ██║██║  ██║██║███████╗                            ║
║    ╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚══════╝                            ║
║                                                                      ║
║                          ONLINE & READY                              ║
║                         Version: v1.0.0                              ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║ 📚 Docs: https://reloop.sh/docs/email                                ║
║ 🤖 Discovery: https://reloop.sh/api/email/agent-card.json            ║
║ 📖 OpenAPI: https://reloop.sh/api/email/openapi                      ║
║ 🐙 GitHub: https://github.com/reloop-labs/reloop                     ║
║ 🆘 Support: https://reloop.sh/support                                ║
║ 💬 Discord: https://discord.gg/reloop                                ║
║ 🐦 Twitter: https://x.com/reloophq                               ║
║ 🛠️ Setup: https://reloop.sh/docs/setup/email                        ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  "Inbox zero is just a dream, let's make it a reality."              ║
║		- Your Reloop Team                                ║
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
				// Add any health checks here (e.g. NATS connectivity if possible)
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
		name: "Email Service",
		version: "1.0.0",
		description:
			"Service for sending and managing emails for the Reloop platform.",
		url: "https://reloop.sh",
		defaultInputModes: ["application/json"],
		defaultOutputModes: ["application/json"],
		supportsStreaming: false,
		skills: [
			{
				id: "health_check",
				name: "Health Check",
				description: "Check the health of the email service.",
				method: "GET",
				path: "/api/email/health",
				tags: ["monitoring"],
				inputSchema: {},
				outputSchema: {
					status: { type: "string" },
					success: { type: "boolean" },
				},
				errorCodes: [],
				examples: [],
			},
		],
		usage_guidelines:
			"1. Use this service to send transactional and marketing emails.\n2. Ensure recipients have opted in to receive emails.",
		authentication: {
			schemes: ["bearer", "cookie"],
			headerName: "Authorization",
			notes: "Requires an active session.",
		},
		provider: {
			organization: "Reloop labs",
			contact: "https://reloop.sh/support",
		},
	}));
