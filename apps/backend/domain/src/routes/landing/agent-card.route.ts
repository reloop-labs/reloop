import { Elysia } from "elysia";

export const agentCardRoute = new Elysia().get("/agent-card.json", () => ({
	name: "Domain Service",
	version: "1.0.0",
	description:
		"Service for managing and verifying sending domains for the Reloop platform.",
	url: "https://reloop.sh",
	defaultInputModes: ["application/json"],
	defaultOutputModes: ["application/json"],
	supportsStreaming: false,
	skills: [
		{
			id: "health_check",
			name: "Health Check",
			description: "Check the health of the domain service.",
			method: "GET",
			path: "/api/domain/health",
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
			id: "create_domain",
			name: "Create Domain",
			description: "Add a new domain to an organization for verification.",
			method: "POST",
			path: "/api/domain/v1/create",
			tags: ["setup"],
			inputSchema: {
				domain: {
					type: "string",
					required: true,
					description: "e.g., example.com",
				},
			},
			outputSchema: {
				id: { type: "string" },
				verificationRecords: {
					type: "array",
					description: "DNS records required for verification",
				},
			},
			errorCodes: [],
			examples: [],
		},
		{
			id: "verify_domain",
			name: "Verify Domain",
			description: "Trigger a DNS check to verify ownership of a domain.",
			method: "POST",
			path: "/api/domain/v1/verify/:domain_id",
			tags: ["setup"],
			inputSchema: {
				domain_id: { type: "string", required: true },
			},
			outputSchema: {
				status: { type: "string", description: "Verified, Pending, etc." },
			},
			errorCodes: [],
			examples: [],
		},
	],
	usage_guidelines:
		"1. Domains must be verified via DNS records (TXT/CNAME) before use.\n2. We support DKIM and SPF verification for enhanced deliverability.\n3. One domain can only be associated with one organization at a time.",
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
