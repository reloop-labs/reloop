"use client";

import useSWR from "swr";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BillingUsage {
	plan: {
		name: string;
		monthlyCredits: number;
		basePriceUsd: string;
		billingCycle: "monthly" | "annual";
		ratePerSecond: number;
		ratePerMinute: number;
		ratePerHour: number;
		maxAttachmentSizeMb: number;
		overageLimit: number;
	};
	subscription: {
		status: string;
		creditsUsed: number;
		creditsRemaining: number;
		currentPeriodStart: string;
		currentPeriodEnd: string;
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

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBillingUsage() {
	const { data, error, isLoading, mutate } = useSWR<BillingUsage>(
		"/api/credits/v1/usage",
	);

	// Apply a live USAGE_UPDATED patch without a full re-fetch
	const applyLiveUpdate = (update: UsageLiveUpdate) => {
		mutate((prev) => {
			if (!prev) return prev;
			return {
				...prev,
				subscription: {
					...prev.subscription,
					creditsUsed: update.creditsUsed,
					creditsRemaining: update.creditsRemaining,
					currentPeriodStart: update.periodStart,
					currentPeriodEnd: update.periodEnd,
				},
			};
		}, false); // false = don't revalidate after optimistic update
	};

	return {
		data,
		isLoading,
		error,
		refetch: () => mutate(),
		applyLiveUpdate,
	};
}
