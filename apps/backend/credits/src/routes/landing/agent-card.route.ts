import { Elysia } from "elysia";

export const agentCardRoute = new Elysia().get("/agent-card.json", () => ({
	name: "Credits Service",
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
			description: "Check the health of the credits service.",
			method: "GET",
			path: "/api/credits/health",
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
			path: "/api/credits/v1/usage",
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
			path: "/api/credits/v1/invoices",
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
