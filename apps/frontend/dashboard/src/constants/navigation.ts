export interface MainNavigationItem {
	label: string;
	path: string;
	iconName: string;
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
		label: "Mailboxes",
		path: "/mailboxes",
		iconName: "mail",
	},
	{
		label: "Settings",
		path: "/settings",
		iconName: "gear",
	},
];
