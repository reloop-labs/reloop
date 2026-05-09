export interface MainNavigationItem {
	label: string;
	path: string;
	iconName: string;
	variant?: "default" | "danger";
	action?: "signout";
	isSpecial?: boolean;
	items?: MainNavigationItem[];
}

export const mainNavigation: MainNavigationItem[] = [
	{
		label: "Ask AI",
		path: "/",
		iconName: "sparkling",
		isSpecial: true,
	},
	{
		label: "Emails",
		path: "/emails",
		iconName: "mail-single",
	},
	{
		label: "Metrics",
		path: "/metrics",
		iconName: "fat-row",
	},
	{
		label: "Contacts",
		path: "/contacts",
		iconName: "users",
		items: [
			{ label: "Properties", path: "/contacts/properties", iconName: "tag" },
			{ label: "Groups", path: "/contacts/groups", iconName: "modules" },
			{
				label: "Channels",
				path: "/contacts/channels",
				iconName: "notification-indicator",
			},
		],
	},
	{
		label: "Templates",
		path: "/templates",
		iconName: "layout",
	},
	{
		label: "API Keys",
		path: "/api-keys",
		iconName: "key-new",
	},
	{
		label: "Logs",
		path: "/logs",
		iconName: "file-text",
	},
	{
		label: "Domain",
		path: "/domain",
		iconName: "globe",
	},
	{
		label: "Webhooks",
		path: "/webhooks",
		iconName: "webhook",
	},
	{
		label: "Settings",
		path: "/settings",
		iconName: "gear",
		items: [
			{ label: "Members", path: "/settings/members", iconName: "users" },
			{ label: "SMTP", path: "/settings/smtp", iconName: "mail-single" },
			{
				label: "Integrations",
				path: "/settings/integrations",
				iconName: "webhook",
			},
			{ label: "Billing", path: "/settings/billing", iconName: "invoice" },
			{ label: "Usage", path: "/settings/usage", iconName: "barchart" },
		],
	},
];

export const userNavigation: MainNavigationItem[] = [
	{
		label: "General",
		path: "/settings",
		iconName: "user",
	},
	{
		label: "Team",
		path: "/settings/team",
		iconName: "gear",
	},
	{
		label: "Security",
		path: "/settings/security",
		iconName: "shield-check",
	},
	{
		label: "Appearance",
		path: "/settings/appearance",
		iconName: "swatch-book",
	},
	{
		label: "Sign out",
		path: "",
		iconName: "arrow-right-rec",
		variant: "danger",
		action: "signout",
	},
];
