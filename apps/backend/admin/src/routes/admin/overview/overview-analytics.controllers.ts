import { db } from "@reloop/db/client";
import { domain, emailLog, organization, user } from "@reloop/db/schema";
import { and, count, desc, eq, gte, isNull, lt, sql } from "drizzle-orm";

export type AnalyticsRange = "7d" | "30d" | "90d";

const RANGE_DAYS: Record<AnalyticsRange, number> = {
	"7d": 7,
	"30d": 30,
	"90d": 90,
};

const DAY_MS = 24 * 60 * 60 * 1000;

type DailyBucket = {
	date: string;
	delivered: number;
	bounced: number;
	failed: number;
	other: number;
	users: number;
	organizations: number;
	domains: number;
};

type Totals = {
	emails: number;
	delivered: number;
	bounced: number;
	failed: number;
	users: number;
	organizations: number;
	domains: number;
};

function utcDayStart(date: Date) {
	return new Date(
		Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
	);
}

function dayKey(date: Date) {
	return date.toISOString().slice(0, 10);
}

/** Groups email_log rows into the outcome buckets the console charts. */
const emailOutcome = sql<"delivered" | "bounced" | "failed" | "other">`case
	when ${emailLog.status} in ('sent', 'delivered') then 'delivered'
	when ${emailLog.status} = 'bounced' then 'bounced'
	when ${emailLog.status} = 'failed' then 'failed'
	else 'other' end`;

async function emailOutcomesByDay(from: Date, to: Date) {
	const day = sql<string>`to_char(date_trunc('day', ${emailLog.createdAt}), 'YYYY-MM-DD')`;
	return db
		.select({ day, outcome: emailOutcome, value: count() })
		.from(emailLog)
		.where(and(gte(emailLog.createdAt, from), lt(emailLog.createdAt, to)))
		.groupBy(day, emailOutcome);
}

async function createdByDay(
	table: typeof user | typeof organization | typeof domain,
	from: Date,
	to: Date,
) {
	const day = sql<string>`to_char(date_trunc('day', ${table.createdAt}), 'YYYY-MM-DD')`;
	return db
		.select({ day, value: count() })
		.from(table)
		.where(and(gte(table.createdAt, from), lt(table.createdAt, to)))
		.groupBy(day);
}

async function periodTotals(from: Date, to: Date): Promise<Totals> {
	const [emailRows, [users], [orgs], [domains]] = await Promise.all([
		db
			.select({ outcome: emailOutcome, value: count() })
			.from(emailLog)
			.where(and(gte(emailLog.createdAt, from), lt(emailLog.createdAt, to)))
			.groupBy(emailOutcome),
		db
			.select({ value: count() })
			.from(user)
			.where(and(gte(user.createdAt, from), lt(user.createdAt, to))),
		db
			.select({ value: count() })
			.from(organization)
			.where(
				and(gte(organization.createdAt, from), lt(organization.createdAt, to)),
			),
		db
			.select({ value: count() })
			.from(domain)
			.where(and(gte(domain.createdAt, from), lt(domain.createdAt, to))),
	]);

	const byOutcome = Object.fromEntries(
		emailRows.map((row) => [row.outcome, row.value]),
	);

	return {
		emails: emailRows.reduce((sum, row) => sum + row.value, 0),
		delivered: byOutcome.delivered ?? 0,
		bounced: byOutcome.bounced ?? 0,
		failed: byOutcome.failed ?? 0,
		users: users?.value ?? 0,
		organizations: orgs?.value ?? 0,
		domains: domains?.value ?? 0,
	};
}

export async function getOverviewAnalyticsController(range: AnalyticsRange) {
	const days = RANGE_DAYS[range];
	// Window is `days` whole UTC days ending with today (inclusive).
	const to = new Date(utcDayStart(new Date()).getTime() + DAY_MS);
	const from = new Date(to.getTime() - days * DAY_MS);
	const previousFrom = new Date(from.getTime() - days * DAY_MS);

	const [
		emailRows,
		userRows,
		orgRows,
		domainRows,
		current,
		previous,
		domainStatusRows,
		recentDomains,
		topOrgs,
	] = await Promise.all([
		emailOutcomesByDay(from, to),
		createdByDay(user, from, to),
		createdByDay(organization, from, to),
		createdByDay(domain, from, to),
		periodTotals(from, to),
		periodTotals(previousFrom, from),
		db
			.select({ status: domain.status, value: count() })
			.from(domain)
			.where(isNull(domain.deletedAt))
			.groupBy(domain.status),
		db
			.select({
				id: domain.id,
				domain: domain.domain,
				status: domain.status,
				organizationId: domain.organizationId,
				organizationName: organization.name,
				createdAt: domain.createdAt,
			})
			.from(domain)
			.leftJoin(organization, eq(organization.id, domain.organizationId))
			.where(isNull(domain.deletedAt))
			.orderBy(desc(domain.createdAt))
			.limit(8),
		db
			.select({
				organizationId: emailLog.organizationId,
				organizationName: organization.name,
				total: count(),
				delivered: sql<number>`count(*) filter (where ${emailLog.status} in ('sent', 'delivered'))::int`,
				bounced: sql<number>`count(*) filter (where ${emailLog.status} = 'bounced')::int`,
				failed: sql<number>`count(*) filter (where ${emailLog.status} = 'failed')::int`,
			})
			.from(emailLog)
			.leftJoin(organization, eq(organization.id, emailLog.organizationId))
			.where(and(gte(emailLog.createdAt, from), lt(emailLog.createdAt, to)))
			.groupBy(emailLog.organizationId, organization.name)
			.orderBy(desc(count()))
			.limit(6),
	]);

	const buckets = new Map<string, DailyBucket>();
	for (let i = 0; i < days; i++) {
		const date = dayKey(new Date(from.getTime() + i * DAY_MS));
		buckets.set(date, {
			date,
			delivered: 0,
			bounced: 0,
			failed: 0,
			other: 0,
			users: 0,
			organizations: 0,
			domains: 0,
		});
	}

	for (const row of emailRows) {
		const bucket = buckets.get(row.day);
		if (bucket) bucket[row.outcome] += row.value;
	}
	for (const [rows, key] of [
		[userRows, "users"],
		[orgRows, "organizations"],
		[domainRows, "domains"],
	] as const) {
		for (const row of rows) {
			const bucket = buckets.get(row.day);
			if (bucket) bucket[key] += row.value;
		}
	}

	const domainStatus = {
		pending: 0,
		verifying: 0,
		active: 0,
		suspended: 0,
		failed: 0,
	};
	for (const row of domainStatusRows) {
		domainStatus[row.status] = row.value;
	}

	return {
		range,
		from,
		to,
		totals: { current, previous },
		daily: [...buckets.values()],
		domainStatus,
		recentDomains: recentDomains.map((row) => ({
			...row,
			organizationName: row.organizationName ?? null,
		})),
		topOrganizations: topOrgs.map((row) => ({
			organizationId: row.organizationId,
			organizationName: row.organizationName ?? null,
			total: row.total,
			delivered: Number(row.delivered),
			bounced: Number(row.bounced),
			failed: Number(row.failed),
		})),
	};
}
