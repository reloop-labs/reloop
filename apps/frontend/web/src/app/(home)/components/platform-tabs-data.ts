export type PlatformTabId =
	| "domains"
	| "email"
	| "analytics"
	| "templates"
	| "agents"
	| "campaigns";

export const TABS: {
	id: PlatformTabId;
	title: string;
	description: string;
	badge?: string;
	nav: string;
}[] = [
	{
		id: "domains",
		title: "Domains",
		description: "Verify DNS once, send forever.",
		nav: "domain",
	},
	{
		id: "email",
		title: "Email",
		description: "Transactional API and SMTP relay.",
		nav: "emails",
	},
	{
		id: "analytics",
		title: "Analytics",
		description: "Delivery, opens and bounces live.",
		nav: "metrics",
	},
	{
		id: "templates",
		title: "Templates",
		description: "React Email blocks that scale.",
		badge: "AI",
		nav: "templates",
	},
	{
		id: "agents",
		title: "Agent Inbox",
		description: "Inbound email for AI agents.",
		badge: "AI",
		nav: "inbox",
	},
	{
		id: "campaigns",
		title: "Campaigns",
		description: "Send marketing emails in minutes.",
		nav: "campaigns",
	},
];

// Alt text per tab for a11y.
export const PLATFORM_ALT: Record<PlatformTabId, string> = {
	domains: "Domains: verify DNS once, send forever",
	email: "Email: transactional API and SMTP relay",
	analytics: "Analytics: delivery, opens and bounces live",
	templates: "Templates: React Email blocks that scale",
	agents: "Agent Inbox: inbound email for AI agents",
	campaigns: "Campaigns: bulk sends that convert",
};

// Distinct gradient backdrop per tab, light + dark.
export const TAB_GRADIENTS: Record<PlatformTabId, string> = {
	domains:
		"from-[#dbe7ff] via-[#eef3ff] to-bg-white-0 dark:from-[#0b1b33] dark:via-[#060b16] dark:to-black",
	email:
		"from-[#fdeecd] via-[#fdf6e7] to-bg-white-0 dark:from-[#2a1c07] dark:via-[#120d05] dark:to-black",
	analytics:
		"from-[#d2f3e3] via-[#e9faf2] to-bg-white-0 dark:from-[#06281c] dark:via-[#041209] dark:to-black",
	templates:
		"from-[#fbdce5] via-[#fdeef2] to-bg-white-0 dark:from-[#33101c] dark:via-[#160609] dark:to-black",
	agents:
		"from-[#e3d9fb] via-[#efe9fd] to-bg-white-0 dark:from-[#1e1245] dark:via-[#0d0722] dark:to-black",
	campaigns:
		"from-[#ffddd2] via-[#fdefe9] to-bg-white-0 dark:from-[#38130a] dark:via-[#190b06] dark:to-black",
};

// Per-tab screenshots (templates ships a single asset used for light + dark).
export const TAB_SCREENSHOT: Record<
	PlatformTabId,
	{ src: string; darkSrc: string }
> = {
	domains: {
		src: "/platform/domain-light.png",
		darkSrc: "/platform/domain-dark.png",
	},
	email: {
		src: "/platform/email-light.png",
		darkSrc: "/platform/email-dark.png",
	},
	analytics: {
		src: "/platform/analytics-light.png",
		darkSrc: "/platform/analytics-dark.png",
	},
	templates: {
		src: "/platform/template.png",
		darkSrc: "/platform/template.png",
	},
	agents: {
		src: "/platform/agent-inbox-light.png",
		darkSrc: "/platform/agent-inbox-dark.png",
	},
	campaigns: {
		src: "/platform/campaign-light.png",
		darkSrc: "/platform/campaign-dark.png",
	},
};
