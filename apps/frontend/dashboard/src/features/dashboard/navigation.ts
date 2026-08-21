export type MainNavigationItem = {
	label: string;
	path: string;
	iconName: string;
	shortcut?: { label: string; keys: string[] };
	variant?: "default" | "danger";
	action?: "signout";
	isSpecial?: boolean;
	items?: MainNavigationItem[];
	section?: string;
};

export const mainNavigation: MainNavigationItem[] = [
	{
		label: "Emails",
		path: "/",
		iconName: "mail-single",
		shortcut: { label: "G E", keys: ["g e", "g+e"] },
		section: "Main",
	},
	{
		label: "Inbox",
		path: "/inbox",
		iconName: "inbox",
		shortcut: { label: "G I", keys: ["g i", "g+i"] },
		section: "Main",
	},
	{
		label: "Contacts",
		path: "/contacts",
		iconName: "contacts",
		shortcut: { label: "G C", keys: ["g c", "g+c"] },
		section: "Messaging",
		items: [
			{
				label: "Properties",
				path: "/contacts/properties",
				iconName: "tag",
				shortcut: { label: "G P", keys: ["g p", "g+p"] },
			},
			{
				label: "Groups",
				path: "/contacts/groups",
				iconName: "modules",
				shortcut: { label: "G G", keys: ["g g", "g+g"] },
			},
			{
				label: "Channels",
				path: "/contacts/channels",
				iconName: "notification-indicator",
				shortcut: { label: "G H", keys: ["g h", "g+h"] },
			},
		],
	},
	{
		label: "Templates",
		path: "/templates",
		iconName: "layout",
		shortcut: { label: "G T", keys: ["g t", "g+t"] },
		section: "Messaging",
	},
	{
		label: "Workflows",
		path: "/workflows",
		iconName: "workflow",
		shortcut: { label: "G F", keys: ["g f", "g+f"] },
		section: "Messaging",
	},
	{
		label: "Metrics",
		path: "/metrics",
		iconName: "fat-row",
		shortcut: { label: "G M", keys: ["g m", "g+m"] },
		section: "Analytics",
	},
	{
		label: "Logs",
		path: "/logs",
		iconName: "logs",
		shortcut: { label: "G L", keys: ["g l", "g+l"] },
		section: "Analytics",
	},
	{
		label: "API Keys",
		path: "/api-keys",
		iconName: "key-new",
		shortcut: { label: "G K", keys: ["g k", "g+k", "g a", "g+a"] },
		section: "Developer",
	},
	{
		label: "Domain",
		path: "/domain",
		iconName: "globe",
		shortcut: { label: "G D", keys: ["g d", "g+d"] },
		section: "Developer",
	},
	{
		label: "Webhooks",
		path: "/webhooks",
		iconName: "webhook",
		shortcut: { label: "G W", keys: ["g w", "g+w"] },
		section: "Developer",
	},
	{
		label: "Integrations",
		path: "/integrations",
		iconName: "integration",
		shortcut: { label: "G N", keys: ["g n", "g+n"] },
		section: "Developer",
	},
	{
		label: "SMTP",
		path: "/smtp",
		iconName: "smtp",
		shortcut: { label: "G S", keys: ["g s", "g+s"] },
		section: "Developer",
	},
	{
		label: "Settings",
		path: "/settings",
		iconName: "gear",
		shortcut: { label: "G ,", keys: ["g ,", "g+,"] },
		section: "Settings",
	},
];

export type SettingsNavigationItem = {
	label: string;
	path: string;
	iconName: string;
	shortcut?: { label: string; keys: string[] };
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
				shortcut: { label: "G U", keys: ["g u", "g+u"] },
			},
			{
				label: "Billing",
				path: "/settings/billing",
				iconName: "billing-custom",
				requiresOrgAdmin: true,
				shortcut: { label: "G B", keys: ["g b", "g+b"] },
			},
			{
				label: "Teams",
				path: "/settings/teams",
				iconName: "users",
				requiresTeamAdmin: true,
				shortcut: { label: "G Shift+T", keys: ["g shift+t", "g+shift+t"] },
			},
			{
				label: "Organization",
				path: "/settings/organization",
				iconName: "workspace-custom",
				requiresOrgAdmin: true,
				shortcut: { label: "G Shift+W", keys: ["g shift+w", "g+shift+w"] },
			},
		],
	},
	{
		section: "Account",
		items: [
			{
				label: "Profile",
				path: "/settings/profile",
				iconName: "user",
				shortcut: { label: "G Shift+P", keys: ["g shift+p", "g+shift+p"] },
			},
			{
				label: "Security",
				path: "/settings/security",
				iconName: "shield-check",
				shortcut: { label: "G Shift+S", keys: ["g shift+s", "g+shift+s"] },
			},
			{
				label: "Shortcuts",
				path: "/settings/shortcuts",
				iconName: "keyboard",
				shortcut: { label: "G Shift+K", keys: ["g shift+k", "g+shift+k"] },
			},
			{
				label: "Theme",
				path: "/settings/theme",
				iconName: "swatch-book",
				shortcut: { label: "G Shift+H", keys: ["g shift+h", "g+shift+h"] },
			},
		],
	},
];

/** Filter settings nav by org role. Empty sections are dropped. */
export function filterSettingsNavigation(
	sections: SettingsNavigationSection[],
	perms: { isOrgAdmin: boolean; canManageTeam: boolean },
): SettingsNavigationSection[] {
	return sections
		.map((section) => ({
			...section,
			items: section.items.filter((item) => {
				if (item.requiresOrgAdmin && !perms.isOrgAdmin) return false;
				if (item.requiresTeamAdmin && !perms.canManageTeam) return false;
				return true;
			}),
		}))
		.filter((section) => section.items.length > 0);
}
