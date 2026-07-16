/** Central query keys — use these instead of string literals. */
export const queryKeys = {
	auth: {
		all: ["auth"] as const,
		session: () => [...queryKeys.auth.all, "session"] as const,
		organizations: () => [...queryKeys.auth.all, "organizations"] as const,
		userInvitations: () => [...queryKeys.auth.all, "user-invitations"] as const,
		accounts: () => [...queryKeys.auth.all, "accounts"] as const,
		sessions: () => [...queryKeys.auth.all, "sessions"] as const,
	},
	organization: {
		all: ["organization"] as const,
		members: (orgId: string) =>
			[...queryKeys.organization.all, "members", orgId] as const,
		invitations: (orgId: string) =>
			[...queryKeys.organization.all, "invitations", orgId] as const,
	},
	billing: {
		all: ["billing"] as const,
		usage: () => [...queryKeys.billing.all, "usage"] as const,
	},
	apiKeys: {
		all: ["api-keys"] as const,
		list: (params: {
			page: number;
			limit: number;
			status: string;
			creator: string;
			q: string;
		}) => [...queryKeys.apiKeys.all, "list", params] as const,
		detail: (id: string) => [...queryKeys.apiKeys.all, "detail", id] as const,
	},
	logs: {
		all: ["logs"] as const,
		list: (params: {
			page: number;
			limit: number;
			search: string;
			startDate: string;
			endDate: string;
			statusCode: string;
			outcome: string;
			actorId: string;
		}) => [...queryKeys.logs.all, "list", params] as const,
		detail: (id: string) => [...queryKeys.logs.all, "detail", id] as const,
	},
	contacts: {
		all: ["contacts"] as const,
		list: (params: {
			page: number;
			limit: number;
			search: string;
			status: string;
		}) => [...queryKeys.contacts.all, "list", params] as const,
		detail: (id: string) =>
			[...queryKeys.contacts.all, "detail", id] as const,
		activity: (email: string) =>
			[...queryKeys.contacts.all, "activity", email] as const,
		groups: (params: { page: number; limit: number; search: string }) =>
			[...queryKeys.contacts.all, "groups", params] as const,
		groupDetail: (id: string) =>
			[...queryKeys.contacts.all, "group-detail", id] as const,
		groupContacts: (params: {
			groupId: string;
			page: number;
			limit: number;
		}) => [...queryKeys.contacts.all, "group-contacts", params] as const,
		groupCount: (groupId: string) =>
			[...queryKeys.contacts.all, "group-count", groupId] as const,
		properties: (params: {
			page: number;
			limit: number;
			search: string;
			type: string;
		}) => [...queryKeys.contacts.all, "properties", params] as const,
		propertiesAll: () =>
			[...queryKeys.contacts.all, "properties", "all"] as const,
		channels: () => [...queryKeys.contacts.all, "channels"] as const,
	},
	templates: {
		all: ["templates"] as const,
		list: () => [...queryKeys.templates.all, "list"] as const,
		detail: (id: string) =>
			[...queryKeys.templates.all, "detail", id] as const,
	},
	webhooks: {
		all: ["webhooks"] as const,
		list: (orgId: string) =>
			[...queryKeys.webhooks.all, "list", orgId] as const,
		detail: (id: string) =>
			[...queryKeys.webhooks.all, "detail", id] as const,
		deliveries: (params: {
			webhookId: string;
			page: number;
			limit: number;
		}) => [...queryKeys.webhooks.all, "deliveries", params] as const,
	},
	metrics: {
		all: ["metrics"] as const,
		emailStats: (params: {
			startDate: string;
			endDate: string;
			domain: string;
		}) => [...queryKeys.metrics.all, "email-stats", params] as const,
	},
	emails: {
		all: ["emails"] as const,
		sent: (params: {
			page: number;
			limit: number;
			search: string;
			domain: string;
			apiKeyId: string;
			status: string;
			startDate: string;
			endDate: string;
		}) => [...queryKeys.emails.all, "sent", params] as const,
		received: () => [...queryKeys.emails.all, "received"] as const,
		mailboxes: () => [...queryKeys.emails.all, "mailboxes"] as const,
		detail: (id: string) => [...queryKeys.emails.all, "detail", id] as const,
	},
	domain: {
		all: ["domain"] as const,
		detail: (domainId: string) =>
			[...queryKeys.domain.all, "detail", domainId] as const,
		nameservers: (domainId: string) =>
			[...queryKeys.domain.all, "nameservers", domainId] as const,
		list: (params?: {
			page: number;
			limit: number;
			status: string;
			q: string;
		}) =>
			params
				? ([...queryKeys.domain.all, "list", params] as const)
				: ([...queryKeys.domain.all, "list"] as const),
	},
} as const;
