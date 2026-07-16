import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "#/lib/query-keys";

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
		/** Emails sent outbound this period (optional, from backend breakdown) */
		creditsSent?: number;
		/** Emails received inbound this period (optional, from backend breakdown) */
		creditsReceived?: number;
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

async function fetchBillingUsage(): Promise<BillingUsage> {
	const res = await fetch("/api/credits/v1/usage", {
		credentials: "include",
	});
	if (!res.ok) {
		throw new Error(`Failed to load billing usage (${res.status})`);
	}
	return res.json() as Promise<BillingUsage>;
}

export function useBillingUsage() {
	const queryClient = useQueryClient();
	const query = useQuery({
		queryKey: queryKeys.billing.usage(),
		queryFn: fetchBillingUsage,
		refetchOnWindowFocus: false,
	});

	const applyLiveUpdate = (update: UsageLiveUpdate) => {
		queryClient.setQueryData<BillingUsage>(queryKeys.billing.usage(), (prev) => {
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
		});
	};

	return {
		data: query.data,
		isLoading: query.isPending,
		error: query.error,
		refetch: () => query.refetch(),
		applyLiveUpdate,
	};
}
