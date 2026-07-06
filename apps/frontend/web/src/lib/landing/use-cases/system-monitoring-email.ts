import type { LandingPageDefinition } from "../types";

export const config: LandingPageDefinition = {
	slug: "system-monitoring-email",
	path: "/use-cases/system-monitoring-email",
	titleLines: [
		"System &",
		"Monitoring Email",
	],
	description: "Zero-latency alerts for errors, downtime, reports, and admin approvals.",
	keywords: [
		"alert email service",
		"ops notification email",
		"monitoring email API",
		"incident alert email",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "SMTP relay",
		href: "/features/smtp",
	},
	sections: [
		{
			title: "Reliable ops email",
			items: [
				{
					title: "Error alerts",
					description: "Route Sentry, Datadog, or custom alerts through a reliable SMTP relay.",
				},
				{
					title: "Downtime notifications",
					description: "Ensure status page and incident emails reach on-call engineers.",
				},
				{
					title: "Scheduled reports",
					description: "Send daily digests and admin reports on a predictable schedule.",
				},
			],
		},
	],
	cta: {
		title: "Alert with confidence",
		titleMuted: "Start free today.",
		description: "High deliverability for emails that must not be missed.",
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
