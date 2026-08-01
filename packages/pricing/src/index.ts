export type PlanId = "free" | "individual" | "startup" | "enterprise";

export interface PricingPlan {
	id: PlanId;
	name: string;
	description: string;
	monthlyPrice: number | null;
	priceSubline: string;
	emailsLabel: string;
	extraEmailsLabel?: string;
	includesLabel?: string;
	ctaLabel: string;
	ctaHref: string;
	ctaExternal?: boolean;
	secondaryCta?: {
		label: string;
		href: string;
		external?: boolean;
	};
	highlighted?: boolean;
	badge?: string;
	features: string[];
	comparison: {
		// Volume
		monthlyEmails: string;
		dailyLimit: string;
		overage: string;
		// Resources
		agentInbox: string;
		webhooks: string;
		customDomains: string;
		attachmentSize: string;
		dataRetention: string;
		// Email API
		restApi: boolean;
		smtpRelay: boolean;
		scheduledEmails: boolean;
		emailTemplates: boolean;
		officialSdks: boolean;
		// Inbox & AI
		agentInboxFeature: boolean;
		inboundEmail: boolean;
		aiComposer: boolean;
		humanInbox: boolean;
		// Deliverability
		emailAuth: boolean;
		pristineSharedIps: boolean;
		dedicatedIp: string;
		spamTesting: boolean;
		reputationMonitoring: boolean;
		// Analytics
		deliveryAnalytics: boolean;
		openClickTracking: boolean;
		eventLogs: boolean;
		exportRetention: string;
		// Platform
		hostedReloop: boolean;
		selfHost: boolean;
		integrations: boolean;
		auditLogs: boolean;
		// Support & Services
		support: string;
		// Security & Compliance
		uptimeSla: string;
	};
}

export const pricingPlans: PricingPlan[] = [
	{
		id: "free",
		name: "Free",
		description: "For side projects and getting started with Reloop.",
		monthlyPrice: 0,
		priceSubline: "Free for everyone",
		emailsLabel: "3,000 emails / month",
		ctaLabel: "Get started",
		ctaHref: "/dashboard/signup",
		features: [
			"3,000 emails / month",
			"200 emails / day",
			"1 agent inbox",
			"1 webhook",
			"1 custom domain",
			"1 MB attachments",
			"Data retention (45 days)",
			"Community support",
		],
		comparison: {
			monthlyEmails: "3,000",
			dailyLimit: "200",
			overage: "—",
			agentInbox: "1 inbox",
			webhooks: "1 webhook",
			customDomains: "1 domain",
			attachmentSize: "1 MB",
			dataRetention: "45 days",
			restApi: true,
			smtpRelay: true,
			scheduledEmails: true,
			emailTemplates: true,
			agentInboxFeature: true,
			inboundEmail: true,
			aiComposer: true,
			humanInbox: true,
			emailAuth: true,
			pristineSharedIps: true,
			dedicatedIp: "—",
			spamTesting: true,
			reputationMonitoring: true,
			deliveryAnalytics: true,
			openClickTracking: true,
			eventLogs: true,
			exportRetention: "45 days",
			officialSdks: true,
			hostedReloop: true,
			selfHost: true,
			integrations: true,
			auditLogs: true,
			support: "Community",
			uptimeSla: "—",
		},
	},
	{
		id: "individual",
		name: "Individual",
		description: "For solo developers and personal projects.",
		monthlyPrice: 10,
		priceSubline: "/month",
		emailsLabel: "25,000 emails / month",
		extraEmailsLabel: "Extra emails: $0.80 / 1,000",
		includesLabel: "All Free features +",
		ctaLabel: "Get started",
		ctaHref: "/dashboard/signup",
		features: [
			"25,000 emails / month",
			"No daily limit",
			"5 agent inboxes",
			"5 webhooks",
			"5 custom domains",
			"5 MB attachments",
			"Data retention (45 days)",
			"Dedicated support",
		],
		comparison: {
			monthlyEmails: "25,000",
			dailyLimit: "No limit",
			overage: "$0.80 / 1k",
			agentInbox: "5 inboxes",
			webhooks: "5 webhooks",
			customDomains: "5 domains",
			attachmentSize: "5 MB",
			dataRetention: "45 days",
			restApi: true,
			smtpRelay: true,
			scheduledEmails: true,
			emailTemplates: true,
			agentInboxFeature: true,
			inboundEmail: true,
			aiComposer: true,
			humanInbox: true,
			emailAuth: true,
			pristineSharedIps: true,
			dedicatedIp: "—",
			spamTesting: true,
			reputationMonitoring: true,
			deliveryAnalytics: true,
			openClickTracking: true,
			eventLogs: true,
			exportRetention: "45 days",
			officialSdks: true,
			hostedReloop: true,
			selfHost: true,
			integrations: true,
			auditLogs: true,
			support: "Dedicated",
			uptimeSla: "—",
		},
	},
	{
		id: "startup",
		name: "Startup",
		description: "For early-stage founders and growing teams.",
		monthlyPrice: 20,
		priceSubline: "/month",
		emailsLabel: "50,000 emails / month",
		extraEmailsLabel: "Extra emails: $0.80 / 1,000",
		includesLabel: "All Individual features +",
		ctaLabel: "Get started",
		ctaHref: "/dashboard/signup",
		badge: "Popular",
		highlighted: true,
		features: [
			"50,000 emails / month",
			"No daily limit",
			"10 agent inboxes",
			"10 webhooks",
			"10 custom domains",
			"5 MB attachments",
			"Data retention (45 days)",
			"Dedicated support",
		],
		comparison: {
			monthlyEmails: "50,000",
			dailyLimit: "No limit",
			overage: "$0.80 / 1k",
			agentInbox: "10 inboxes",
			webhooks: "10 webhooks",
			customDomains: "10 domains",
			attachmentSize: "5 MB",
			dataRetention: "45 days",
			restApi: true,
			smtpRelay: true,
			scheduledEmails: true,
			emailTemplates: true,
			agentInboxFeature: true,
			inboundEmail: true,
			aiComposer: true,
			humanInbox: true,
			emailAuth: true,
			pristineSharedIps: true,
			dedicatedIp: "—",
			spamTesting: true,
			reputationMonitoring: true,
			deliveryAnalytics: true,
			openClickTracking: true,
			eventLogs: true,
			exportRetention: "45 days",
			officialSdks: true,
			hostedReloop: true,
			selfHost: true,
			integrations: true,
			auditLogs: true,
			support: "Dedicated",
			uptimeSla: "—",
		},
	},
	{
		id: "enterprise",
		name: "Enterprise",
		description: "Custom volume, security reviews, and dedicated support.",
		monthlyPrice: null,
		priceSubline: "Custom volume & billing",
		emailsLabel: "Custom volume",
		includesLabel: "All Startup features +",
		ctaLabel: "Contact sales",
		ctaHref: "/contact",
		features: [
			"Custom email volume",
			"No daily limit",
			"Custom agent inboxes",
			"Custom webhooks",
			"Custom domains",
			"Custom attachments",
			"Data retention (45 days)",
			"Dedicated support & SLA",
		],
		comparison: {
			monthlyEmails: "Custom",
			dailyLimit: "No limit",
			overage: "Custom",
			agentInbox: "Custom",
			webhooks: "Custom",
			customDomains: "Custom",
			attachmentSize: "Custom",
			dataRetention: "Custom",
			restApi: true,
			smtpRelay: true,
			scheduledEmails: true,
			emailTemplates: true,
			agentInboxFeature: true,
			inboundEmail: true,
			aiComposer: true,
			humanInbox: true,
			emailAuth: true,
			pristineSharedIps: true,
			dedicatedIp: "Optional / custom",
			spamTesting: true,
			reputationMonitoring: true,
			deliveryAnalytics: true,
			openClickTracking: true,
			eventLogs: true,
			exportRetention: "Custom",
			officialSdks: true,
			hostedReloop: true,
			selfHost: true,
			integrations: true,
			auditLogs: true,
			support: "Dedicated",
			uptimeSla: "99.99% SLA",
		},
	},
];

export interface ComparisonSection {
	title: string;
	rows: Array<{
		label: string;
		key: keyof PricingPlan["comparison"];
		type: "text" | "boolean";
	}>;
}

export const comparisonSections: ComparisonSection[] = [
	{
		title: "Volume",
		rows: [
			{ label: "Monthly emails", key: "monthlyEmails", type: "text" },
			{ label: "Daily limit", key: "dailyLimit", type: "text" },
			{ label: "Overage", key: "overage", type: "text" },
		],
	},
	{
		title: "Resources",
		rows: [
			{ label: "Agent inboxes", key: "agentInbox", type: "text" },
			{ label: "Webhooks", key: "webhooks", type: "text" },
			{ label: "Custom domains", key: "customDomains", type: "text" },
			{ label: "Max attachment size", key: "attachmentSize", type: "text" },
			{ label: "Data retention", key: "dataRetention", type: "text" },
		],
	},
	{
		title: "Email API",
		rows: [
			{ label: "REST API", key: "restApi", type: "boolean" },
			{ label: "SMTP relay", key: "smtpRelay", type: "boolean" },
			{ label: "Scheduled emails", key: "scheduledEmails", type: "boolean" },
			{ label: "Email templates", key: "emailTemplates", type: "boolean" },
			{ label: "Official SDKs", key: "officialSdks", type: "boolean" },
		],
	},
	{
		title: "Inbox & AI",
		rows: [
			{ label: "Agent inbox", key: "agentInboxFeature", type: "boolean" },
			{ label: "Inbound email", key: "inboundEmail", type: "boolean" },
			{ label: "AI composer", key: "aiComposer", type: "boolean" },
			{ label: "Human inbox", key: "humanInbox", type: "boolean" },
		],
	},
	{
		title: "Deliverability",
		rows: [
			{ label: "SPF / DKIM / DMARC", key: "emailAuth", type: "boolean" },
			{
				label: "Pristine shared IPs",
				key: "pristineSharedIps",
				type: "boolean",
			},
			{ label: "Dedicated IP", key: "dedicatedIp", type: "text" },
			{ label: "Spam testing", key: "spamTesting", type: "boolean" },
			{
				label: "Reputation monitoring",
				key: "reputationMonitoring",
				type: "boolean",
			},
		],
	},
	{
		title: "Analytics",
		rows: [
			{
				label: "Delivery analytics",
				key: "deliveryAnalytics",
				type: "boolean",
			},
			{
				label: "Open & click tracking",
				key: "openClickTracking",
				type: "boolean",
			},
			{ label: "Event logs", key: "eventLogs", type: "boolean" },
			{ label: "Export / retention", key: "exportRetention", type: "text" },
		],
	},
	{
		title: "Platform",
		rows: [
			{ label: "Hosted Reloop", key: "hostedReloop", type: "boolean" },
			{ label: "Self-host", key: "selfHost", type: "boolean" },
			{ label: "Integrations", key: "integrations", type: "boolean" },
			{ label: "Audit logs", key: "auditLogs", type: "boolean" },
		],
	},
	{
		title: "Support & Services",
		rows: [{ label: "Support level", key: "support", type: "text" }],
	},
	{
		title: "Security & Compliance",
		rows: [{ label: "Uptime SLA Guarantee", key: "uptimeSla", type: "text" }],
	},
];

export function formatPrice(amount: number) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount);
}

export function getPlanPrice(plan: PricingPlan) {
	return plan.monthlyPrice;
}

export const defaultPlan = pricingPlans[0] as PricingPlan;

export function getPlanById(id: PlanId) {
	return pricingPlans.find((p) => p.id === id);
}

export function getNextPlan(id: PlanId) {
	const i = pricingPlans.findIndex((p) => p.id === id);
	return i >= 0 && i < pricingPlans.length - 1 ? pricingPlans[i + 1] : null;
}
