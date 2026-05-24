import { t } from "elysia";

export namespace CreditsModel {
	export const usageResponse = t.Object({
		plan: t.Object({
			name: t.String(),
			monthlyCredits: t.Number(),
			basePriceUsd: t.String(),
			billingCycle: t.String(),
			ratePerSecond: t.Number(),
			ratePerMinute: t.Number(),
			ratePerHour: t.Number(),
			maxAttachmentSizeMb: t.Number(),
			overageLimit: t.Number(),
		}),
		subscription: t.Object({
			status: t.String(),
			creditsUsed: t.Number(),
			creditsRemaining: t.Number(),
			currentPeriodStart: t.String(),
			currentPeriodEnd: t.String(),
		}),
	});

	export const planResponse = t.Object({
		plan: t.Any(),
		subscription: t.Object({
			status: t.String(),
			currentPeriodStart: t.String(),
			currentPeriodEnd: t.String(),
			creditsUsed: t.Number(),
			creditsRemaining: t.Number(),
		}),
	});

	export const topupBody = t.Object({
		organizationId: t.String(),
		amount: t.Number(),
		reason: t.Optional(t.String()),
		metadata: t.Optional(t.Record(t.String(), t.Any())),
	});

	export const topupResponse = t.Object({
		success: t.Boolean(),
	});

	export const transactionItem = t.Object({
		id: t.String(),
		organizationId: t.String(),
		organizationCreditsId: t.String(),
		entryType: t.String(),
		delta: t.Number(),
		balanceAfter: t.Number(),
		reason: t.Union([t.String(), t.Null()]),
		createdAt: t.Date(),
	});

	export const transactionsResponse = t.Array(transactionItem);

	export const unauthorized = t.Object({
		message: t.Literal("Unauthorized access"),
		why: t.String(),
		fix: t.String(),
	});
}
