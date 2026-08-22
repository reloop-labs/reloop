export type NavItem = {
	href: string;
	label: string;
	iconName: string;
	description?: string;
};

export type NavGroup = {
	label: string;
	items: NavItem[];
};

/**
 * Primary console nav. Domain / credit ledgers live inside org hubs
 * (utility routes still exist for deep links from Overview / hubs).
 */
export const ADMIN_NAV_GROUPS: NavGroup[] = [
	{
		label: "Operate",
		items: [
			{
				href: "/",
				label: "Overview",
				iconName: "home",
				description: "Attention & health",
			},
			{
				href: "/support",
				label: "Support",
				iconName: "comment-text",
				description: "Live customer inbox",
			},
			{
				href: "/emails",
				label: "Emails",
				iconName: "mail",
				description: "All emails across orgs",
			},
			{
				href: "/audit",
				label: "Audit",
				iconName: "logs",
				description: "Admin action history",
			},
		],
	},
	{
		label: "Directory",
		items: [
			{
				href: "/organizations",
				label: "Organizations",
				iconName: "modules",
				description: "Full org hubs",
			},
			{
				href: "/users",
				label: "Users",
				iconName: "users",
				description: "People across platform",
			},
		],
	},
];

/** Flat list for palette / active matching */
export const ADMIN_NAV = ADMIN_NAV_GROUPS.flatMap((g) => g.items);
