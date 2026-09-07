export type PlanId = "free" | "individual" | "startup" | "enterprise";

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
};

const MB = 1024 * 1024;

export const planLimits: Record<PlanId, PlanLimits> = {
	free: {
		planId: "free",
		monthlyEmails: 3_000,
		dailyEmailLimit: 200,
		overageEnabled: false,
		maxAgentInboxes: 1,
		maxWebhooks: 1,
		maxCustomDomains: 1,
		maxAttachmentBytes: 1 * MB,
		dataRetentionDays: 45,
		dedicatedIpCount: 0,
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
	},
};

export const checkoutPlanIds = ["individual", "startup"] as const;
export type CheckoutPlanId = (typeof checkoutPlanIds)[number];

export function isCheckoutPlanId(id: string): id is CheckoutPlanId {
	return (checkoutPlanIds as readonly string[]).includes(id);
}

const PLAN_IDS: PlanId[] = ["free", "individual", "startup", "enterprise"];

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
