import { db } from "@reloop/db/client";
import { emailSend, member, user } from "@reloop/db/schema";
import { and, count, eq, gte, lt, sql } from "drizzle-orm";
import { getOrProvisionSubscription } from "../../../utils/subscription";

export const getUsageController = async ({ activeOrganizationId }: { activeOrganizationId: string }) => {
	const orgId = activeOrganizationId;

	// 1. Get or provision subscription
	const activeSub = await getOrProvisionSubscription(orgId);

	const now = new Date();
	const todayStart = new Date(now);
	todayStart.setHours(0, 0, 0, 0);
	const yesterdayStart = new Date(todayStart);
	yesterdayStart.setDate(yesterdayStart.getDate() - 1);

	// 2. Emails sent today (in current billing period)
	const [todayRow] = await db
		.select({ total: count() })
		.from(emailSend)
		.where(
			and(
				eq(emailSend.organizationId, orgId),
				eq(emailSend.subscriptionId, activeSub.id),
				gte(emailSend.sentAt, todayStart),
			),
		);

	// 3. Emails sent yesterday
	const [yesterdayRow] = await db
		.select({ total: count() })
		.from(emailSend)
		.where(
			and(
				eq(emailSend.organizationId, orgId),
				eq(emailSend.subscriptionId, activeSub.id),
				gte(emailSend.sentAt, yesterdayStart),
				lt(emailSend.sentAt, todayStart),
			),
		);

	// 4. Delivery rate: sent / (sent + failed + bounced) in this period
	const [deliveryRow] = await db
		.select({
			sent: count(
				sql`CASE WHEN ${emailSend.status} = 'sent' THEN 1 END`,
			),
			failed: count(
				sql`CASE WHEN ${emailSend.status} IN ('failed', 'bounced') THEN 1 END`,
			),
		})
		.from(emailSend)
		.where(
			and(
				eq(emailSend.organizationId, orgId),
				gte(emailSend.sentAt, activeSub.currentPeriodStart),
			),
		);

	const sentCount = Number(deliveryRow?.sent ?? 0);
	const failedCount = Number(deliveryRow?.failed ?? 0);
	const totalAttempted = sentCount + failedCount;
	const deliveryRate =
		totalAttempted > 0
			? Math.round((sentCount / totalAttempted) * 1000) / 10
			: 100;

	// 5. Daily average — spread creditsUsed over days elapsed in period
	const periodStart = activeSub.currentPeriodStart;
	const daysElapsed = Math.max(
		1,
		Math.ceil((now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)),
	);
	const dailyAverage = Math.round(activeSub.creditsUsed / daysElapsed);

	// 6. Member count — active and non-banned
	const [memberRow] = await db
		.select({ total: count() })
		.from(member)
		.innerJoin(user, eq(member.userId, user.id))
		.where(
			and(
				eq(member.organizationId, orgId),
				eq(user.banned, false),
			),
		);

	return {
		plan: {
			name: activeSub.plan.name,
			monthlyCredits: activeSub.plan.monthlyCredits,
			basePriceUsd: activeSub.plan.basePriceUsd,
			billingCycle: activeSub.plan.billingCycle,
			ratePerSecond: activeSub.plan.ratePerSecond,
			ratePerMinute: activeSub.plan.ratePerMinute,
			ratePerHour: activeSub.plan.ratePerHour,
			maxAttachmentSizeMb: activeSub.plan.maxAttachmentSizeMb,
			overageLimit: activeSub.plan.overageLimit,
		},
		subscription: {
			status: activeSub.status,
			creditsUsed: activeSub.creditsUsed,
			creditsRemaining: activeSub.creditsRemaining,
			currentPeriodStart: activeSub.currentPeriodStart.toISOString(),
			currentPeriodEnd: activeSub.currentPeriodEnd.toISOString(),
		},
		stats: {
			emailsSentThisMonth: activeSub.creditsUsed,
			emailsSentToday: Number(todayRow?.total ?? 0),
			emailsSentYesterday: Number(yesterdayRow?.total ?? 0),
			dailyAverage,
			deliveryRate,
		},
		members: {
			total: Number(memberRow?.total ?? 0),
		},
	};
};
