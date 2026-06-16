export type BillingCycle = "monthly" | "annual";

export type PlanId = "free" | "pro" | "scale" | "enterprise";

export interface PricingPlan {
	id: PlanId;
	name: string;
	description: string;
	monthlyPrice: number | null;
	annualMonthlyPrice: number | null;
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

export const ANNUAL_DISCOUNT_LABEL = "Save 20%";

export const pricingPlans: PricingPlan[] = [
	{
		id: "free",
		name: "Free",
		description: "For side projects and getting started with Reloop.",
		monthlyPrice: 0,
		annualMonthlyPrice: 0,
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
		id: "pro",
		name: "Pro",
		description: "For production apps shipping email at scale.",
		monthlyPrice: 19,
		annualMonthlyPrice: 15,
		emailsLabel: "50,000 emails / month",
		ctaLabel: "Start Pro trial",
		ctaHref: "/dashboard/signup",
		highlighted: true,
		features: [
			"50,000 emails per month",
			"Overage at $0.80 / 1,000 emails",
			"50 emails / second throughput",
			"25 MB attachments",
			"Email support",
		],
		comparison: {
			monthlyEmails: "50,000",
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
		id: "scale",
		name: "Scale",
		description: "For teams with high-volume sending and advanced needs.",
		monthlyPrice: 79,
		annualMonthlyPrice: 63,
		emailsLabel: "250,000 emails / month",
		ctaLabel: "Start Scale trial",
		ctaHref: "/dashboard/signup",
		features: [
			"250,000 emails per month",
			"Overage at $0.60 / 1,000 emails",
			"200 emails / second throughput",
			"50 MB attachments",
			"Priority support & SLA",
		],
		comparison: {
			monthlyEmails: "250,000",
			overage: "$0.60 / 1k",
			ratePerSecond: "200 / sec",
			attachmentSize: "50 MB",
			campaigns: true,
			smtpRelay: true,
			webhooks: true,
			analytics: true,
			agentInbox: true,
			customDomains: "25",
			support: "Priority",
		},
	},
	{
		id: "enterprise",
		name: "Enterprise",
		description: "Custom volume, security reviews, and dedicated support.",
		monthlyPrice: null,
		annualMonthlyPrice: null,
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

export function getPlanPrice(plan: PricingPlan, billingCycle: BillingCycle) {
	if (plan.monthlyPrice === null) return null;
	return billingCycle === "annual"
		? (plan.annualMonthlyPrice ?? plan.monthlyPrice)
		: plan.monthlyPrice;
}
