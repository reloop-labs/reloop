/**
 * Integrations catalog for dashboard-v1 — platform discovery / roadmap.
 */

export type IntegrationCategory = "automation" | "commerce" | "developer";

export type IntegrationStatus = "available" | "coming_soon";

export type PlatformIntegration = {
	id: string;
	name: string;
	description: string;
	category: IntegrationCategory;
	status: IntegrationStatus;
	/** simple-icons export key, e.g. siZapier */
	simpleIconKey: string;
};

export const platformIntegrations: PlatformIntegration[] = [
	{
		id: "zapier",
		name: "Zapier",
		description:
			"Trigger sends and react to events across thousands of no-code apps.",
		category: "automation",
		status: "coming_soon",
		simpleIconKey: "siZapier",
	},
	{
		id: "n8n",
		name: "n8n",
		description:
			"Self-hosted workflows for teams that want email in their automation graph.",
		category: "automation",
		status: "coming_soon",
		simpleIconKey: "siN8n",
	},
	{
		id: "make",
		name: "Make",
		description:
			"Visual scenarios that stitch Reloop into multi-step business processes.",
		category: "automation",
		status: "coming_soon",
		simpleIconKey: "siMake",
	},
	{
		id: "shopify",
		name: "Shopify",
		description:
			"Order, shipping, and receipt mail without bolting on another ESP.",
		category: "commerce",
		status: "coming_soon",
		simpleIconKey: "siShopify",
	},
	{
		id: "supabase",
		name: "Supabase",
		description:
			"Auth and database hooks that fan out transactional mail from your stack.",
		category: "developer",
		status: "coming_soon",
		simpleIconKey: "siSupabase",
	},
	{
		id: "vercel",
		name: "Vercel",
		description:
			"Edge and serverless functions that send mail without managing a fleet.",
		category: "developer",
		status: "coming_soon",
		simpleIconKey: "siVercel",
	},
	{
		id: "github",
		name: "GitHub",
		description:
			"CI workflows and app events that trigger transactional mail from your repos.",
		category: "developer",
		status: "coming_soon",
		simpleIconKey: "siGithub",
	},
	{
		id: "linear",
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
	{ id: "developer", label: "Developer" },
	{ id: "automation", label: "Automation" },
	{ id: "commerce", label: "Commerce" },
];
