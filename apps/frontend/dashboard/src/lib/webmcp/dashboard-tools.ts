import { toWebMcpText, type WebMcpTool } from "@reloop/webmcp";

/**
 * Read-only account tools exposed to in-browser agents via WebMCP. They call
 * the same session-authenticated endpoints the dashboard uses, so they act as
 * the signed-in user. Names match the hosted Reloop MCP server, so agents see
 * one vocabulary; writes stay on that server, where they need explicit auth.
 */

const readOnly = { readOnlyHint: true } as const;

const DASHBOARD_PAGES = [
	"sent-emails",
	"domain",
	"contacts",
	"templates",
	"automation",
	"campaigns",
	"inbox",
	"agent-inbox",
	"api-keys",
	"webhooks",
	"smtp",
	"metrics",
	"logs",
	"integrations",
	"settings",
	"help",
] as const;

type DashboardPage = (typeof DASHBOARD_PAGES)[number];

const pagination = {
	page: { type: "number", description: "Page number, starting at 1" },
	limit: { type: "number", description: "Results per page (default 20)" },
};

type PageInput = { page?: number; limit?: number };

const idInput = (description: string) => ({
	type: "object",
	properties: { id: { type: "string", description } },
	required: ["id"],
});

function query(params: Record<string, string | number | undefined>): string {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== "") search.set(key, String(value));
	}
	return search.toString();
}

async function getJson(path: string, signal?: AbortSignal): Promise<string> {
	const res = await fetch(path, { credentials: "include", signal });
	if (res.status === 401 || res.status === 403) {
		throw new Error(
			"Not signed in to Reloop. Ask the user to sign in at /dashboard/login.",
		);
	}
	if (!res.ok) throw new Error(`Request failed (${res.status}): ${path}`);
	return toWebMcpText(await res.json());
}

export const dashboardWebMcpTools: WebMcpTool[] = [
	{
		name: "list_domains",
		description:
			"List the organization's sending domains with their verification status.",
		inputSchema: {
			type: "object",
			properties: {
				...pagination,
				status: {
					type: "string",
					enum: ["pending", "verifying", "active", "suspended", "failed"],
					description: "Only return domains with this status",
				},
				q: { type: "string", description: "Search by domain name" },
			},
		},
		annotations: readOnly,
		execute: (input, { signal }) => {
			const {
				page = 1,
				limit = 20,
				status,
				q,
			} = input as PageInput & {
				status?: string;
				q?: string;
			};
			return getJson(
				`/api/domain/v1/list?${query({ page, limit, status, q })}`,
				signal,
			);
		},
	},
	{
		name: "get_domain",
		description:
			"Get a sending domain with its DNS records and verification state.",
		inputSchema: idInput("Domain ID from list_domains"),
		annotations: readOnly,
		execute: (input, { signal }) =>
			getJson(
				`/api/domain/v1/${encodeURIComponent((input as { id: string }).id)}`,
				signal,
			),
	},
	{
		name: "list_emails",
		description:
			"List email the organization sent, newest first, with delivery status. Filter by status, domain or date range.",
		inputSchema: {
			type: "object",
			properties: {
				...pagination,
				search: {
					type: "string",
					description: "Search recipients and subjects",
				},
				status: {
					type: "string",
					description: "Delivery status, e.g. delivered, bounced",
				},
				domain: { type: "string", description: "Sending domain" },
				startDate: { type: "string", description: "ISO 8601 start date" },
				endDate: { type: "string", description: "ISO 8601 end date" },
			},
		},
		annotations: { ...readOnly, untrustedContentHint: true },
		execute: (input, { signal }) => {
			const {
				page = 1,
				limit = 20,
				search,
				status,
				domain,
				startDate,
				endDate,
			} = input as PageInput & Record<string, string | undefined>;
			return getJson(
				`/api/logs/v1/emails?${query({
					page,
					limit,
					search,
					status,
					domain,
					start_date: startDate,
					end_date: endDate,
				})}`,
				signal,
			);
		},
	},
	{
		name: "get_email",
		description:
			"Get a sent email with its content, recipients and delivery events.",
		inputSchema: idInput("Email ID from list_emails"),
		annotations: { ...readOnly, untrustedContentHint: true },
		execute: (input, { signal }) =>
			getJson(
				`/api/logs/v1/emails/${encodeURIComponent((input as { id: string }).id)}`,
				signal,
			),
	},
	{
		name: "get_email_stats",
		description:
			"Get sending statistics (sent, delivered, opened, clicked, bounced, complained) over a date range.",
		inputSchema: {
			type: "object",
			properties: {
				startDate: { type: "string", description: "ISO 8601 start date" },
				endDate: { type: "string", description: "ISO 8601 end date" },
				domainId: {
					type: "string",
					description: "Only count email sent from this domain ID",
				},
			},
		},
		annotations: readOnly,
		execute: (input, { signal }) => {
			const { startDate, endDate, domainId } = input as Record<
				string,
				string | undefined
			>;
			return getJson(
				`/api/logs/v1/emails/stats?${query({
					start_date: startDate,
					end_date: endDate,
					domain_id: domainId,
				})}`,
				signal,
			);
		},
	},
	{
		name: "list_contacts",
		description:
			"List the organization's contacts. Search by email or name and filter by status.",
		inputSchema: {
			type: "object",
			properties: {
				...pagination,
				search: { type: "string", description: "Search email or name" },
				status: {
					type: "string",
					description: "Comma-separated contact statuses",
				},
			},
		},
		annotations: readOnly,
		execute: (input, { signal }) => {
			const {
				page = 1,
				limit = 20,
				search,
				status,
			} = input as PageInput & {
				search?: string;
				status?: string;
			};
			return getJson(
				`/api/contacts/list?${query({ page, limit, search, status })}`,
				signal,
			);
		},
	},
	{
		name: "get_contact",
		description: "Get a contact with its properties and channel subscriptions.",
		inputSchema: idInput("Contact ID from list_contacts"),
		annotations: readOnly,
		execute: (input, { signal }) =>
			getJson(
				`/api/contacts/retrieve/${encodeURIComponent((input as { id: string }).id)}`,
				signal,
			),
	},
	{
		name: "list_templates",
		description: "List the organization's email templates.",
		inputSchema: { type: "object", properties: pagination },
		annotations: readOnly,
		execute: (input, { signal }) => {
			const { page = 1, limit = 20 } = input as PageInput;
			return getJson(`/api/template/v1/list?${query({ page, limit })}`, signal);
		},
	},
	{
		name: "list_mailboxes",
		description:
			"List the organization's inbox mailboxes (addresses that receive email).",
		inputSchema: { type: "object", properties: {} },
		annotations: readOnly,
		execute: (_input, { signal }) =>
			getJson("/api/inbox/v1/mailboxes/list", signal),
	},
	{
		name: "open_dashboard_page",
		description:
			"Navigate the Reloop dashboard to a section so the user can see it.",
		inputSchema: {
			type: "object",
			properties: {
				page: {
					type: "string",
					enum: [...DASHBOARD_PAGES],
					description: "Dashboard section to open",
				},
			},
			required: ["page"],
		},
		execute: async (input) => {
			const { page } = input as { page: DashboardPage };
			if (!DASHBOARD_PAGES.includes(page)) {
				throw new Error(`Unknown dashboard page: ${page}`);
			}
			window.location.assign(
				page === "sent-emails" ? "/dashboard" : `/dashboard/${page}`,
			);
			return toWebMcpText({ opened: page });
		},
	},
];
