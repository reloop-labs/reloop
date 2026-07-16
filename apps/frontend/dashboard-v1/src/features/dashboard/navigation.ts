export type MainNavigationItem = {
	label: string;
	path: string;
	iconName: string;
	variant?: "default" | "danger";
	action?: "signout";
	isSpecial?: boolean;
	items?: MainNavigationItem[];
	section?: string;
};

export const mainNavigation: MainNavigationItem[] = [
	{
		label: "Overview",
		path: "/",
		iconName: "home",
		section: "Main",
	},
	{
		label: "Agent Inbox",
		path: "/agent-inbox",
		iconName: "inbox",
		section: "Main",
	},
	{
		label: "Contacts",
		path: "/contacts",
		iconName: "contacts",
		section: "Email",
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
		label: "Emails",
		path: "/emails",
		iconName: "mail-single",
		section: "Email",
		items: [
			{ label: "Sent", path: "/emails/sent", iconName: "mail-send" },
			{ label: "Received", path: "/emails/received", iconName: "mail-receive" },
		],
	},
	{
		label: "Templates",
		path: "/templates",
		iconName: "layout",
		section: "Email",
	},
	{
		label: "Workflows",
		path: "/workflows",
		iconName: "workflow",
		section: "Email",
	},
	{
		label: "Metrics",
		path: "/metrics",
		iconName: "fat-row",
		section: "Analytics",
	},
	{
		label: "Logs",
		path: "/logs",
		iconName: "logs",
		section: "Analytics",
	},
	{
		label: "API Keys",
		path: "/api-keys",
		iconName: "key-new",
		section: "Developer",
	},
	{
		label: "Domain",
		path: "/domain",
		iconName: "globe",
		section: "Developer",
	},
	{
		label: "Webhooks",
		path: "/webhooks",
		iconName: "webhook",
		section: "Developer",
	},
	{
		label: "Integrations",
		path: "/integrations",
		iconName: "integration",
		section: "Developer",
	},
	{
		label: "SMTP",
		path: "/smtp",
		iconName: "smtp",
		section: "Developer",
	},
	{
		label: "Settings",
		path: "/settings",
		iconName: "gear",
		section: "Settings",
	},
];

export type SettingsNavigationItem = {
	label: string;
	path: string;
	iconName: string;
	/** Owner/admin only (usage, billing, workspace settings). */
	requiresOrgAdmin?: boolean;
	/** Owner/admin only (team management). */
	requiresTeamAdmin?: boolean;
};

export type SettingsNavigationSection = {
	section: string;
	items: SettingsNavigationItem[];
};

/** Default settings landing for members without org-admin access. */
export const SETTINGS_MEMBER_HOME = "/settings/profile";

/** Default settings landing for owners/admins. */
export const SETTINGS_ADMIN_HOME = "/settings";

export const settingsNavigation: SettingsNavigationSection[] = [
	{
		section: "Workspace",
		items: [
			{
				label: "Usage",
				path: "/settings",
				iconName: "doughnut",
				requiresOrgAdmin: true,
			},
			{
				label: "Billing",
				path: "/settings/billing",
				iconName: "billing-custom",
				requiresOrgAdmin: true,
			},
			{
				label: "Teams",
				path: "/settings/teams",
				iconName: "users",
				requiresTeamAdmin: true,
			},
			{
				label: "Workspace",
				path: "/settings/workspace",
				iconName: "workspace-custom",
				requiresOrgAdmin: true,
			},
		],
	},
	{
		section: "Account",
		items: [
			{ label: "Profile", path: "/settings/profile", iconName: "user" },
			{
				label: "Security",
				path: "/settings/security",
				iconName: "shield-check",
			},
			{ label: "Theme", path: "/settings/theme", iconName: "swatch-book" },
		],
	},
];
