import { Elysia } from "elysia";

export const agentCardRoute = new Elysia().get("/agent-card.json", () => ({
	name: "Logs Service",
	version: "1.0.0",
	description:
		"Unified logging service for tracking system events, email delivery status, and click/open tracking using PostgreSQL.",
	url: "https://reloop.sh",
	defaultInputModes: ["application/json"],
	defaultOutputModes: ["application/json"],
	supportsStreaming: false,
	skills: [
		{
			id: "health_check",
			name: "Health Check",
			description:
				"Verify the connection status of the Logs service, Redis, and PostgreSQL.",
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
		"1. Activity and email delivery data are stored in PostgreSQL.\n2. Email IDs are unique identifiers generated during the sending process.\n3. Retention policies apply to activity logs; long-term data may be archived.",
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
