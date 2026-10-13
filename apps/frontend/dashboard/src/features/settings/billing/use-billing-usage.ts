import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "#/lib/query-keys";

export type BillingEntitlements = {
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

export type ResourceUsage = {
	used: number;
	limit: number | null;
};

export interface BillingUsage {
	selfHosted: boolean;
	plan: {
		id?: string;
		name: string;
		monthlyCredits: number;
		basePriceUsd: string;
		billingCycle: "monthly" | "annual";
		ratePerSecond: number;
		ratePerMinute: number;
		ratePerHour: number;
		maxAttachmentSizeMb: number;
		overageLimit: number;
		entitlements?: BillingEntitlements;
	};
	subscription: {
		status: string;
		creditsUsed: number;
		creditsRemaining: number;
		creditsSent?: number;
		creditsReceived?: number;
		currentPeriodStart: string;
		currentPeriodEnd: string;
		cancelAtPeriodEnd?: boolean;
		planId?: string;
	};
	/** Set when a Reloop admin granted the current plan (not paid via checkout). */
	grantedPlan?: {
		planId: string;
		name: string;
		grantedAt: string;
	} | null;
	resources?: {
		agentInboxes: ResourceUsage;
		webhooks: ResourceUsage;
		customDomains: ResourceUsage;
	};
	daily?: {
		sent: number;
		limit: number | null;
	};
}

export interface BillingPeriod {
	id: string;
	planId: string;
	periodStart: string;
	periodEnd: string;
	includedEmails: number;
	emailsUsed: number;
	emailsOverage: number;
}

/**
 * Monthly email usage. Both sent and received email count toward the plan:
 * `creditsUsed` holds send credits (one per recipient, kept live by usage
 * updates) and `creditsReceived` the non-spam inbound emails this period.
 */
export function emailUsage(
	subscription: BillingUsage["subscription"],
	monthlyIncluded: number,
): { sent: number; received: number; used: number; remaining: number } {
	const sent = Math.max(0, subscription.creditsUsed);
	const received = Math.max(0, subscription.creditsReceived ?? 0);
	const used = sent + received;
	return {
		sent,
		received,
		used,
		remaining: Math.max(0, monthlyIncluded - used),
	};
}

export interface UsageLiveUpdate {
	organizationId: string;
	creditsUsed: number;
	creditsRemaining: number;
	monthlyCredits: number;
	periodStart: string;
	periodEnd: string;
}

async function fetchBillingUsage(): Promise<BillingUsage | null> {
	const res = await fetch("/api/credits/v1/usage", {
		credentials: "include",
	});
	if (res.status === 404) return null;
	if (!res.ok) {
		throw new Error(`Failed to load billing usage (${res.status})`);
	}
	return res.json() as Promise<BillingUsage>;
}

async function fetchBillingPeriods(): Promise<BillingPeriod[]> {
	const res = await fetch("/api/credits/v1/billing/periods", {
		credentials: "include",
	});
	if (!res.ok) {
		throw new Error(`Failed to load billing periods (${res.status})`);
	}
	return res.json() as Promise<BillingPeriod[]>;
}

export function useBillingUsage() {
	const queryClient = useQueryClient();
	const query = useQuery({
		queryKey: queryKeys.billing.usage(),
		queryFn: fetchBillingUsage,
		refetchOnWindowFocus: false,
	});

	const applyLiveUpdate = (update: UsageLiveUpdate) => {
		queryClient.setQueryData<BillingUsage | null>(
			queryKeys.billing.usage(),
			(prev) => {
				if (!prev) return prev;
				return {
					...prev,
					plan: {
						...prev.plan,
						monthlyCredits: update.monthlyCredits,
					},
					subscription: {
						...prev.subscription,
						creditsUsed: update.creditsUsed,
						creditsRemaining: update.creditsRemaining,
						currentPeriodStart: update.periodStart,
						currentPeriodEnd: update.periodEnd,
					},
				};
			},
		);
	};

	return {
		data: query.data ?? undefined,
		billingEnabled: query.data !== null && query.data?.selfHosted !== true,
		isLoading: query.isPending,
		error: query.error,
		refetch: () => query.refetch(),
		applyLiveUpdate,
	};
}

export function useBillingPeriods() {
	return useQuery({
		queryKey: queryKeys.billing.periods(),
		queryFn: fetchBillingPeriods,
		refetchOnWindowFocus: false,
	});
}
