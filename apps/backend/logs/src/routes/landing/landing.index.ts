import { getClickHouseClient } from "@reloop/logs/utils/clickhouse";
import { redis } from "@reloop/logs/utils/loader";
import { Elysia } from "elysia";

export const landing = new Elysia()
	.get(
		"/",
		async () => {
			return `
╔══════════════════════════════════════════════════════════════════════╗
║                        LOGS SERVICE                                  ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║   ██╗      ██████╗  ██████╗ ███████╗                                 ║
║   ██║     ██╔═══██╗██╔════╝ ██╔════╝                                 ║
║   ██║     ██║   ██║██║  ███╗███████╗                                 ║
║   ██║     ██║   ██║██║   ██║╚════██║                                 ║
║   ███████╗╚██████╔╝╚██████╔╝███████║                                 ║
║   ╚══════╝ ╚═════╝  ╚═════╝  ╚══════╝                                 ║
║                                                                      ║
║                          ONLINE & READY                              ║
║                         Version: v1.0.0                              ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║ 📚 Docs: https://reloop.sh/docs/logs                                 ║
║ 🤖 Discovery: https://reloop.sh/api/logs/agent-card.json              ║
║ 📖 OpenAPI: https://reloop.sh/api/logs/openapi                       ║
║ 🐙 GitHub: https://github.com/reloop-labs/reloop                     ║
║ 🆘 Support: https://reloop.sh/support                                ║
║ 💬 Discord: https://discord.gg/reloop                                ║
║ 🐦 Twitter: https://x.com/reloophq                               ║
║ 🛠️ Setup: https://reloop.sh/docs/setup/logs                          ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  "Every event tells a story."                                        ║
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
				const client = getClickHouseClient();
				await client.query({ query: "SELECT 1 as test", format: "JSON" });
				await redis.healthCheck();
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
		name: "Logs Service",
		version: "1.0.0",
		description:
			"Unified logging service for tracking system events, email delivery status, and click/open tracking using ClickHouse.",
		url: "https://reloop.sh",
		defaultInputModes: ["application/json"],
		defaultOutputModes: ["application/json"],
		supportsStreaming: false,
		skills: [
			{
				id: "health_check",
				name: "Health Check",
				description:
					"Verify the connection status of the Logs service, Redis, and ClickHouse.",
				method: "GET",
				path: "/api/logs/health",
				tags: ["monitoring"],
				inputSchema: {},
				outputSchema: {
					status: { type: "string" },
					responseTime: { type: "string" },
				},
				errorCodes: [],
				examples: [],
			},
			{
				id: "list_email_logs",
				name: "List Email Logs",
				description:
					"Retrieve a paginated list of email delivery logs, filtered by organization or recipient.",
				method: "GET",
				path: "/api/logs/v1/list-email-logs",
				tags: ["logs"],
				inputSchema: {
					page: { type: "number" },
					limit: { type: "number" },
					email: { type: "string", description: "Filter by recipient email" },
				},
				outputSchema: {
					logs: { type: "array" },
					total: { type: "number" },
				},
				errorCodes: [],
				examples: [],
			},
			{
				id: "get_email_stats",
				name: "Get Email Stats",
				description:
					"Retrieve aggregated statistics for email deliveries (sent, delivered, opened, clicked, bounced).",
				method: "GET",
				path: "/api/logs/v1/email-stats",
				tags: ["stats"],
				inputSchema: {
					days: { type: "number", description: "Number of days to look back" },
				},
				outputSchema: {
					stats: { type: "object" },
				},
				errorCodes: [],
				examples: [],
			},
		],
		usage_guidelines:
			"1. Data is ingested into ClickHouse for high-performance analytical queries.\n2. Email IDs are unique identifiers generated during the sending process.\n3. Retention policies apply to logs; long-term data may be archived.",
		authentication: {
			schemes: ["bearer"],
			headerName: "Authorization",
			notes: "Requires a valid session token.",
		},
		provider: {
			organization: "Reloop labs",
			contact: "https://reloop.sh/support",
		},
	}));
