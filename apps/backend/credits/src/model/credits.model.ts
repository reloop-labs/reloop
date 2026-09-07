import { t } from "elysia";

export namespace CreditsModel {
	export const usageResponse = t.Object({
		plan: t.Object({
			id: t.Optional(t.String()),
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
			creditsSent: t.Number(),
			creditsReceived: t.Number(),
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
			cancelAtPeriodEnd: t.Optional(t.Boolean()),
			planId: t.Optional(t.String()),
		}),
	});

	export const checkoutBody = t.Object({
		planId: t.Union([t.Literal("individual"), t.Literal("startup")]),
	});

	export const checkoutResponse = t.Object({
		url: t.String(),
		checkoutId: t.String(),
	});

	export const portalResponse = t.Object({
		url: t.String(),
	});

	export const webhookAccepted = t.Object({
		received: t.Literal(true),
	});

	export const adminPlanPatchBody = t.Object({
		monthlyEmails: t.Optional(t.Number()),
		dailyEmailLimit: t.Optional(t.Union([t.Number(), t.Null()])),
		overageEnabled: t.Optional(t.Boolean()),
		maxAgentInboxes: t.Optional(t.Number()),
		maxWebhooks: t.Optional(t.Number()),
		maxCustomDomains: t.Optional(t.Number()),
		maxAttachmentBytes: t.Optional(t.Number()),
		dataRetentionDays: t.Optional(t.Number()),
		dedicatedIpCount: t.Optional(t.Number()),
	});

	export const adminPlanPatchResponse = t.Object({
		organizationId: t.String(),
		planId: t.String(),
		monthlyEmails: t.Number(),
		dailyEmailLimit: t.Union([t.Number(), t.Null()]),
		overageEnabled: t.Boolean(),
		maxAgentInboxes: t.Number(),
		maxWebhooks: t.Number(),
		maxCustomDomains: t.Number(),
		maxAttachmentBytes: t.Number(),
		dataRetentionDays: t.Number(),
		dedicatedIpCount: t.Number(),
	});

	export const periodsResponse = t.Array(
		t.Object({
			id: t.String(),
			planId: t.String(),
			periodStart: t.Date(),
			periodEnd: t.Date(),
			includedEmails: t.Number(),
			emailsUsed: t.Number(),
			emailsOverage: t.Number(),
		}),
	);

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
