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
	domain: {
		all: ["domain"] as const,
		detail: (domainId: string) =>
			[...queryKeys.domain.all, "detail", domainId] as const,
		nameservers: (domainId: string) =>
			[...queryKeys.domain.all, "nameservers", domainId] as const,
		list: () => [...queryKeys.domain.all, "list"] as const,
	},
} as const;
