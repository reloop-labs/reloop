export type PlanId = "free" | "essentials" | "enterprise";

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
		},
	},
	{
		id: "essentials",
		name: "Essentials",
		description: "For startup founders & growing companies.",
		monthlyPrice: 9,
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
		},
	},
];

export const comparisonRows: Array<{
	label: string;
	key: keyof PricingPlan["comparison"];
	type: "text" | "boolean";
}> = [
	{ label: "Monthly emails", key: "monthlyEmails", type: "text" },
	{ label: "Overage", key: "overage", type: "text" },
	{ label: "Throughput", key: "ratePerSecond", type: "text" },
	{ label: "Max attachment", key: "attachmentSize", type: "text" },
	{ label: "Campaigns", key: "campaigns", type: "boolean" },
	{ label: "SMTP relay", key: "smtpRelay", type: "boolean" },
	{ label: "Webhooks", key: "webhooks", type: "boolean" },
	{ label: "Analytics", key: "analytics", type: "boolean" },
	{ label: "Agent inbox", key: "agentInbox", type: "boolean" },
	{ label: "Custom domains", key: "customDomains", type: "text" },
	{ label: "Support", key: "support", type: "text" },
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
