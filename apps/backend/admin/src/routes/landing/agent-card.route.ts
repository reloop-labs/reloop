import { Elysia } from "elysia";

export const agentCardRoute = new Elysia().get("/agent-card.json", () => ({
	name: "Admin Service",
	version: "1.0.0",
	description:
		"System-wide administration and operational monitoring service for the Reloop platform.",
	url: "https://reloop.sh",
	defaultInputModes: ["application/json"],
	defaultOutputModes: ["application/json"],
	supportsStreaming: false,
	skills: [
		{
			id: "health_check",
			name: "Health Check",
			description:
				"Check the health of the Admin service and its dependencies.",
			method: "GET",
			path: "/api/admin/health",
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
			id: "get_overview",
			name: "Get Overview Stats",
			description:
				"Fetch high-level overview statistics including users, organizations, domains, emails, and remaining credits.",
			method: "GET",
			path: "/api/admin/v1/overview",
			tags: ["stats"],
			inputSchema: {},
			outputSchema: {
				users: { type: "number" },
				organizations: { type: "object" },
				domains: { type: "object" },
				emails: { type: "object" },
				credits: { type: "object" },
			},
			errorCodes: [{ status: 401, meaning: "Unauthorized" }],
			examples: [],
		},
	],
	usage_guidelines:
		"1. Access to the Admin Service endpoints requires Platform Admin privileges.\n2. Session cookies are checked for validation.",
	authentication: {
		schemes: ["cookie"],
		headerName: "Cookie",
		notes: "Requires a platform admin session cookie.",
	},
	provider: {
		organization: "Reloop labs",
		contact: "https://reloop.sh/support",
	},
}));
