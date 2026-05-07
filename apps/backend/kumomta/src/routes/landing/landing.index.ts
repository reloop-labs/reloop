import { redis } from "@reloop/be-kumomta/utils/loader";
import { db } from "@reloop/db/client";
import { Elysia } from "elysia";

export const landing = new Elysia()
	.get(
		"/",
		async () => {
			return `
╔══════════════════════════════════════════════════════════════════════╗
║                        KUMOMTA SERVICE                               ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ██╗  ██╗██╗   ██╗███╗   ███╗ ██████╗ ███╗   ███╗████████╗ █████╗    ║
║  ██║ ██╔╝██║   ██║████╗ ████║██╔═══██╗████╗ ████║╚══██╔══╝██╔══██╗   ║
║  █████╔╝ ██║   ██║██╔████╔██║██║   ██║██╔████╔██║   ██║   ███████║   ║
║  ██╔═██╗ ██║   ██║██║╚██╔╝██║██║   ██║██║╚██╔╝██║   ██║   ██╔══██║   ║
║  ██║  ██╗╚██████╔╝██║ ╚═╝ ██║╚██████╔╝██║ ╚═╝ ██║   ██║   ██║  ██║   ║
║  ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝ ╚═════╝ ╚═╝     ╚═╝   ╚═╝   ╚═╝  ╚═╝   ║
║                                                                      ║
║                          ONLINE & READY                              ║
║                         Version: v1.0.0                              ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║ 📚 Docs: https://reloop.sh/docs/kumomta                              ║
║ 🤖 Discovery: https://reloop.sh/api/kumomta/agent-card.json          ║
║ 📖 OpenAPI: https://reloop.sh/api/kumomta/openapi                    ║
║ 🐙 GitHub: https://github.com/reloop-labs/reloop                     ║
║ 🆘 Support: https://reloop.sh/support                                ║
║ 💬 Discord: https://discord.gg/reloop                                ║
║ 🐦 Twitter: https://x.com/reloophq                               ║
║ 🛠️ Setup: https://reloop.sh/docs/setup/kumomta                       ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║                                                                      ║
║  "Fasten your seatbelts, KumoMTA handles the heavy lifting."         ║
		- Your Reloop Team                                ║
║                                                                      ║
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
		{ detail: { hide: true } },
	)
	.get("/agent-card.json", () => ({
		name: "KumoMTA Service",
		version: "1.0.0",
		description:
			"High-performance Mail Transfer Agent (MTA) interface for sending and tracking emails.",
		url: "https://reloop.sh",
		defaultInputModes: ["application/json"],
		defaultOutputModes: ["application/json"],
		supportsStreaming: false,
		skills: [
			{
				id: "health_check",
				name: "Health Check",
				description:
					"Verify the connection status of KumoMTA and its database.",
				method: "GET",
				path: "/api/kumomta/health",
				tags: ["monitoring"],
				inputSchema: {},
				outputSchema: {
					status: { type: "string", description: "Connection status" },
					success: { type: "boolean", description: "Health status" },
				},
				errorCodes: [],
				examples: [],
			},
			{
				id: "verify_email",
				name: "Internal Verify",
				description:
					"Validate an API key and domain for internal routing purposes.",
				method: "POST",
				path: "/api/kumomta/v1/verify",
				tags: ["internal"],
				inputSchema: {
					key: {
						type: "string",
						required: true,
						description: "API Key to verify",
					},
					domain: {
						type: "string",
						required: true,
						description: "Domain to check",
					},
				},
				outputSchema: {
					userId: { type: "string" },
					organizationId: { type: "string" },
					isVerified: { type: "boolean" },
				},
				errorCodes: [
					{ status: 401, meaning: "Invalid API key" },
					{ status: 404, meaning: "Domain not found" },
				],
				examples: [],
			},
		],
		usage_guidelines:
			"1. This service is primarily used internally by the mail service to route requests.\n2. API keys used here should be valid 'rl' prefixed keys.\n3. Domains must be pre-verified in the domain service.",
		authentication: {
			schemes: ["apiKey"],
			headerName: "x-kumomta-key",
			notes: "Internal authentication key required.",
		},
		provider: {
			organization: "Reloop labs",
			contact: "https://reloop.sh/support",
		},
	}));
