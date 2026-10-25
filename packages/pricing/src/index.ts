import type { PlanId } from "./catalog";

export type {
	CheckoutPlanId,
	PlanId,
	PlanLimits,
	ReloopSubscriptionStatus,
} from "./catalog";
export {
	applyPlanChange,
	checkoutPlanIds,
	closePeriodSnapshot,
	creditPack,
	creditPackPriceCents,
	creditPackSizes,
	getPlanLimits,
	isCheckoutPlanId,
	isPlanId,
	isValidCreditPackSize,
	mapPolarSubscriptionStatus,
	planLimits,
	polarStatusMap,
} from "./catalog";

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
		contacts: string;
		teamMembers: string;
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
		ownSmtp: string;
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
		emailsLabel: "6,000 emails / month",
		ctaLabel: "Get started",
		ctaHref: "/dashboard/signup",
		features: [
			"6,000 emails / month",
			"200 emails / day",
			"Unlimited contacts",
			"Unlimited team members",
			"3 agent inboxes",
			"3 webhooks",
			"3 custom domains",
			"1 own SMTP server",
			"1 MB attachments",
			"Data retention (45 days)",
			"Community support",
		],
		comparison: {
			monthlyEmails: "6,000",
			dailyLimit: "200",
			overage: "-",
			contacts: "Unlimited",
			teamMembers: "Unlimited",
			agentInbox: "3 inboxes",
			webhooks: "3 webhooks",
			customDomains: "3 domains",
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
			dedicatedIp: "-",
			ownSmtp: "1 server",
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
			uptimeSla: "-",
		},
	},
	{
		id: "individual",
		name: "Pro",
		description: "For solo developers and personal projects.",
		monthlyPrice: 10,
		priceSubline: "/month",
		emailsLabel: "50,000 emails / month",
		extraEmailsLabel: "Extra emails: $0.50 / 1,000",
		includesLabel: "All Free features +",
		ctaLabel: "Get started",
		ctaHref: "/dashboard/signup",
		features: [
			"50,000 emails / month",
			"No daily limit",
			"Unlimited contacts",
			"Unlimited team members",
			"5 agent inboxes",
			"5 webhooks",
			"5 custom domains",
			"2 own SMTP servers",
			"5 MB attachments",
			"Data retention (45 days)",
			"Dedicated support",
		],
		comparison: {
			monthlyEmails: "50,000",
			dailyLimit: "No limit",
			overage: "$0.50 / 1k",
			contacts: "Unlimited",
			teamMembers: "Unlimited",
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
			dedicatedIp: "-",
			ownSmtp: "2 servers",
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
			uptimeSla: "-",
		},
	},
	{
		id: "startup",
		name: "Growth",
		description: "For early-stage founders and growing teams.",
		monthlyPrice: 20,
		priceSubline: "/month",
		emailsLabel: "100,000 emails / month",
		extraEmailsLabel: "Extra emails: $0.50 / 1,000",
		includesLabel: "All Pro features +",
		ctaLabel: "Get started",
		ctaHref: "/dashboard/signup",
		badge: "Recommended",
		highlighted: true,
		features: [
			"100,000 emails / month",
			"No daily limit",
			"Unlimited contacts",
			"Unlimited team members",
			"10 agent inboxes",
			"10 webhooks",
			"10 custom domains",
			"3 own SMTP servers",
			"5 MB attachments",
			"Data retention (45 days)",
			"Dedicated support",
			"1 dedicated IP",
		],
		comparison: {
			monthlyEmails: "100,000",
			dailyLimit: "No limit",
			overage: "$0.50 / 1k",
			contacts: "Unlimited",
			teamMembers: "Unlimited",
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
			dedicatedIp: "1 included",
			ownSmtp: "3 servers",
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
			uptimeSla: "-",
		},
	},
	{
		id: "enterprise",
		name: "Enterprise",
		description: "Custom volume, security reviews, and dedicated support.",
		monthlyPrice: null,
		priceSubline: "Custom volume & billing",
		emailsLabel: "Custom volume",
		includesLabel: "All Growth features +",
		ctaLabel: "Contact sales",
		ctaHref: "/contact",
		features: [
			"Custom email volume",
			"No daily limit",
			"Unlimited contacts",
			"Unlimited team members",
			"Custom agent inboxes",
			"Custom webhooks",
			"Custom domains",
			"Custom SMTP servers",
			"Custom attachments",
			"Data retention (45 days)",
			"Dedicated support & SLA",
			"Custom dedicated IPs",
		],
		comparison: {
			monthlyEmails: "Custom",
			dailyLimit: "No limit",
			overage: "Custom",
			contacts: "Unlimited",
			teamMembers: "Unlimited",
			agentInbox: "Custom",
			webhooks: "Custom",
			customDomains: "Custom",
			attachmentSize: "Custom",
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
			dedicatedIp: "Optional / custom",
			ownSmtp: "Custom",
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

export const communityEdition = {
	name: "Community",
	description:
		"Self-host Reloop on your own infrastructure. Every feature, no plan limits, no license fee.",
	priceSubline: "Free forever, self-hosted",
	ctaLabel: "Download",
	ctaHref: "/docs/self-host",
	features: [
		"Unlimited emails / month",
		"No daily limit",
		"Unlimited agent inboxes",
		"Unlimited webhooks",
		"Unlimited custom domains",
		"10 MB attachments",
		"Community support",
	],
};

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
			{ label: "Contacts", key: "contacts", type: "text" },
			{ label: "Team members", key: "teamMembers", type: "text" },
			{ label: "Agent inboxes", key: "agentInbox", type: "text" },
			{ label: "Webhooks", key: "webhooks", type: "text" },
			{ label: "Custom domains", key: "customDomains", type: "text" },
			{ label: "Bring your own SMTP", key: "ownSmtp", type: "text" },
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

export const paidOverageUsdPerThousand = 0.5;

/**
 * Cheapest published Reloop Cloud USD for a monthly send volume.
 * Free has no overage (sending pauses). Paid plans use included volume + $0.50/1k.
 */
export function hostedMonthlyUsdForVolume(volume: number): number {
	if (volume <= 0) return 0;
	const free = pricingPlans.find((p) => p.id === "free");
	const freeIncluded = Number(
		(free?.comparison.monthlyEmails ?? "6000").replace(/,/g, ""),
	);
	if (volume <= freeIncluded) return 0;

	let best = Number.POSITIVE_INFINITY;
	for (const plan of pricingPlans) {
		if (plan.monthlyPrice === null || plan.monthlyPrice === 0) continue;
		const included = Number(plan.comparison.monthlyEmails.replace(/,/g, ""));
		if (!Number.isFinite(included)) continue;
		const extraThousands = Math.max(0, volume - included) / 1000;
		const cost = plan.monthlyPrice + extraThousands * paidOverageUsdPerThousand;
		if (cost < best) best = cost;
	}
	return Number.isFinite(best) ? Math.round(best) : 0;
}

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

/** Display name for any plan, including Pay as you go (not a pricing tier). */
export function planDisplayName(id: PlanId): string {
	if (id === "payg") return "Pay as you go";
	return getPlanById(id)?.name ?? "Free";
}

export function getNextPlan(id: PlanId) {
	const i = pricingPlans.findIndex((p) => p.id === id);
	return i >= 0 && i < pricingPlans.length - 1 ? pricingPlans[i + 1] : null;
}

/**
 * How close (in USD) Pro's overage-inflated total may get to
 * Growth's base price before Growth becomes the recommendation.
 * E.g. Pro at $18+ overage loses to Growth at $20 base.
 */
const UPSELL_THRESHOLD_USD = 2;

export function recommendPlanIdForVolume(volume: number): PlanId {
	if (volume > 250000) return "enterprise";
	if (volume <= 6000) return "free";
	const pro = getPlanById("individual");
	const growth = getPlanById("startup");
	const proBase = pro?.monthlyPrice ?? 10;
	const growthBase = growth?.monthlyPrice ?? 20;
	const proIncluded =
		Number(pro?.comparison.monthlyEmails.replace(/,/g, "")) || 50000;
	const proTotal =
		proBase +
		(Math.max(0, volume - proIncluded) / 1000) * paidOverageUsdPerThousand;
	// Once overage pushes Pro within threshold of Growth's base,
	// the next tier is the better deal, so recommend it instead of
	// inflating Pro up to (or past) Growth's price.
	if (proTotal >= growthBase - UPSELL_THRESHOLD_USD) return "startup";
	return "individual";
}
