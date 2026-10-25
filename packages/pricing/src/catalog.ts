export type PlanId = "free" | "individual" | "startup" | "enterprise" | "payg";

export type PlanLimits = {
	planId: PlanId;
	monthlyEmails: number;
	dailyEmailLimit: number | null;
	overageEnabled: boolean;
	maxAgentInboxes: number;
	maxWebhooks: number;
	maxCustomDomains: number;
	maxAttachmentBytes: number;
	dataRetentionDays: number;
	dedicatedIpCount: number;
	maxSmtpProviders: number;
};

const MB = 1024 * 1024;

export const planLimits: Record<PlanId, PlanLimits> = {
	free: {
		planId: "free",
		monthlyEmails: 6_000,
		dailyEmailLimit: 200,
		overageEnabled: false,
		maxAgentInboxes: 3,
		maxWebhooks: 3,
		maxCustomDomains: 3,
		maxAttachmentBytes: 1 * MB,
		dataRetentionDays: 45,
		dedicatedIpCount: 0,
		maxSmtpProviders: 1,
	},
	individual: {
		planId: "individual",
		monthlyEmails: 50_000,
		dailyEmailLimit: null,
		overageEnabled: true,
		maxAgentInboxes: 5,
		maxWebhooks: 5,
		maxCustomDomains: 5,
		maxAttachmentBytes: 5 * MB,
		dataRetentionDays: 45,
		dedicatedIpCount: 0,
		maxSmtpProviders: 2,
	},
	startup: {
		planId: "startup",
		monthlyEmails: 100_000,
		dailyEmailLimit: null,
		overageEnabled: true,
		maxAgentInboxes: 10,
		maxWebhooks: 10,
		maxCustomDomains: 10,
		maxAttachmentBytes: 5 * MB,
		dataRetentionDays: 45,
		dedicatedIpCount: 1,
		maxSmtpProviders: 3,
	},
	// Pay as you go: Free's monthly allowance plus Pro limits while prepaid
	// credits are valid. Sending past the allowance spends the credits.
	payg: {
		planId: "payg",
		monthlyEmails: 6_000,
		dailyEmailLimit: null,
		overageEnabled: false,
		maxAgentInboxes: 5,
		maxWebhooks: 5,
		maxCustomDomains: 5,
		maxAttachmentBytes: 5 * MB,
		dataRetentionDays: 45,
		dedicatedIpCount: 0,
		maxSmtpProviders: 2,
	},
	enterprise: {
		planId: "enterprise",
		monthlyEmails: 100_000,
		dailyEmailLimit: null,
		overageEnabled: true,
		maxAgentInboxes: 10,
		maxWebhooks: 10,
		maxCustomDomains: 10,
		maxAttachmentBytes: 5 * MB,
		dataRetentionDays: 45,
		dedicatedIpCount: 1,
		maxSmtpProviders: 5,
	},
};

export const checkoutPlanIds = ["individual", "startup"] as const;
export type CheckoutPlanId = (typeof checkoutPlanIds)[number];

export function isCheckoutPlanId(id: string): id is CheckoutPlanId {
	return (checkoutPlanIds as readonly string[]).includes(id);
}

const PLAN_IDS: PlanId[] = [
	"free",
	"individual",
	"startup",
	"enterprise",
	"payg",
];

export function isPlanId(id: string): id is PlanId {
	return (PLAN_IDS as readonly string[]).includes(id);
}

export function getPlanLimits(planId: PlanId): PlanLimits {
	return { ...planLimits[planId] };
}

const LIMIT_KEYS = [
	"monthlyEmails",
	"dailyEmailLimit",
	"overageEnabled",
	"maxAgentInboxes",
	"maxWebhooks",
	"maxCustomDomains",
	"maxAttachmentBytes",
	"dataRetentionDays",
	"dedicatedIpCount",
	"maxSmtpProviders",
] as const;

type LimitKey = (typeof LIMIT_KEYS)[number];

function isExtra<K extends LimitKey>(
	current: PlanLimits,
	catalog: PlanLimits,
	key: K,
): boolean {
	return current[key] !== catalog[key];
}

function keepHigherNumber(current: number, next: number): number {
	return Math.max(current, next);
}

/**
 * Build the org's lifetime plan.
 *
 * Catalog values replace matching fields. Fields the org already customized
 * (different from the old catalog) stay, taking the higher cap on upgrades.
 */
export function applyPlanChange(args: {
	current: PlanLimits | null;
	nextPlanId: PlanId;
}): PlanLimits {
	const next = getPlanLimits(args.nextPlanId);
	if (!args.current) return next;

	const previousCatalog = getPlanLimits(args.current.planId);
	const result: PlanLimits = { ...next, planId: args.nextPlanId };

	for (const key of LIMIT_KEYS) {
		if (!isExtra(args.current, previousCatalog, key)) continue;

		const currentValue = args.current[key];
		const nextValue = next[key];

		if (typeof currentValue === "boolean" || typeof nextValue === "boolean") {
			result[key] = currentValue as never;
			continue;
		}

		if (currentValue === null || nextValue === null) {
			result[key] = (currentValue ?? nextValue) as never;
			continue;
		}

		result[key] = keepHigherNumber(currentValue, nextValue) as never;
	}

	return result;
}

/** One-time email credits (pay as you go). */
export const creditPack = {
	usdPerThousand: 0.5,
	validityMonths: 6,
	minEmails: 3_000,
	maxEmails: 100_000,
	stepEmails: 1_000,
} as const;

/** Pack sizes offered in the dashboard, matching the pricing page slider. */
export const creditPackSizes = [
	3_000, 5_000, 10_000, 15_000, 20_000, 30_000, 40_000, 50_000, 75_000, 100_000,
] as const;

export function isValidCreditPackSize(emails: number): boolean {
	return (
		Number.isInteger(emails) &&
		emails >= creditPack.minEmails &&
		emails <= creditPack.maxEmails &&
		emails % creditPack.stepEmails === 0
	);
}

/** Price of a credit pack in US cents. */
export function creditPackPriceCents(emails: number): number {
	return Math.round(
		(emails / creditPack.stepEmails) * creditPack.usdPerThousand * 100,
	);
}

export function closePeriodSnapshot(args: {
	includedEmails: number;
	emailsUsed: number;
}): {
	includedEmails: number;
	emailsUsed: number;
	emailsOverage: number;
	unusedEmails: number;
} {
	const emailsOverage = Math.max(0, args.emailsUsed - args.includedEmails);
	const unusedEmails = Math.max(0, args.includedEmails - args.emailsUsed);
	return {
		includedEmails: args.includedEmails,
		emailsUsed: args.emailsUsed,
		emailsOverage,
		unusedEmails,
	};
}

export const polarStatusMap = {
	incomplete: "trialing",
	trialing: "trialing",
	active: "active",
	past_due: "past_due",
	canceled: "cancelled",
	cancelled: "cancelled",
	unpaid: "past_due",
	revoked: "cancelled",
	paused: "paused",
} as const;

export type ReloopSubscriptionStatus =
	(typeof polarStatusMap)[keyof typeof polarStatusMap];

export function mapPolarSubscriptionStatus(
	status: string,
): ReloopSubscriptionStatus {
	const mapped =
		polarStatusMap[status as keyof typeof polarStatusMap] ?? "active";
	return mapped;
}
