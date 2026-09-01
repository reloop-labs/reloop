import { Elysia } from "elysia";

export const agentCardRoute = new Elysia().get("/agent-card.json", () => ({
	name: "Campaigns Service",
	version: "1.0.0",
	description:
		"Broadcast email campaigns: audience targeting, scheduling, send, and engagement stats.",
	url: "https://reloop.sh",
	defaultInputModes: ["application/json"],
	defaultOutputModes: ["application/json"],
	supportsStreaming: false,
	skills: [
		{
			id: "health_check",
			name: "Health Check",
			description: "Check if the campaigns service is healthy.",
			method: "GET",
			path: "/api/campaigns/health",
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
			id: "create_campaign",
			name: "Create Campaign",
			description:
				"Create a draft, scheduled, or immediately sending campaign.",
			method: "POST",
			path: "/api/campaigns/v1/create",
			tags: ["campaign"],
			inputSchema: {},
			outputSchema: {},
			errorCodes: [],
			examples: [],
		},
		{
			id: "list_campaigns",
			name: "List Campaigns",
			description: "List broadcast campaigns for the organization.",
			method: "GET",
			path: "/api/campaigns/v1/list",
			tags: ["campaign"],
			inputSchema: {},
			outputSchema: {},
			errorCodes: [],
			examples: [],
		},
	],
}));
