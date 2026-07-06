export type PlanId = "free" | "essentials" | "growth" | "enterprise";

export interface PricingPlan {
	id: PlanId;
	name: string;
	description: string;
	monthlyPrice: number | null;
	emailsLabel: string;
	ctaLabel: string;
	ctaHref: string;
	ctaExternal?: boolean;
	highlighted?: boolean;
	features: string[];
	comparison: {
		monthlyEmails: string;
		overage: string;
		ratePerSecond: string;
		attachmentSize: string;
		campaigns: boolean;
		smtpRelay: boolean;
		webhooks: boolean;
		analytics: boolean;
		agentInbox: boolean;
		customDomains: string;
		support: string;
		emailValidation: string;
		dedicatedIp: string;
		sso: boolean;
		sla: string;
	};
}

export const pricingPlans: PricingPlan[] = [
	{
		id: "free",
		name: "Free",
		description: "For side projects and getting started with Reloop.",
		monthlyPrice: 0,
		emailsLabel: "3,000 emails / month",
		ctaLabel: "Get started",
		ctaHref: "/dashboard/signup",
		features: [
			"3,000 emails per month",
			"Transactional & campaign email",
			"SMTP relay & webhooks",
			"Email analytics dashboard",
			"Community support",
		],
		comparison: {
			monthlyEmails: "3,000",
			overage: "—",
			ratePerSecond: "10 / sec",
			attachmentSize: "5 MB",
			campaigns: true,
			smtpRelay: true,
			webhooks: true,
			analytics: true,
			agentInbox: true,
			customDomains: "1",
			support: "Community",
			emailValidation: "100 / mo",
			dedicatedIp: "—",
			sso: false,
			sla: "—",
		},
	},
	{
		id: "essentials",
		name: "Essentials",
		description: "For startup founders & growing companies.",
		monthlyPrice: 10,
		emailsLabel: "25,000 emails / month",
		ctaLabel: "Start Essentials trial",
		ctaHref: "/dashboard/signup",
		highlighted: true,
		features: [
			"25,000 emails per month",
			"Overage at $0.80 / 1,000 emails",
			"50 emails / second throughput",
			"25 MB attachments",
			"Email support",
		],
		comparison: {
			monthlyEmails: "25,000",
			overage: "$0.80 / 1k",
			ratePerSecond: "50 / sec",
			attachmentSize: "25 MB",
			campaigns: true,
			smtpRelay: true,
			webhooks: true,
			analytics: true,
			agentInbox: true,
			customDomains: "5",
			support: "Email",
			emailValidation: "1,000 / mo",
			dedicatedIp: "—",
			sso: false,
			sla: "—",
		},
	},
	{
		id: "growth",
		name: "Growth",
		description: "For teams scaling email volume without enterprise overhead.",
		monthlyPrice: 20,
		emailsLabel: "50,000 emails / month",
		ctaLabel: "Start Growth trial",
		ctaHref: "/dashboard/signup",
		features: [
			"50,000 emails per month",
			"Overage at $0.80 / 1,000 emails",
			"100 emails / second throughput",
			"25 MB attachments",
			"Email support",
		],
		comparison: {
			monthlyEmails: "50,000",
			overage: "$0.80 / 1k",
			ratePerSecond: "100 / sec",
			attachmentSize: "25 MB",
			campaigns: true,
			smtpRelay: true,
			webhooks: true,
			analytics: true,
			agentInbox: true,
			customDomains: "10",
			support: "Email",
			emailValidation: "5,000 / mo",
			dedicatedIp: "—",
			sso: false,
			sla: "—",
		},
	},
	{
		id: "enterprise",
		name: "Enterprise",
		description: "Custom volume, security reviews, and dedicated support.",
		monthlyPrice: null,
		emailsLabel: "Custom volume",
		ctaLabel: "Contact sales",
		ctaHref: "/company/contact-us",
		features: [
			"Custom email volume & overage",
			"Dedicated throughput limits",
			"SSO & advanced security",
			"Dedicated IP options",
			"Dedicated support & SLA",
		],
		comparison: {
			monthlyEmails: "Custom",
			overage: "Custom",
			ratePerSecond: "Custom",
			attachmentSize: "Custom",
			campaigns: true,
			smtpRelay: true,
			webhooks: true,
			analytics: true,
			agentInbox: true,
			customDomains: "Unlimited",
			support: "Dedicated",
			emailValidation: "Custom",
			dedicatedIp: "Optional / custom",
			sso: true,
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
		title: "Volume & Pricing",
		rows: [
			{ label: "Monthly emails", key: "monthlyEmails", type: "text" },
			{ label: "Overage", key: "overage", type: "text" },
		],
	},
	{
		title: "Sending Infrastructure",
		rows: [
			{ label: "Throughput", key: "ratePerSecond", type: "text" },
			{ label: "SMTP relay", key: "smtpRelay", type: "boolean" },
			{ label: "Max attachment", key: "attachmentSize", type: "text" },
			{ label: "Campaigns", key: "campaigns", type: "boolean" },
		],
	},
	{
		title: "Inbound & Receiving",
		rows: [
			{ label: "Agent inbox", key: "agentInbox", type: "boolean" },
			{ label: "Webhooks", key: "webhooks", type: "boolean" },
		],
	},
	{
		title: "Deliverability & Compliance",
		rows: [
			{ label: "Custom domains", key: "customDomains", type: "text" },
			{ label: "Email validation", key: "emailValidation", type: "text" },
			{ label: "SAML SSO", key: "sso", type: "boolean" },
			{ label: "Dedicated IP", key: "dedicatedIp", type: "text" },
		],
	},
	{
		title: "Operations & Support",
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
