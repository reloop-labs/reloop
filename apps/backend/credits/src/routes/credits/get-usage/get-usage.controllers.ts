import { getOrProvisionCredits } from "@reloop/credits/utils/credits";
import { db } from "@reloop/db/client";
import { emailSend, member, user } from "@reloop/db/schema";
import { and, count, eq, gte, lt, sql } from "drizzle-orm";

export const getUsageController = async ({
	activeOrganizationId,
}: {
	activeOrganizationId: string;
}) => {
	const orgId = activeOrganizationId;

	// 1. Get or provision credits
	const activeCredits = await getOrProvisionCredits(orgId);

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
				eq(emailSend.organizationCreditsId, activeCredits.id),
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
				eq(emailSend.organizationCreditsId, activeCredits.id),
				gte(emailSend.sentAt, yesterdayStart),
				lt(emailSend.sentAt, todayStart),
			),
		);

	// 4. Delivery rate: sent / (sent + failed + bounced) in this period
	const [deliveryRow] = await db
		.select({
			sent: count(sql`CASE WHEN ${emailSend.status} = 'sent' THEN 1 END`),
			failed: count(
				sql`CASE WHEN ${emailSend.status} IN ('failed', 'bounced') THEN 1 END`,
			),
		})
		.from(emailSend)
		.where(
			and(
				eq(emailSend.organizationId, orgId),
				gte(emailSend.sentAt, activeCredits.currentPeriodStart),
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
	const periodStart = activeCredits.currentPeriodStart;
	const daysElapsed = Math.max(
		1,
		Math.ceil((now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)),
	);
	const dailyAverage = Math.round(activeCredits.creditsUsed / daysElapsed);

	// 6. Member count — active and non-banned
	const [memberRow] = await db
		.select({ total: count() })
		.from(member)
		.innerJoin(user, eq(member.userId, user.id))
		.where(and(eq(member.organizationId, orgId), eq(user.banned, false)));

	return {
		plan: {
			name: "Free",
			monthlyCredits: activeCredits.monthlyCredits,
			basePriceUsd: "0.00",
			billingCycle: "monthly",
			ratePerSecond: 10,
			ratePerMinute: 200,
			ratePerHour: 5000,
			maxAttachmentSizeMb: 5,
			overageLimit: 0,
		},
		subscription: {
			status: activeCredits.status,
			creditsUsed: activeCredits.creditsUsed,
			creditsRemaining: activeCredits.creditsRemaining,
			currentPeriodStart: activeCredits.currentPeriodStart.toISOString(),
			currentPeriodEnd: activeCredits.currentPeriodEnd.toISOString(),
		},
		stats: {
			emailsSentThisMonth: activeCredits.creditsUsed,
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
