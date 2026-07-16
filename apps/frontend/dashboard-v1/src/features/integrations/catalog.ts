/**
 * Integrations catalog for dashboard-v1.
 * Native pathways deep-link into existing product surfaces;
 * platform entries are discovery / roadmap.
 */

export type IntegrationCategory =
	| "native"
	| "automation"
	| "commerce"
	| "developer";

export type IntegrationStatus = "available" | "coming_soon";

export type NativeIntegration = {
	id: string;
	kind: "native";
	name: string;
	description: string;
	category: "native" | "developer";
	status: "available";
	/** Lucide / Reloop icon sprite name */
	iconName: string;
	href: string;
	accent: string;
	cta: string;
};

export type PlatformIntegration = {
	id: string;
	kind: "platform";
	name: string;
	description: string;
	category: "automation" | "commerce" | "developer";
	status: IntegrationStatus;
	/** simple-icons export key, e.g. siZapier */
	simpleIconKey: string;
	docsHref?: string;
};

export type IntegrationItem = NativeIntegration | PlatformIntegration;

export const nativeIntegrations: NativeIntegration[] = [
	{
		id: "sdk",
		kind: "native",
		name: "Official SDKs",
		description:
			"Send mail from Node, Python, Go, or PHP with a few lines of code.",
		category: "developer",
		status: "available",
		iconName: "code",
		href: "/api-keys",
		accent: "from-violet-500/15 to-fuchsia-500/10",
		cta: "Get an API key",
	},
	{
		id: "smtp",
		kind: "native",
		name: "SMTP relay",
		description:
			"Drop-in host, port, and credentials for any library that speaks SMTP.",
		category: "native",
		status: "available",
		iconName: "smtp",
		href: "/smtp",
		accent: "from-sky-500/15 to-cyan-500/10",
		cta: "Open SMTP setup",
	},
	{
		id: "webhooks",
		kind: "native",
		name: "Webhooks",
		description:
			"Stream delivery events into your backend as mail moves through Reloop.",
		category: "developer",
		status: "available",
		iconName: "webhook",
		href: "/webhooks",
		accent: "from-amber-500/15 to-orange-500/10",
		cta: "Configure webhooks",
	},
	{
		id: "domains",
		kind: "native",
		name: "Sending domains",
		description:
			"Verify DNS so you can send from your brand addresses with confidence.",
		category: "native",
		status: "available",
		iconName: "globe",
		href: "/domain",
		accent: "from-emerald-500/15 to-teal-500/10",
		cta: "Manage domains",
	},
];

export const platformIntegrations: PlatformIntegration[] = [
	{
		id: "zapier",
		kind: "platform",
		name: "Zapier",
		description:
			"Trigger sends and react to events across thousands of no-code apps.",
		category: "automation",
		status: "coming_soon",
		simpleIconKey: "siZapier",
	},
	{
		id: "n8n",
		kind: "platform",
		name: "n8n",
		description:
			"Self-hosted workflows for teams that want email in their automation graph.",
		category: "automation",
		status: "coming_soon",
		simpleIconKey: "siN8n",
	},
	{
		id: "make",
		kind: "platform",
		name: "Make",
		description:
			"Visual scenarios that stitch Reloop into multi-step business processes.",
		category: "automation",
		status: "coming_soon",
		simpleIconKey: "siMake",
	},
	{
		id: "shopify",
		kind: "platform",
		name: "Shopify",
		description:
			"Order, shipping, and receipt mail without bolting on another ESP.",
		category: "commerce",
		status: "coming_soon",
		simpleIconKey: "siShopify",
	},
	{
		id: "supabase",
		kind: "platform",
		name: "Supabase",
		description:
			"Auth and database hooks that fan out transactional mail from your stack.",
		category: "developer",
		status: "coming_soon",
		simpleIconKey: "siSupabase",
	},
	{
		id: "vercel",
		kind: "platform",
		name: "Vercel",
		description:
			"Edge and serverless functions that send mail without managing a fleet.",
		category: "developer",
		status: "coming_soon",
		simpleIconKey: "siVercel",
	},
	{
		id: "github",
		kind: "platform",
		name: "GitHub",
		description:
			"CI workflows and app events that trigger transactional mail from your repos.",
		category: "developer",
		status: "coming_soon",
		simpleIconKey: "siGithub",
	},
	{
		id: "linear",
		kind: "platform",
		name: "Linear",
		description:
			"File product issues from bounce and complaint signals automatically.",
		category: "developer",
		status: "coming_soon",
		simpleIconKey: "siLinear",
	},
];

export const categoryFilters: {
	id: "all" | IntegrationCategory;
	label: string;
}[] = [
	{ id: "all", label: "All" },
	{ id: "native", label: "Native" },
	{ id: "developer", label: "Developer" },
	{ id: "automation", label: "Automation" },
	{ id: "commerce", label: "Commerce" },
];
