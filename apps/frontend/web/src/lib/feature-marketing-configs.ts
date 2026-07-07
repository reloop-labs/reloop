import type { FeatureMarketingPageConfig } from "@reloop/web/components/feature-marketing-page";

const signup = { label: "Get started", href: "/dashboard/signup" };
const docs = { label: "Read documentation", href: "/docs" };

export const campaignsConfig: FeatureMarketingPageConfig = {
	titleLines: ["Email Campaigns"],
	description:
		"Create, send, and track powerful email campaigns that drive engagement and conversions—from newsletters to product announcements.",
	primaryCta: { label: "Start creating campaigns", href: "/dashboard/signup" },
	secondaryCta: { label: "View docs", href: "/docs" },
	sections: [
		{
			title: "Everything you need for successful campaigns",
			description:
				"From design to delivery to analytics, we provide the tools to create campaigns that perform.",
			items: [
				{
					title: "Drag & Drop Editor",
					description:
						"Create beautiful emails with an intuitive visual editor. No coding required—drag, drop, and match your brand.",
				},
				{
					title: "Smart Segmentation",
					description:
						"Target the right audience with powerful segmentation. Build dynamic lists from behavior, preferences, and demographics.",
				},
				{
					title: "Real-time Analytics",
					description:
						"Track opens, clicks, conversions, and more. Make data-driven decisions to improve performance.",
				},
			],
		},
	],
	cta: {
		title: "Ready to launch your first campaign?",
		titleMuted: "Start free today.",
		description:
			"Join thousands of marketers who trust Reloop. Start with our free tier and scale as you grow.",
		primary: signup,
		secondary: docs,
	},
};

export const deliverabilityConfig: FeatureMarketingPageConfig = {
	titleLines: ["Email Deliverability"],
	description:
		"Ensure your emails reach the inbox, not the spam folder. Maintain excellent sender reputation and maximize performance.",
	primaryCta: { label: "Improve deliverability", href: "/dashboard/signup" },
	secondaryCta: docs,
	sections: [
		{
			title: "Built-in deliverability tools",
			description:
				"Every feature is designed to help your emails reach the inbox and maintain a strong sender reputation.",
			items: [
				{
					title: "Spam Testing",
					description:
						"Test emails against major spam filters before sending. Get detailed reports and suggestions to improve deliverability.",
				},
				{
					title: "Reputation Monitoring",
					description:
						"Track sender reputation across major providers. Get alerts when reputation drops and guidance to improve it.",
				},
				{
					title: "Authentication Setup",
					description:
						"Automatic SPF, DKIM, and DMARC setup with guided configuration. Prove legitimacy and improve inbox placement.",
				},
			],
		},
		{
			title: "Industry-leading deliverability",
			description:
				"Our customers consistently achieve better deliverability rates compared to industry averages.",
			alt: true,
			items: [
				{
					title: "99.5% delivery rate",
					description: "Average across all customers",
				},
				{
					title: "95%+ inbox placement",
					description: "Reach the primary inbox",
				},
				{
					title: "<0.1% spam rate",
					description: "Industry-low spam complaints",
				},
			],
		},
	],
	cta: {
		title: "Ready to improve your deliverability?",
		titleMuted: "We can help.",
		description:
			"Get expert guidance, monitoring, and tools to keep your emails landing in the inbox.",
		primary: signup,
		secondary: docs,
	},
};

export const developersConfig: FeatureMarketingPageConfig = {
	titleLines: ["Developer-First", "Email Infrastructure"],
	description:
		"Send transactionals and marketing broadcasts with clean APIs, robust SDKs, and fully-managed SMTP relay—built for reliability, speed, and DX.",
	primaryCta: { label: "Get API key", href: "/dashboard/signup" },
	secondaryCta: docs,
	sections: [
		{
			title: "Supercharged developer experience",
			description:
				"Integrate in minutes using modern tooling and event pipelines.",
			items: [
				{
					title: "Type-Safe Client SDKs",
					description:
						"Official libraries for TypeScript, Go, Python, Rust, and PHP with autocompletion, inline docs, and validation.",
				},
				{
					title: "Real-Time MTA Logs",
					description:
						"Trace SMTP handshakes, deliveries, bounces, and latencies down to the millisecond with live logging.",
				},
				{
					title: "Local Dev Sandbox",
					description:
						"Test locally with our SMTP server and sandbox APIs—never send test emails to real users by accident.",
				},
			],
		},
	],
	cta: {
		title: "Start building with Reloop",
		titleMuted: "Free tier included.",
		description:
			"Ship transactional and marketing email with APIs and SDKs designed for production workloads.",
		primary: signup,
		secondary: { label: "Explore SDKs", href: "/docs/resources/sdks" },
	},
};

export const emailAnalyticsConfig: FeatureMarketingPageConfig = {
	titleLines: ["Email Analytics"],
	description:
		"Understand how your emails perform with detailed analytics, real-time reporting, and actionable insights.",
	primaryCta: signup,
	secondaryCta: docs,
	sections: [
		{
			title: "Track what matters",
			description:
				"Monitor engagement and conversion metrics across campaigns and transactional sends.",
			items: [
				{
					title: "Open Rates",
					description:
						"Measure engagement with accurate open tracking and geographic breakdowns.",
				},
				{
					title: "Click Tracking",
					description:
						"See which links drive action with per-link analytics and heatmaps.",
				},
				{
					title: "Conversion Tracking",
					description:
						"Connect email events to revenue with UTM parameters and custom goals.",
				},
			],
		},
		{
			title: "Reports that drive decisions",
			description: "Visualize trends and compare performance over time.",
			alt: true,
			items: [
				{
					title: "Real-time Reports",
					description: "Live dashboards updated as events stream in.",
				},
				{
					title: "Trend Analysis",
					description: "Compare campaigns week over week to spot what works.",
				},
				{
					title: "Export & API",
					description: "Pull metrics into your data warehouse via API or CSV.",
				},
			],
		},
	],
	cta: {
		title: "Unlock email analytics",
		titleMuted: "Start for free.",
		description:
			"Get visibility into every send with analytics built into the Reloop platform.",
		primary: signup,
		secondary: docs,
	},
};

export const emailValidationConfig: FeatureMarketingPageConfig = {
	titleLines: ["Email Validation"],
	description:
		"Verify addresses before you send. Reduce bounces, protect reputation, and keep your lists clean.",
	primaryCta: { label: "Validate emails", href: "/dashboard/signup" },
	secondaryCta: docs,
	sections: [
		{
			title: "Multi-layer validation",
			description:
				"Catch invalid addresses at signup, import, and send time with fast, accurate checks.",
			items: [
				{
					title: "Syntax Validation",
					description:
						"RFC-compliant format checks catch typos and malformed addresses.",
				},
				{
					title: "Domain Validation",
					description:
						"Verify MX records and domain existence before you send.",
				},
				{
					title: "Deliverability Check",
					description:
						"Risk scoring for disposable, role-based, and catch-all addresses.",
				},
			],
		},
	],
	cta: {
		title: "Clean lists, better delivery",
		titleMuted: "Try validation free.",
		description:
			"Validate in bulk via API or dashboard and keep bounce rates low from day one.",
		primary: signup,
		secondary: docs,
	},
};

export const webhooksConfig: FeatureMarketingPageConfig = {
	titleLines: ["Webhooks"],
	description:
		"Receive real-time notifications about email events, delivery status, and user interactions.",
	primaryCta: { label: "Set up webhooks", href: "/dashboard/signup" },
	secondaryCta: { label: "View examples", href: "/docs/webhooks" },
	sections: [
		{
			title: "Available webhook events",
			description:
				"Subscribe to specific events for delivery, engagement, and system notifications.",
			items: [
				{
					title: "Email Delivered",
					description:
						"Triggered when an email is successfully delivered to the recipient's inbox.",
				},
				{
					title: "Email Opened",
					description:
						"Triggered when a recipient opens your email—ideal for engagement workflows.",
				},
				{
					title: "Email Bounced",
					description:
						"Triggered on hard or soft bounces so you can update lists and retry logic.",
				},
			],
		},
		{
			title: "Webhook security",
			description: "Verify payloads and protect your endpoints in production.",
			alt: true,
			items: [
				{
					title: "Signed payloads",
					description:
						"HMAC signatures let you verify every request came from Reloop.",
				},
				{
					title: "Retry logic",
					description:
						"Automatic retries with exponential backoff for failed deliveries.",
				},
				{
					title: "Event logs",
					description:
						"Debug delivery issues with a full history in the dashboard.",
				},
			],
		},
	],
	cta: {
		title: "Keep your app in sync",
		titleMuted: "Configure webhooks today.",
		description:
			"Wire email events into your product with reliable, signed webhook deliveries.",
		primary: signup,
		secondary: docs,
	},
};
