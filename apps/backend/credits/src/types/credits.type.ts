export interface BillingUsageResponse {
	plan: {
		name: string;
		monthlyCredits: number;
		basePriceUsd: string;
		billingCycle: string;
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

export interface PlanInfoResponse {
	plan: any; // Using any for the full plan record from DB for now
	subscription: {
		status: string;
		currentPeriodStart: string;
		currentPeriodEnd: string;
		creditsUsed: number;
		creditsRemaining: number;
	};
}
