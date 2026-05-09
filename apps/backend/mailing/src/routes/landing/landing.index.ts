import { redis } from "@reloop/be-mailing/utils/loader";
import { db } from "@reloop/db/client";
import { Elysia } from "elysia";

export const landing = new Elysia()
	.get(
		"/",
		async () => {
			return `
╔══════════════════════════════════════════════════════════════════════╗
║                      MAILING SERVICE                                 ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║         ███╗   ███╗ █████╗ ██╗██╗     ██╗███╗   ██╗ ██████╗          ║
║         ████╗ ████║██╔══██╗██║██║     ██║████╗  ██║██╔════╝          ║
║         ██╔████╔██║███████║██║██║     ██║██╔██╗ ██║██║  ███╗         ║
║         ██║╚██╔╝██║██╔══██║██║██║     ██║██║╚██╗██║██║   ██║         ║
║         ██║ ╚═╝ ██║██║  ██║██║███████╗██║██║ ╚████║╚██████╔╝         ║
║         ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝╚═╝  ╚═══╝ ╚═════╝          ║
║                                                                      ║
║                          ONLINE & READY                              ║
║                         Version: v1.0.0                              ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║ 📚 Docs: https://reloop.sh/docs/mail                                 ║
║ 🤖 Discovery: https://reloop.sh/api/mail/agent-card.json              ║
║ 📖 OpenAPI: https://reloop.sh/api/mail/openapi                       ║
║ 🐙 GitHub: https://github.com/reloop-labs/reloop                     ║
║ 🆘 Support: https://reloop.sh/support                                ║
║ 💬 Discord: https://discord.gg/reloop                                ║
║ 🐦 Twitter: https://x.com/reloophq                               ║
║ 🛠️ Setup: https://reloop.sh/docs/setup/mail                          ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  "Delivering emails faster than your ex’s replies."                  ║
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
		name: "Mailing Service",
		version: "1.0.0",
		description:
			"Service for composing and sending transactional and marketing emails with support for templates and attachments.",
		url: "https://reloop.sh",
		defaultInputModes: ["application/json"],
		defaultOutputModes: ["application/json"],
		supportsStreaming: false,
		skills: [
			{
				id: "health_check",
				name: "Health Check",
				description:
					"Verify the health of the mail service and its dependencies.",
				method: "GET",
				path: "/api/mail/health",
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
				id: "send_email",
				name: "Send Email",
				description:
					"Send an email to one or more recipients. Supports HTML, Plain Text, and Templates.",
				method: "POST",
				path: "/api/mail/v1/send",
				tags: ["mail"],
				inputSchema: {
					from: {
						type: "string",
						required: true,
						description: "Sender address",
					},
					to: {
						type: "array",
						required: true,
						description: "Recipient addresses",
					},
					subject: {
						type: "string",
						required: true,
						description: "Email subject",
					},
					html: { type: "string", description: "HTML body" },
					text: { type: "string", description: "Plain text body" },
					templateId: { type: "string", description: "Optional template ID" },
				},
				outputSchema: {
					id: { type: "string", description: "Unique message identifier" },
					status: { type: "string", description: "Initial delivery status" },
				},
				errorCodes: [
					{ status: 400, meaning: "Bad request / Validation error" },
					{ status: 401, meaning: "Unauthorized" },
				],
				examples: [],
			},
		],
		usage_guidelines:
			"1. Senders must use a verified domain.\n2. Attachments should be uploaded via the upload service first.\n3. Rate limits apply based on organization tier.",
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
