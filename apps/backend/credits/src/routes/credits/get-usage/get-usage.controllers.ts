import { creditsConfig } from "@reloop/credits/credits.config";
import { CreditErrors } from "@reloop/credits/error/credits.error-response";
import { getOrProvisionOrgBilling } from "@reloop/credits/lib/org-billing";
import { db } from "@reloop/db/client";
import { usablePrepaidCredits } from "@reloop/db/reserve-send-credits";
import {
	adminAuditLog,
	domain,
	emailSend,
	inboundEmail,
	mailbox,
	webhook,
} from "@reloop/db/schema";
import {
	isSelfHosted,
	SELF_HOSTED_MAX_ATTACHMENT_BYTES,
} from "@reloop/db/self-hosted";
import { getPlanById, planDisplayName } from "@reloop/pricing";
import { and, count, desc, eq, gte, isNull, like, ne, sum } from "drizzle-orm";

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
			conversionRows,
		] = await Promise.all([
			// Credits, not rows: one email_send row is charged per recipient.
			db
				.select({ value: sum(emailSend.creditsConsumed) })
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
			db
				.select({
					metadata: adminAuditLog.metadata,
					createdAt: adminAuditLog.createdAt,
				})
				.from(adminAuditLog)
				.where(
					and(
						eq(adminAuditLog.organizationId, organizationId),
						like(adminAuditLog.action, "organization.convert_to_%"),
					),
				)
				.orderBy(desc(adminAuditLog.createdAt))
				.limit(1),
		]);

		// Plan granted by a Reloop admin (convert-plan action) that is still the
		// active plan and isn't backed by a Polar subscription.
		const conversion = conversionRows[0];
		const grantedPlan =
			conversion &&
			conversion.metadata?.toPlan === billing.plan.planId &&
			!billing.subscription.polarSubscriptionId
				? {
						planId: billing.plan.planId,
						name: planDisplayName(billing.plan.planId),
						grantedAt: conversion.createdAt.toISOString(),
					}
				: null;

		const selfHosted = isSelfHosted();
		const maxAttachmentBytes = selfHosted
			? SELF_HOSTED_MAX_ATTACHMENT_BYTES
			: billing.plan.maxAttachmentBytes;

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
			maxSmtpProviders: billing.plan.maxSmtpProviders,
		};

		return {
			selfHosted,
			plan: {
				id: billing.plan.planId,
				name: planDisplayName(billing.plan.planId),
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
				creditsSent: Number(sentRows[0]?.value ?? 0),
				creditsReceived: receivedRows[0]?.value ?? 0,
				currentPeriodStart: billing.credits.currentPeriodStart.toISOString(),
				currentPeriodEnd: billing.credits.currentPeriodEnd.toISOString(),
			},
			prepaid: {
				balance: usablePrepaidCredits(billing.credits, new Date()),
				expiresAt: billing.credits.prepaidExpiresAt?.toISOString() ?? null,
			},
			grantedPlan,
			resources: {
				agentInboxes: {
					used: inboxRows[0]?.value ?? 0,
					limit: selfHosted ? null : entitlements.maxAgentInboxes,
				},
				webhooks: {
					used: webhookRows[0]?.value ?? 0,
					limit: selfHosted ? null : entitlements.maxWebhooks,
				},
				customDomains: {
					used: domainRows[0]?.value ?? 0,
					limit: selfHosted ? null : entitlements.maxCustomDomains,
				},
			},
			daily: {
				sent: Number(dailyRows[0]?.value ?? 0),
				limit: selfHosted ? null : entitlements.dailyEmailLimit,
			},
		};
	} catch (error) {
		throw CreditErrors.databaseError(
			error instanceof Error ? error.message : "Unknown database error",
		);
	}
};
