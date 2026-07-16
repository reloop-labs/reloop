/** Central query keys — use these instead of string literals. */
export const queryKeys = {
	auth: {
		all: ["auth"] as const,
		session: () => [...queryKeys.auth.all, "session"] as const,
		organizations: () => [...queryKeys.auth.all, "organizations"] as const,
		userInvitations: () => [...queryKeys.auth.all, "user-invitations"] as const,
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
