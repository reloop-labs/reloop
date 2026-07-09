import { db } from "@reloop/db/client";
import {
	domain,
	emailLog,
	organization,
	organizationCredits,
	user,
} from "@reloop/db/schema";
import { and, count, eq, gte, sql } from "drizzle-orm";

export async function getOverviewController() {
	const startOfDay = new Date();
	startOfDay.setHours(0, 0, 0, 0);

	const [usersCount] = await db.select({ value: count() }).from(user);

	const [orgsTotal] = await db.select({ value: count() }).from(organization);
	const [orgsActive] = await db
		.select({ value: count() })
		.from(organization)
		.where(eq(organization.status, "active"));
	const [orgsSuspended] = await db
		.select({ value: count() })
		.from(organization)
		.where(eq(organization.status, "suspended"));

	const [domainsTotal] = await db
		.select({ value: count() })
		.from(domain)
		.where(sql`${domain.deletedAt} IS NULL`);
	const [domainsActive] = await db
		.select({ value: count() })
		.from(domain)
		.where(and(eq(domain.status, "active"), sql`${domain.deletedAt} IS NULL`));
	const [domainsFailed] = await db
		.select({ value: count() })
		.from(domain)
		.where(and(eq(domain.status, "failed"), sql`${domain.deletedAt} IS NULL`));
	const [domainsSuspended] = await db
		.select({ value: count() })
		.from(domain)
		.where(
			and(eq(domain.status, "suspended"), sql`${domain.deletedAt} IS NULL`),
		);

	const [emailsSentToday] = await db
		.select({ value: count() })
		.from(emailLog)
		.where(gte(emailLog.createdAt, startOfDay));
	const [emailsBouncedToday] = await db
		.select({ value: count() })
		.from(emailLog)
		.where(
			and(eq(emailLog.status, "bounced"), gte(emailLog.createdAt, startOfDay)),
		);
	const [emailsFailedToday] = await db
		.select({ value: count() })
		.from(emailLog)
		.where(
			and(eq(emailLog.status, "failed"), gte(emailLog.createdAt, startOfDay)),
		);

	const [creditsSum] = await db
		.select({
			value: sql<number>`coalesce(sum(${organizationCredits.creditsRemaining}), 0)`,
		})
		.from(organizationCredits);

	return {
		users: usersCount?.value ?? 0,
		organizations: {
			total: orgsTotal?.value ?? 0,
			active: orgsActive?.value ?? 0,
			suspended: orgsSuspended?.value ?? 0,
		},
		domains: {
			total: domainsTotal?.value ?? 0,
			active: domainsActive?.value ?? 0,
			failed: domainsFailed?.value ?? 0,
			suspended: domainsSuspended?.value ?? 0,
		},
		emails: {
			sentToday: emailsSentToday?.value ?? 0,
			bouncedToday: emailsBouncedToday?.value ?? 0,
			failedToday: emailsFailedToday?.value ?? 0,
		},
		credits: {
			totalRemaining: Number(creditsSum?.value ?? 0),
		},
	};
}
