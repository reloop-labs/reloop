import type { LandingPageDefinition } from "../types";

export const config: LandingPageDefinition = {
	slug: "password-reset-email",
	path: "/use-cases/password-reset-email",
	titleLines: ["Password Reset", "Email API"],
	description:
		"Send secure, fast password reset emails with expiring links and delivery tracking.",
	keywords: [
		"password reset email API",
		"forgot password email",
		"reset password email service",
		"password recovery email",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Transactional email",
		href: "/use-cases/transactional-email",
	},
	sections: [
		{
			title: "Reset flows that work",
			items: [
				{
					title: "Instant delivery",
					description:
						"Users expect reset links in seconds—Reloop delivers with low latency.",
				},
				{
					title: "Template variables",
					description:
						"Inject reset URLs, expiry times, and user names dynamically.",
				},
				{
					title: "Bounce handling",
					description:
						"Webhooks notify your app when reset emails fail to deliver.",
				},
			],
		},
	],
	cta: {
		title: "Ship password resets today",
		titleMuted: "Start free today.",
		description: "Copy-paste SDK examples for Node, Python, Go, and more.",
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
