import { Elysia } from "elysia";

export const agentCardRoute = new Elysia().get("/agent-card.json", () => ({
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
			path: "/api/webhook/v1/",
			tags: ["webhook"],
			inputSchema: {
				description: {
					type: "string",
					required: true,
					description: "Webhook description",
				},
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
				event: {
					type: "string",
					required: true,
					description: "Event type to trigger",
				},
				payload: {
					type: "object",
					required: true,
					description: "Event payload",
				},
				organizationId: {
					type: "string",
					required: false,
					description: "Organization ID to trigger webhooks for",
				},
				userId: {
					type: "string",
					required: false,
					description: "User ID to trigger webhooks for",
				},
			},
			outputSchema: {
				success: { type: "boolean" },
				message: { type: "string" },
			},
			errorCodes: [{ status: 401, meaning: "Unauthorized access" }],
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
