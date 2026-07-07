import type { LandingPageDefinition } from "../types";

export const config: LandingPageDefinition = {
	slug: "django",
	path: "/integrations/django",
	titleLines: ["Send Email", "with Django"],
	description:
		"Configure Django to send email via Reloop SMTP or the Python SDK.",
	keywords: [
		"Django email API",
		"Django transactional email",
		"send email Django",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Python SDK",
		href: "/languages/python",
	},
	sections: [
		{
			title: "Django email backend",
			items: [
				{
					title: "SMTP backend",
					description:
						"Set EMAIL_HOST to Reloop SMTP for standard Django mail sends.",
				},
				{
					title: "Python SDK",
					description:
						"Use the SDK in Celery tasks for advanced templates and tracking.",
				},
				{
					title: "Admin notifications",
					description:
						"Reliable delivery for password resets and admin alerts.",
				},
			],
		},
	],
	cta: {
		title: "Django + Reloop",
		titleMuted: "Start free today.",
		description: "pip install reloop-email and configure settings.py.",
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
