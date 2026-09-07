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
};

export type ResourceUsage = {
	used: number;
	limit: number;
};

export interface BillingUsage {
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

export interface UsageLiveUpdate {
	organizationId: string;
	creditsUsed: number;
	creditsRemaining: number;
	monthlyCredits: number;
	periodStart: string;
	periodEnd: string;
}

async function fetchBillingUsage(): Promise<BillingUsage> {
	const res = await fetch("/api/credits/v1/usage", {
		credentials: "include",
	});
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
		queryClient.setQueryData<BillingUsage>(
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
		data: query.data,
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
