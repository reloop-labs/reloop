import { redis } from "@reloop/api-key/utils/loader";
import { db } from "@reloop/db/client";
import { Elysia } from "elysia";

export const landing = new Elysia()
	.get(
		"/",
		async () => {
			return `
╔══════════════════════════════════════════════════════════════════════╗
║                        API KEY SERVICE                               ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║    █████╗ ██████╗ ██╗    ██╗  ██╗███████╗██╗   ██╗                   ║
║   ██╔══██╗██╔══██╗██║    ██║ ██╔╝██╔════╝╚██╗ ██╔╝                   ║
║   ███████║██████╔╝██║    █████╔╝ █████╗   ╚████╔╝                    ║
║   ██╔══██║██╔═══╝ ██║    ██╔═██╗ ██╔══╝    ╚██╔╝                     ║
║   ██║  ██║██║     ██║    ██║  ██╗███████╗   ██║                      ║
║   ╚═╝  ╚═╝╚═╝     ╚═╝    ╚═╝  ╚═╝╚══════╝   ╚═╝                      ║
║                                                                      ║
║                          ONLINE & READY                              ║
║                         Version: v1.0.0                              ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║ 📚 Docs: https://reloop.sh/docs/api-key                             ║
║ 🤖 Discovery: https://reloop.sh/api/api-key/agent-card.json          ║
║ 📖 OpenAPI: https://reloop.sh/api/api-key/openapi                    ║
║ 🐙 GitHub: https://github.com/reloop-labs/reloop                     ║
║ 🆘 Support: https://reloop.sh/support                                ║
║ 💬 Discord: https://discord.gg/reloop                                ║
║ 🐦 Twitter: https://x.com/reloophq                               ║
║ 🛠️ Setup: https://reloop.sh/docs/setup/api-key                      ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  "Lock it down, like a pro."                                         ║
		- Your Reloop Team                                ║
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
		name: "API Key Service",
		version: "1.0.0",
		description: "Service for managing and validating API keys for the Reloop platform.",
		url: "https://reloop.sh",
		defaultInputModes: ["application/json"],
		defaultOutputModes: ["application/json"],
		supportsStreaming: false,
		skills: [
			{
				id: "health_check",
				name: "Health Check",
				description: "Check the health of the API key service.",
				method: "GET",
				path: "/api/api-key/health",
				tags: ["monitoring"],
				inputSchema: {},
				outputSchema: {
					status: { type: "string" },
					success: { type: "boolean" }
				},
				errorCodes: [],
				examples: []
			},
			{
				id: "create_api_key",
				name: "Create API Key",
				description: "Generate a new API key for an organization.",
				method: "POST",
				path: "/api/api-key/v1/create",
				tags: ["management"],
				inputSchema: {
					name: { type: "string", required: true, description: "Key name/description" },
					organizationId: { type: "string", required: true }
				},
				outputSchema: {
					key: { type: "string", description: "The sensitive API key string (only shown once)" },
					id: { type: "string" }
				},
				errorCodes: [],
				examples: []
			},
			{
				id: "list_api_keys",
				name: "List API Keys",
				description: "List all API keys for the authenticated organization.",
				method: "GET",
				path: "/api/api-key/v1/list",
				tags: ["management"],
				inputSchema: {},
				outputSchema: {
					keys: { type: "array" }
				},
				errorCodes: [],
				examples: []
			}
		],
		usage_guidelines: "1. API keys are sensitive; never share them or commit them to version control.\n2. Keys are prefixed with 'rl' by default.\n3. Revoking a key is immediate and permanent.",
		authentication: {
			schemes: ["bearer", "cookie"],
			headerName: "Authorization",
			notes: "Requires an active session."
		},
		provider: {
			organization: "Reloop labs",
			contact: "https://reloop.sh/support"
		}
	}));
