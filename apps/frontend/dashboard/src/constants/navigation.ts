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
		label: "Overview",
		path: "/",
		iconName: "home",
	},
	{
		label: "Agent Inbox",
		path: "/agent-inbox",
		iconName: "inbox",
	},
	{
		label: "Emails",
		path: "/emails",
		iconName: "mail-single",
		items: [
			{ label: "Sent", path: "/emails/sent", iconName: "mail-send" },
			{ label: "Received", path: "/emails/received", iconName: "mail-receive" },
		],
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
		iconName: "logs",
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
		label: "Workflows",
		path: "/workflows",
		iconName: "workflow",
	},
	{
		label: "SMTP",
		path: "/smtp",
		iconName: "mail-single",
	},
	{
		label: "Integrations",
		path: "/integrations",
		iconName: "integration",
	},
	{
		label: "Usage & Credits",
		path: "/credits",
		iconName: "doughnut",
	},
	{
		label: "Settings",
		path: "/settings",
		iconName: "gear",
		items: [
			{ label: "Workspace", path: "/settings", iconName: "gear" },
			{ label: "Members", path: "/settings/members", iconName: "users" },
			{ label: "Profile", path: "/settings/profile", iconName: "user" },
			{ label: "Security", path: "/settings/security", iconName: "shield-check" },
			{ label: "Theme", path: "/settings/theme", iconName: "swatch-book" },
		],
	},
];

export const userNavigation: MainNavigationItem[] = [
	{
		label: "General",
		path: "/settings/profile",
		iconName: "user",
	},
	{
		label: "Team",
		path: "/settings/members",
		iconName: "gear",
	},
	{
		label: "Security",
		path: "/settings/security",
		iconName: "shield-check",
	},
	{
		label: "Appearance",
		path: "/settings/theme",
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
