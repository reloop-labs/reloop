import { Elysia } from "elysia";

export const agentCardRoute = new Elysia().get("/agent-card.json", () => ({
	name: "Tools Service",
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
			description: "Check the health of the tools service.",
			method: "GET",
			path: "/api/tools/health",
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
			path: "/api/tools/v1/temp-email-checker",
			tags: ["tools"],
			inputSchema: {
				email: {
					type: "string",
					required: true,
					description: "An email address or bare domain, e.g. you@example.com",
				},
			},
			outputSchema: {
				input: { type: "string" },
				domain: { type: "string" },
				verdict: {
					type: "string",
					description: "invalid | disposable | risky | deliverable",
				},
				isDisposable: { type: "boolean" },
				mxRecords: { type: "array" },
				confidence: { type: "number" },
				riskScore: { type: "number" },
				flags: { type: "array" },
			},
			errorCodes: [400, 429],
			examples: [
				{
					input: { email: "alex.hunter@temp-mail.org" },
					output: {
						input: "alex.hunter@temp-mail.org",
						domain: "temp-mail.org",
						verdict: "disposable",
						isDisposable: true,
						mxRecords: ["mx1.temp-mail.org", "mx2.temp-mail.org"],
						confidence: 0.98,
						riskScore: 0.94,
						flags: ["DISPOSABLE_DOMAIN", "PUBLIC_INBOX_DETECTED"],
					},
				},
			],
		},
		{
			id: "bimi_check",
			name: "BIMI Check",
			description:
				"Look up default._bimi for a domain, validate the BIMI record and logo URL, and confirm DMARC is at enforcement.",
			method: "POST",
			path: "/api/tools/v1/bimi-check",
			tags: ["tools"],
			inputSchema: {
				domain: {
					type: "string",
					required: true,
					description: "Domain name, e.g. example.com",
				},
			},
			outputSchema: {
				verdict: { type: "string", description: "pass | warn | fail" },
				bimiRecord: { type: "string", nullable: true },
				dmarcEnforced: { type: "boolean" },
			},
			errorCodes: [400, 429],
			examples: [
				{
					input: { domain: "example.com" },
					output: { verdict: "fail", dmarcEnforced: false },
				},
			],
		},
	],
}));
