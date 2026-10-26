import { db } from "@reloop/db/client";
import type { LogsModel } from "@reloop/logs/model/logs.model";
import { type SQL, sql } from "drizzle-orm";

/** Below this many opens a "best time" would be noise. */
const MIN_BEST_TIME_SAMPLE = 30;
const TOP_N = 8;

export function resolveTimeZone(tz: string | undefined): string {
	if (!tz) return "UTC";
	try {
		new Intl.DateTimeFormat("en-US", { timeZone: tz });
		return tz;
	} catch {
		return "UTC";
	}
}

export function emptyHeatmap(): number[][] {
	return Array.from({ length: 7 }, () => Array<number>(24).fill(0));
}

/** Busiest day/hour cell, or null when the sample is too small to trust. */
export function pickBestTime(
	heatmap: number[][],
	sampleSize: number,
): { day: number; hour: number } | null {
	if (sampleSize < MIN_BEST_TIME_SAMPLE) return null;
	let best: { day: number; hour: number } | null = null;
	let max = 0;
	heatmap.forEach((hours, day) => {
		hours.forEach((count, hour) => {
			if (count > max) {
				max = count;
				best = { day, hour };
			}
		});
	});
	return best;
}

type Bucket = { name: string; count: number };

export async function getEngagementController({
	query,
	organizationId,
}: {
	query: LogsModel.EngagementQuery;
	organizationId: string;
}): Promise<LogsModel.EngagementResponse> {
	const timeZone = resolveTimeZone(query.tz);

	const filters: SQL[] = [
		sql`l.organization_id = ${organizationId}`,
		sql`e.type in ('opened', 'clicked')`,
	];
	if (query.start_date) {
		filters.push(sql`e.created_at >= ${new Date(query.start_date)}`);
	}
	if (query.end_date) {
		filters.push(sql`e.created_at <= ${new Date(query.end_date)}`);
	}
	if (query.campaign_id) {
		filters.push(sql`exists (
			select 1 from campaign_recipient r
			where r.email_log_id = l.id and r.campaign_id = ${query.campaign_id}
		)`);
	}
	const where = sql.join(filters, sql` and `);

	// One row per engagement event, with the context captured at open/click.
	// Opens inferred from a click count as opens but have no email client.
	// Events recorded before capture existed have no `machine` flag and count
	// as human with an unknown client.
	const events = sql`
		select
			e.email_log_id as email_id,
			e.type,
			e.created_at,
			coalesce((e.metadata->>'machine')::boolean, false) as machine,
			e.metadata->>'client' as client,
			e.metadata->>'inferred' as inferred,
			e.metadata->>'device' as device,
			e.metadata->>'country' as country
		from email_event e
		join email_log l on l.id = e.email_log_id
		where ${where}
	`;

	const [
		totalsResult,
		clientsResult,
		devicesResult,
		countriesResult,
		heatResult,
	] = await Promise.all([
		db.execute(sql`
				with ev as (${events})
				select
					count(distinct email_id) filter (where type = 'opened' and not machine)::int as opens,
					(
						count(distinct email_id) filter (where type = 'opened')
						- count(distinct email_id) filter (where type = 'opened' and not machine)
					)::int as machine_opens,
					count(distinct email_id) filter (where type = 'clicked' and not machine)::int as clicks
				from ev
			`),
		db.execute(sql`
				with ev as (${events})
				select coalesce(client, 'Unknown') as name, count(distinct email_id)::int as count
				from ev where type = 'opened' and not machine and inferred is null
				group by 1 order by 2 desc limit ${TOP_N}
			`),
		db.execute(sql`
				with ev as (${events})
				select device as name, count(distinct email_id)::int as count
				from ev where not machine and device is not null
				group by 1 order by 2 desc limit ${TOP_N}
			`),
		db.execute(sql`
				with ev as (${events})
				select country as name, count(distinct email_id)::int as count
				from ev where not machine and country is not null
				group by 1 order by 2 desc limit ${TOP_N}
			`),
		// First human open per email, in the viewer's time zone.
		db.execute(sql`
				with ev as (${events}),
				first_open as (
					select email_id, min(created_at) as at
					from ev where type = 'opened' and not machine
					group by email_id
				),
				local as (
					select (at at time zone 'UTC') at time zone ${timeZone} as at
					from first_open
				)
				select
					(extract(isodow from at)::int - 1) as day,
					extract(hour from at)::int as hour,
					count(*)::int as count
				from local
				group by 1, 2
			`),
	]);

	const totals = (totalsResult.rows[0] ?? {}) as {
		opens?: number;
		machine_opens?: number;
		clicks?: number;
	};

	const heatmap = emptyHeatmap();
	let sampleSize = 0;
	for (const row of heatResult.rows as {
		day: number;
		hour: number;
		count: number;
	}[]) {
		const hours = heatmap[row.day];
		if (hours && row.hour >= 0 && row.hour < 24) {
			hours[row.hour] = row.count;
			sampleSize += row.count;
		}
	}

	return {
		object: "engagement" as const,
		totals: {
			opens: totals.opens ?? 0,
			machineOpens: totals.machine_opens ?? 0,
			clicks: totals.clicks ?? 0,
		},
		clients: clientsResult.rows as Bucket[],
		devices: devicesResult.rows as Bucket[],
		countries: countriesResult.rows as Bucket[],
		bestTime: {
			timeZone,
			heatmap,
			best: pickBestTime(heatmap, sampleSize),
			sampleSize,
		},
	};
}
