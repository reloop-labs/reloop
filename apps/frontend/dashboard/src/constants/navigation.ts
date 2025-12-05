export interface MainNavigationItem {
	label: string;
	path: string;
	iconName: string;
	variant?: "default" | "danger";
	action?: "signout";
}

export const mainNavigation: MainNavigationItem[] = [
	{
		label: "Overview",
		path: "/",
		iconName: "house",
	},
	{
		label: "Audience",
		path: "/audience",
		iconName: "users",
	},
	{
		label: "API Keys",
		path: "/api-keys",
		iconName: "key",
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
