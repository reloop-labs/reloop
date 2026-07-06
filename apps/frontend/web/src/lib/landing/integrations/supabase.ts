import type { LandingPageDefinition } from "../types";

export const config: LandingPageDefinition = {
	slug: "supabase",
	path: "/integrations/supabase",
	titleLines: [
		"Send Email",
		"with Supabase",
	],
	description: "Replace Supabase Auth emails or send custom notifications via Reloop from Edge Functions.",
	keywords: [
		"Supabase email",
		"Supabase custom SMTP",
		"Supabase transactional email",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Read documentation",
		href: "/docs",
	},
	sections: [
		{
			title: "Supabase + Reloop",
			items: [
				{
					title: "Custom SMTP",
					description: "Point Supabase Auth SMTP settings to Reloop for branded auth emails.",
				},
				{
					title: "Edge Functions",
					description: "Call Reloop REST API from Supabase Edge Functions for app emails.",
				},
				{
					title: "Webhooks",
					description: "Sync delivery status back to your Supabase database.",
				},
			],
		},
	],
	cta: {
		title: "Better email for Supabase apps",
		titleMuted: "Start free today.",
		description: "Branded templates and deliverability beyond default auth mail.",
		primary: {
			label: "Get started free",
			href: "/dashboard/signup",
		},
		secondary: {
			label: "Read documentation",
			href: "/docs",
		},
	},
};
