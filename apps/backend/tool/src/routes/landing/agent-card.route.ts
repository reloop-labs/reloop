import { Elysia } from "elysia";

export const agentCardRoute = new Elysia().get("/agent-card.json", () => ({
	name: "Tool Service",
	version: "1.0.0",
	description:
		"Checks email addresses for disposable domains, role addresses and free consumer providers. Public, unauthenticated and stateless.",
	url: "https://reloop.sh",
	defaultInputModes: ["application/json"],
	defaultOutputModes: ["application/json"],
	supportsStreaming: false,
	skills: [
		{
			id: "health_check",
			name: "Health Check",
			description: "Check the health of the tool service.",
			method: "GET",
			path: "/api/tool/health",
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
			id: "check_email",
			name: "Check Email",
			description:
				"Report whether an email address or bare domain is disposable, a role address, or from a free consumer provider.",
			method: "POST",
			path: "/api/tool/v1/check",
			tags: ["tool"],
			inputSchema: {
				email: {
					type: "string",
					required: true,
					description: "An email address or bare domain, e.g. you@example.com",
				},
			},
			outputSchema: {
				verdict: {
					type: "string",
					description: "invalid | disposable | risky | deliverable",
				},
				isDisposable: { type: "boolean" },
				isRoleAddress: { type: "boolean" },
				isFreeProvider: { type: "boolean" },
			},
			errorCodes: [400, 429],
			examples: [
				{
					input: { email: "you@mailinator.com" },
					output: { verdict: "disposable", isDisposable: true },
				},
			],
		},
	],
}));
