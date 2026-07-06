import type { LandingPageDefinition } from "../types";

export const config: LandingPageDefinition = {
	slug: "rails",
	path: "/integrations/rails",
	titleLines: ["Send Email", "with Rails"],
	description:
		"Send email from Ruby on Rails with Action Mailer and Reloop SMTP or the Ruby gem.",
	keywords: [
		"Rails transactional email",
		"Rails email API",
		"Action Mailer Reloop",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Ruby SDK",
		href: "/features/languages/ruby",
	},
	sections: [
		{
			title: "Rails integration",
			items: [
				{
					title: "Action Mailer",
					description:
						"Configure SMTP settings in production.rb for standard mailers.",
				},
				{
					title: "Active Job",
					description: "Queue mail delivery with Sidekiq or Solid Queue.",
				},
				{
					title: "Devise & auth",
					description: "Reliable password reset and confirmation emails.",
				},
			],
		},
	],
	cta: {
		title: "Rails email on Reloop",
		titleMuted: "Start free today.",
		description: "gem install reloop-email or use SMTP relay.",
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
