import { db } from "@reloop/db/client";
import { redis } from "@reloop/webhook/utils/loader";
import { Elysia } from "elysia";

export const landing = new Elysia()
	.get(
		"/",
		async () => {
			return `
╔══════════════════════════════════════════════════════════════════════╗
║                        WEBHOOK SERVICE                               ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║ ██╗    ██╗███████╗██████╗ ██╗  ██╗ ██████╗  ██████╗ ██╗  ██╗         ║
║ ██║    ██║██╔════╝██╔══██╗██║  ██║██╔═══██╗██╔═══██╗██║ ██╔╝         ║
║ ██║ █╗ ██║█████╗  ██████╔╝███████║██║   ██║██║   ██║█████╔╝          ║
║ ██║███╗██║██╔══╝  ██╔══██╗██╔══██║██║   ██║██║   ██║██╔═██╗          ║
║ ╚███╔███╔╝███████╗██████╔╝██║  ██║╚██████╔╝╚██████╔╝██║  ██╗         ║
║  ╚══╝╚══╝ ╚══════╝╚═════╝ ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝         ║
║                                                                      ║
║                          ONLINE & READY                              ║
║                         Version: v1.0.0                              ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║ 📚 Docs: https://reloop.sh/docs/webhook                               ║
║ 🤖 Discovery: https://reloop.sh/api/webhook/agent-card.json          ║
║ 📖 OpenAPI: https://reloop.sh/api/webhook/openapi                    ║
║ 🐙 GitHub: https://github.com/reloop-labs/reloop                     ║
║ 🆘 Support: https://reloop.sh/support                                ║
║ 💬 Discord: https://discord.gg/reloop                                ║
║ 🐦 Twitter: https://x.com/reloophq                               ║
║ 🛠️ Setup: https://reloop.sh/docs/setup/webhook                        ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  "We post so you don’t have to poll."                                ║
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
		{ detail: { hide: true } },
	)
	.get("/agent-card.json", () => ({
		name: "Webhook Service",
		version: "1.0.0",
		description:
			"Service for managing and triggering webhooks to notify external systems of events.",
		url: "https://reloop.sh",
		defaultInputModes: ["application/json"],
		defaultOutputModes: ["application/json"],
		supportsStreaming: false,
		skills: [
			{
				id: "create_webhook",
				name: "Create Webhook",
				description:
					"Subscribe to specific events by providing a destination URL.",
				method: "POST",
				path: "/api/webhook/v1/create",
				tags: ["webhook"],
				inputSchema: {
					url: {
						type: "string",
						required: true,
						description: "Destination URL",
					},
					events: {
						type: "array",
						required: true,
						description: "List of event types to subscribe to",
					},
				},
				outputSchema: {
					id: { type: "string" },
					secret: {
						type: "string",
						description: "Secret for signing requests",
					},
				},
				errorCodes: [],
				examples: [],
			},
			{
				id: "trigger_webhook",
				name: "Trigger Webhook",
				description:
					"Manually trigger a webhook event for testing or retry purposes.",
				method: "POST",
				path: "/api/webhook/v1/trigger",
				tags: ["webhook"],
				inputSchema: {
					id: { type: "string", required: true, description: "Webhook ID" },
					payload: {
						type: "object",
						required: true,
						description: "Event payload",
					},
				},
				outputSchema: {
					deliveryId: { type: "string" },
				},
				errorCodes: [{ status: 404, meaning: "Webhook not found" }],
				examples: [],
			},
		],
		usage_guidelines:
			"1. Destination URLs must return a 2xx status code within 5 seconds.\n2. Requests are signed with an HMAC-SHA256 signature using the webhook secret.\n3. Automatic retries are performed for failed deliveries (exponential backoff).",
		authentication: {
			schemes: ["bearer", "apiKey"],
			headerName: "Authorization",
			notes: "Bearer token or session cookie required.",
		},
		provider: {
			organization: "Reloop labs",
			contact: "https://reloop.sh/support",
		},
	}));
