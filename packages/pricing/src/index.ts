export type PlanId = "free" | "individual" | "startup" | "enterprise";

export interface PricingPlan {
	id: PlanId;
	name: string;
	description: string;
	monthlyPrice: number | null;
	priceSubline: string;
	emailsLabel: string;
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
		monthlyEmails: string;
		overage: string;
		ratePerSecond: string;
		attachmentSize: string;
		campaigns: boolean;
		smtpRelay: boolean;
		webhooks: string;
		analytics: boolean;
		agentInbox: string;
		customDomains: string;
		support: string;
		emailValidation: string;
		dedicatedIp: string;
		sla: string;
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
			"1 agent inbox",
			"1 webhook",
			"1 custom domain",
			"1 MB attachments",
			"Dedicated support",
		],
		comparison: {
			monthlyEmails: "3,000",
			overage: "—",
			ratePerSecond: "10 / sec",
			attachmentSize: "1 MB",
			campaigns: true,
			smtpRelay: true,
			webhooks: "1 webhook",
			analytics: true,
			agentInbox: "1 inbox",
			customDomains: "1 domain",
			support: "Dedicated",
			emailValidation: "100 / mo",
			dedicatedIp: "—",
			sla: "—",
		},
	},
	{
		id: "individual",
		name: "Individual",
		description: "For solo developers and personal projects.",
		monthlyPrice: 10,
		priceSubline: "/month",
		emailsLabel: "25,000 emails / month",
		includesLabel: "All Free features +",
		ctaLabel: "Get started",
		ctaHref: "/dashboard/signup",
		features: [
			"25,000 emails / month",
			"10 agent inboxes",
			"10 webhooks",
			"10 custom domains",
			"Overage at $0.80 / 1,000 emails",
			"50 emails / second throughput",
			"5 MB attachments",
			"Dedicated support",
		],
		comparison: {
			monthlyEmails: "25,000",
			overage: "$0.80 / 1k",
			ratePerSecond: "50 / sec",
			attachmentSize: "5 MB",
			campaigns: true,
			smtpRelay: true,
			webhooks: "10 webhooks",
			analytics: true,
			agentInbox: "10 inboxes",
			customDomains: "10 domains",
			support: "Dedicated",
			emailValidation: "1,000 / mo",
			dedicatedIp: "—",
			sla: "—",
		},
	},
	{
		id: "startup",
		name: "Startup",
		description: "For early-stage founders and growing teams.",
		monthlyPrice: 20,
		priceSubline: "/month",
		emailsLabel: "50,000 emails / month",
		includesLabel: "All Individual features +",
		ctaLabel: "Get started",
		ctaHref: "/dashboard/signup",
		badge: "Popular",
		highlighted: true,
		features: [
			"50,000 emails / month",
			"20 agent inboxes",
			"20 webhooks",
			"20 custom domains",
			"100 emails / second throughput",
			"5 MB attachments",
			"Dedicated support",
		],
		comparison: {
			monthlyEmails: "50,000",
			overage: "$0.80 / 1k",
			ratePerSecond: "100 / sec",
			attachmentSize: "5 MB",
			campaigns: true,
			smtpRelay: true,
			webhooks: "20 webhooks",
			analytics: true,
			agentInbox: "20 inboxes",
			customDomains: "20 domains",
			support: "Dedicated",
			emailValidation: "5,000 / mo",
			dedicatedIp: "—",
			sla: "—",
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
			"Custom email volume & overage",
			"Custom agent inboxes & webhooks",
			"Custom domains",
			"Dedicated throughput limits",
			"Dedicated IP options",
			"Advanced security reviews",
			"Dedicated support & SLA",
		],
		comparison: {
			monthlyEmails: "Custom",
			overage: "Custom",
			ratePerSecond: "Custom",
			attachmentSize: "Custom",
			campaigns: true,
			smtpRelay: true,
			webhooks: "Custom",
			analytics: true,
			agentInbox: "Custom",
			customDomains: "Custom",
			support: "Dedicated",
			emailValidation: "Custom",
			dedicatedIp: "Optional / custom",
			sla: "99.99% / custom",
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
			{ label: "Overage", key: "overage", type: "text" },
		],
	},
	{
		title: "Sending",
		rows: [
			{ label: "Throughput", key: "ratePerSecond", type: "text" },
			{ label: "SMTP relay", key: "smtpRelay", type: "boolean" },
			{ label: "Max attachment", key: "attachmentSize", type: "text" },
			{ label: "Campaigns", key: "campaigns", type: "boolean" },
		],
	},
	{
		title: "Inbound",
		rows: [
			{ label: "Agent inboxes", key: "agentInbox", type: "text" },
			{ label: "Webhooks", key: "webhooks", type: "text" },
		],
	},
	{
		title: "Deliverability",
		rows: [
			{ label: "Custom domains", key: "customDomains", type: "text" },
			{ label: "Email validation", key: "emailValidation", type: "text" },
			{ label: "Dedicated IP", key: "dedicatedIp", type: "text" },
		],
	},
	{
		title: "Support",
		rows: [
			{ label: "Analytics", key: "analytics", type: "boolean" },
			{ label: "Support", key: "support", type: "text" },
			{ label: "SLA", key: "sla", type: "text" },
		],
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
