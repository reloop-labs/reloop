import { Elysia } from "elysia";

export const agentCardRoute = new Elysia().get("/agent-card.json", () => ({
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
