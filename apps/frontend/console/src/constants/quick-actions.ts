export type ConsoleQuickAction = {
	id: string;
	label: string;
	description?: string;
	iconName: string;
	href: string;
	/** When true, UI should open command palette instead of navigating */
	isSearch?: boolean;
};

/** Canonical quick actions — order is the default before usage ranking. */
export const CONSOLE_QUICK_ACTIONS: ConsoleQuickAction[] = [
	{
		id: "search",
		label: "Search platform",
		description: "Users & organizations",
		iconName: "search",
		href: "#",
		isSearch: true,
	},
	{
		id: "support",
		label: "Support inbox",
		description: "Customer conversations",
		iconName: "comment-text",
		href: "/support",
	},
	{
		id: "topup-orgs",
		label: "Top up credits",
		description: "Open an organization hub",
		iconName: "doughnut",
		href: "/organizations",
	},
	{
		id: "suspended-orgs",
		label: "Suspended organizations",
		description: "Accounts currently blocked",
		iconName: "modules",
		href: "/organizations?status=suspended",
	},
	{
		id: "failed-domains",
		label: "Failed domains",
		description: "Platform-wide domain failures",
		iconName: "globe",
		href: "/domains?status=failed",
	},
	{
		id: "failed-emails",
		label: "Failed emails",
		description: "Today’s delivery failures",
		iconName: "mail-single",
		href: "/emails?status=failed",
	},
	{
		id: "audit",
		label: "Audit log",
		description: "Who changed what",
		iconName: "logs",
		href: "/audit",
	},
	{
		id: "users",
		label: "Users",
		description: "Ban, promote, impersonate",
		iconName: "users",
		href: "/users",
	},
];
