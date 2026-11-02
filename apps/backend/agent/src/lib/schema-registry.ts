export type EndpointSchema = {
	method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
	path: string;
	domain: string;
	summary: string;
	description: string;
	request?: Record<string, unknown>;
	response?: Record<string, unknown>;
	exampleRequest?: unknown;
	exampleResponse?: unknown;
};

export const AGENT_ENDPOINT_SCHEMAS: EndpointSchema[] = [
	// Auth
	{
		method: "POST",
		path: "/api/agents/v1/auth/signup",
		domain: "auth",
		summary: "Agent Onboarding & Workspace Provisioning",
		description:
			"Idempotently creates a Reloop user (emailVerified: true) and default workspace for the verified AgentOnboard token. If account already exists, signs in.",
		request: {
			organizationName: {
				type: "string",
				required: false,
				description: "Optional custom name for the initial workspace",
			},
			organizationSlug: {
				type: "string",
				required: false,
				description:
					"Optional custom slug for the workspace (will be unique-checked)",
			},
		},
		response: {
			user: "string",
			organization: "string",
			created: "boolean",
			status: "string",
			message: "string",
		},
		exampleResponse: {
			user: "usr_abc123",
			organization: "org_xyz456",
			created: true,
			status: "created",
			message: "User account and workspace provisioned successfully.",
		},
	},
	{
		method: "GET",
		path: "/api/agents/v1/auth/me",
		domain: "auth",
		summary: "Agent Identity & Context",
		description:
			"Returns the verified agent identity, active workspace ID, credit balance, and instance limits.",
		response: {
			userId: "string",
			email: "string",
			organizationId: "string",
			platformRole: "string",
			creditsRemaining: "number",
		},
	},

	// Email
	{
		method: "POST",
		path: "/api/agents/v1/email/send",
		domain: "email",
		summary: "Send Transactional Email",
		description:
			"Sends an email with explicit deliverability warnings and structured tracking ID.",
		request: {
			to: {
				type: "string | string[]",
				required: true,
				description: "Recipient email address(es)",
			},
			subject: {
				type: "string",
				required: true,
				description: "Email subject line",
			},
			text: {
				type: "string",
				required: false,
				description: "Plain text version of email body",
			},
			html: {
				type: "string",
				required: false,
				description: "HTML version of email body",
			},
			from: {
				type: "string",
				required: false,
				description: "Sender address, e.g. 'Support <support@yourdomain.com>'",
			},
			replyTo: {
				type: "string",
				required: false,
				description: "Optional reply-to email address",
			},
		},
		response: {
			id: "string",
			status: "string",
			warnings: "string[]",
		},
	},
	{
		method: "GET",
		path: "/api/agents/v1/email/:id",
		domain: "email",
		summary: "Get Email Status",
		description:
			"Retrieves status, delivery events, bounces, and timestamps of a sent email.",
		response: {
			id: "string",
			status: "string",
			recipient: "string",
			subject: "string",
			sentAt: "string",
			events: "array",
		},
	},
	{
		method: "GET",
		path: "/api/agents/v1/email/list",
		domain: "email",
		summary: "List Sent Emails",
		description:
			"Lists recent emails sent by the active organization with pagination.",
		request: {
			page: { type: "number", required: false, default: 1 },
			limit: { type: "number", required: false, default: 20 },
			status: { type: "string", required: false },
		},
	},
	{
		method: "POST",
		path: "/api/agents/v1/email/:id/resend",
		domain: "email",
		summary: "Resend Email",
		description: "Resends a previously sent email by ID.",
	},
	{
		method: "GET",
		path: "/api/agents/v1/email/stats",
		domain: "email",
		summary: "Get Email Metrics",
		description: "Returns email deliverability, open, click, and bounce rates.",
	},

	// Inbox
	{
		method: "GET",
		path: "/api/agents/v1/inbox/mailboxes",
		domain: "inbox",
		summary: "List Inboxes",
		description: "Lists incoming mailboxes configured for this workspace.",
	},
	{
		method: "GET",
		path: "/api/agents/v1/inbox/threads",
		domain: "inbox",
		summary: "List Conversation Threads",
		description: "Retrieves incoming email threads.",
	},
	{
		method: "GET",
		path: "/api/agents/v1/inbox/threads/:id",
		domain: "inbox",
		summary: "Get Thread Conversation",
		description: "Retrieves complete conversation history for an email thread.",
	},
	{
		method: "POST",
		path: "/api/agents/v1/inbox/messages/:id/reply",
		domain: "inbox",
		summary: "Reply to Inbox Message",
		description:
			"Sends a direct reply to an incoming message in thread context.",
		request: {
			body: {
				type: "string",
				required: true,
				description: "Reply message text/html",
			},
		},
	},
	{
		method: "POST",
		path: "/api/agents/v1/inbox/messages/send",
		domain: "inbox",
		summary: "Send Message from Inbox",
		description:
			"Sends an outbound email directly from an inbox mailbox address.",
		request: {
			mailboxId: { type: "string", required: true },
			to: { type: "string | string[]", required: true },
			subject: { type: "string", required: true },
			body: { type: "string", required: true },
		},
	},

	// Domains
	{
		method: "GET",
		path: "/api/agents/v1/domain/list",
		domain: "domain",
		summary: "List Sending Domains",
		description: "Lists sending domains and their DNS verification statuses.",
	},
	{
		method: "POST",
		path: "/api/agents/v1/domain/create",
		domain: "domain",
		summary: "Register Sending Domain",
		description:
			"Adds a domain to the workspace and returns required SPF, DKIM, DMARC DNS records.",
		request: {
			name: { type: "string", required: true, example: "mail.myagent.com" },
		},
	},
	{
		method: "POST",
		path: "/api/agents/v1/domain/:id/verify",
		domain: "domain",
		summary: "Verify Domain DNS",
		description: "Triggers immediate DNS check to confirm SPF and DKIM setup.",
	},

	// Intelligence / Tools
	{
		method: "POST",
		path: "/api/agents/v1/intelligence/check-temp-email",
		domain: "intelligence",
		summary: "Check Disposable / Temp Email",
		description:
			"Checks if a recipient email or domain is disposable, a role address, or free consumer webmail.",
		request: {
			email: { type: "string", required: true, example: "test@temp-mail.org" },
		},
	},
	{
		method: "POST",
		path: "/api/agents/v1/intelligence/check-bimi",
		domain: "intelligence",
		summary: "Check BIMI & DMARC Enforcement",
		description:
			"Checks BIMI record, SVG logo accessibility, and DMARC enforcement.",
		request: {
			domain: { type: "string", required: true, example: "example.com" },
		},
	},
	{
		method: "POST",
		path: "/api/agents/v1/intelligence/check-domain-age",
		domain: "intelligence",
		summary: "Check Domain Age",
		description:
			"Returns domain registration date and age to assess send risk.",
		request: {
			domain: { type: "string", required: true, example: "example.com" },
		},
	},
	{
		method: "POST",
		path: "/api/agents/v1/intelligence/check-domain-reputation",
		domain: "intelligence",
		summary: "Check Domain Reputation",
		description:
			"Checks domain spam scores, blacklists, and deliverability risk.",
		request: {
			domain: { type: "string", required: true, example: "example.com" },
		},
	},

	// Contacts & Audiences
	{
		method: "GET",
		path: "/api/agents/v1/contact/list",
		domain: "contact",
		summary: "List Contacts",
		description:
			"Lists contacts in this workspace with properties and channels.",
	},
	{
		method: "POST",
		path: "/api/agents/v1/contact/create",
		domain: "contact",
		summary: "Create Contact",
		description: "Adds a new contact with email and custom attributes.",
		request: {
			email: { type: "string", required: true },
			firstName: { type: "string", required: false },
			lastName: { type: "string", required: false },
			properties: { type: "record", required: false },
		},
	},

	// Templates
	{
		method: "GET",
		path: "/api/agents/v1/template/list",
		domain: "template",
		summary: "List Templates",
		description: "Lists email templates in the active workspace.",
	},
	{
		method: "POST",
		path: "/api/agents/v1/template/create",
		domain: "template",
		summary: "Create Template",
		description: "Creates an HTML or Markdown email template.",
		request: {
			name: { type: "string", required: true },
			subject: { type: "string", required: true },
			html: { type: "string", required: true },
		},
	},

	// Automations
	{
		method: "GET",
		path: "/api/agents/v1/automation/list",
		domain: "automation",
		summary: "List Automations",
		description: "Lists email workflows and automations.",
	},
	{
		method: "POST",
		path: "/api/agents/v1/automation/:id/activate",
		domain: "automation",
		summary: "Activate Automation",
		description: "Activates a paused automation.",
	},
];

export function getDomainSchemas(domain: string): EndpointSchema[] {
	return AGENT_ENDPOINT_SCHEMAS.filter(
		(s) => s.domain.toLowerCase() === domain.toLowerCase(),
	);
}

export function findRouteSchema(
	path: string,
	method: string,
): EndpointSchema | undefined {
	const normalizedMethod = method.toUpperCase();
	return AGENT_ENDPOINT_SCHEMAS.find(
		(s) =>
			s.method === normalizedMethod &&
			(s.path === path ||
				s.path.replace(/:[a-zA-Z0-9_]+/g, "*") ===
					path.replace(/:[a-zA-Z0-9_]+/g, "*")),
	);
}
