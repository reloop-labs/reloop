import { creditsConfig } from "@reloop/credits/credits.config";
import { CreditErrors } from "@reloop/credits/error/credits.error-response";
import { getOrProvisionOrgBilling } from "@reloop/credits/lib/org-billing";
import { SELF_HOSTED_MAX_ATTACHMENT_BYTES } from "@reloop/db/billing-enabled";
import { db } from "@reloop/db/client";
import {
	domain,
	emailSend,
	inboundEmail,
	mailbox,
	webhook,
} from "@reloop/db/schema";
import { getPlanById } from "@reloop/pricing";
import { and, count, eq, gte, isNull, ne, sum } from "drizzle-orm";

export const getUsageController = async ({
	organizationId,
}: {
	organizationId: string;
}) => {
	try {
		const billing = await getOrProvisionOrgBilling(organizationId);
		const catalog = getPlanById(billing.plan.planId);
		const monthlyPrice = catalog?.monthlyPrice ?? 0;
		const periodStart = billing.credits.currentPeriodStart;

		const todayStart = new Date();
		todayStart.setHours(0, 0, 0, 0);

		const [
			sentRows,
			receivedRows,
			inboxRows,
			webhookRows,
			domainRows,
			dailyRows,
		] = await Promise.all([
			db
				.select({ value: count() })
				.from(emailSend)
				.where(
					and(
						eq(emailSend.organizationId, organizationId),
						gte(emailSend.sentAt, periodStart),
					),
				),
			db
				.select({ value: count() })
				.from(inboundEmail)
				.where(
					and(
						eq(inboundEmail.organizationId, organizationId),
						gte(inboundEmail.createdAt, periodStart),
						ne(inboundEmail.status, "spam"),
					),
				),
			db
				.select({ value: count() })
				.from(mailbox)
				.where(eq(mailbox.organizationId, organizationId)),
			db
				.select({ value: count() })
				.from(webhook)
				.where(
					and(
						eq(webhook.organizationId, organizationId),
						isNull(webhook.deletedAt),
					),
				),
			db
				.select({ value: count() })
				.from(domain)
				.where(
					and(
						eq(domain.organizationId, organizationId),
						isNull(domain.deletedAt),
						eq(domain.isSendingEmailEnabled, true),
					),
				),
			db
				.select({ value: sum(emailSend.creditsConsumed) })
				.from(emailSend)
				.where(
					and(
						eq(emailSend.organizationId, organizationId),
						gte(emailSend.sentAt, todayStart),
					),
				),
		]);

		const billingEnabled = creditsConfig.BILLING_ENABLED;
		const maxAttachmentBytes = billingEnabled
			? billing.plan.maxAttachmentBytes
			: SELF_HOSTED_MAX_ATTACHMENT_BYTES;

		const entitlements = {
			monthlyEmails: billing.plan.monthlyEmails,
			dailyEmailLimit: billing.plan.dailyEmailLimit,
			overageEnabled: billing.plan.overageEnabled,
			maxAgentInboxes: billing.plan.maxAgentInboxes,
			maxWebhooks: billing.plan.maxWebhooks,
			maxCustomDomains: billing.plan.maxCustomDomains,
			maxAttachmentBytes,
			dataRetentionDays: billing.plan.dataRetentionDays,
			dedicatedIpCount: billing.plan.dedicatedIpCount,
		};

		return {
			billingEnabled,
			plan: {
				id: billing.plan.planId,
				name: catalog?.name ?? "Free",
				monthlyCredits: billing.plan.monthlyEmails,
				basePriceUsd:
					monthlyPrice === null ? "custom" : monthlyPrice.toFixed(2),
				billingCycle: billing.subscription.billingCycle,
				ratePerSecond: 10,
				ratePerMinute: billing.plan.dailyEmailLimit ?? 0,
				ratePerHour: 5000,
				maxAttachmentSizeMb: Math.round(maxAttachmentBytes / (1024 * 1024)),
				overageLimit: billing.plan.overageEnabled ? -1 : 0,
				entitlements,
			},
			subscription: {
				status: billing.subscription.status,
				planId: billing.subscription.planId,
				cancelAtPeriodEnd: billing.subscription.cancelAtPeriodEnd,
				creditsUsed: billing.credits.creditsUsed,
				creditsRemaining: billing.credits.creditsRemaining,
				creditsSent: sentRows[0]?.value ?? 0,
				creditsReceived: receivedRows[0]?.value ?? 0,
				currentPeriodStart: billing.credits.currentPeriodStart.toISOString(),
				currentPeriodEnd: billing.credits.currentPeriodEnd.toISOString(),
			},
			resources: {
				agentInboxes: {
					used: inboxRows[0]?.value ?? 0,
					limit: billingEnabled ? entitlements.maxAgentInboxes : null,
				},
				webhooks: {
					used: webhookRows[0]?.value ?? 0,
					limit: billingEnabled ? entitlements.maxWebhooks : null,
				},
				customDomains: {
					used: domainRows[0]?.value ?? 0,
					limit: billingEnabled ? entitlements.maxCustomDomains : null,
				},
			},
			daily: {
				sent: Number(dailyRows[0]?.value ?? 0),
				limit: billingEnabled ? entitlements.dailyEmailLimit : null,
			},
		};
	} catch (error) {
		throw CreditErrors.databaseError(
			error instanceof Error ? error.message : "Unknown database error",
		);
	}
};
