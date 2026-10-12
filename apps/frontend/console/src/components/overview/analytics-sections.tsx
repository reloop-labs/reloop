"use client";

import { SectionCard } from "@fe/console/components/ui/section-card";
import { StatusPill } from "@fe/console/components/ui/status-pill";
import { formatNumber, formatRelativeTime } from "@fe/console/lib/format";
import { cn } from "@reloop/ui/cn";
import Link from "next/link";
import {
	EMAIL_SERIES,
	EmailVolumeChart,
	type EmailVolumePoint,
} from "./email-volume-chart";
import { Sparkline } from "./sparkline";

export type AnalyticsRange = "7d" | "30d" | "90d";

type DomainStatus = "pending" | "verifying" | "active" | "suspended" | "failed";

type Totals = {
	emails: number;
	delivered: number;
	bounced: number;
	failed: number;
	users: number;
	organizations: number;
	domains: number;
};

export type OverviewAnalytics = {
	range: AnalyticsRange;
	from: string;
	to: string;
	totals: { current: Totals; previous: Totals };
	daily: Array<
		EmailVolumePoint & { users: number; organizations: number; domains: number }
	>;
	domainStatus: Record<DomainStatus, number>;
	recentDomains: Array<{
		id: string;
		domain: string;
		status: DomainStatus;
		organizationId: string;
		organizationName: string | null;
		createdAt: string;
	}>;
	topOrganizations: Array<{
		organizationId: string;
		organizationName: string | null;
		total: number;
		delivered: number;
		bounced: number;
		failed: number;
	}>;
};

export const RANGE_LABEL: Record<AnalyticsRange, string> = {
	"7d": "7 days",
	"30d": "30 days",
	"90d": "90 days",
};

const CARD =
	"rounded-2xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]";

function rate(part: number, whole: number) {
	return whole > 0 ? part / whole : 0;
}

function formatPercent(value: number) {
	const pct = value * 100;
	return `${pct >= 10 || pct === 0 ? pct.toFixed(0) : pct.toFixed(1)}%`;
}

/**
 * Change vs the previous period. `kind: "count"` compares relative growth;
 * `kind: "rate"` compares percentage points. `goodWhen` decides the tone.
 */
function Delta({
	current,
	previous,
	kind,
	goodWhen,
}: {
	current: number;
	previous: number;
	kind: "count" | "rate";
	goodWhen: "up" | "down";
}) {
	let label: string;
	let direction: "up" | "down" | "flat";

	if (kind === "rate") {
		const diff = (current - previous) * 100;
		direction = Math.abs(diff) < 0.05 ? "flat" : diff > 0 ? "up" : "down";
		label = `${Math.abs(diff).toFixed(1)} pts`;
	} else if (previous === 0) {
		direction = current > 0 ? "up" : "flat";
		label = current > 0 ? "new" : "0%";
	} else {
		const change = (current - previous) / previous;
		direction = Math.abs(change) < 0.005 ? "flat" : change > 0 ? "up" : "down";
		label = `${Math.abs(change * 100).toFixed(change !== 0 && Math.abs(change) < 0.1 ? 1 : 0)}%`;
	}

	const tone =
		direction === "flat"
			? "text-text-sub-600"
			: direction === goodWhen
				? "text-emerald-700 dark:text-emerald-400"
				: "text-error-base";

	return (
		<span className={cn("inline-flex items-center gap-0.5 text-[12px]", tone)}>
			<span aria-hidden>
				{direction === "up" ? "↑" : direction === "down" ? "↓" : "→"}
			</span>
			{label}
		</span>
	);
}

export function EmailKpis({
	data,
	range,
}: {
	data: OverviewAnalytics;
	range: AnalyticsRange;
}) {
	const { current, previous } = data.totals;
	const items = [
		{
			label: "Emails sent",
			value: formatNumber(current.emails),
			delta: (
				<Delta
					current={current.emails}
					previous={previous.emails}
					kind="count"
					goodWhen="up"
				/>
			),
			href: "/emails",
		},
		{
			label: "Delivery rate",
			value: formatPercent(rate(current.delivered, current.emails)),
			delta: (
				<Delta
					current={rate(current.delivered, current.emails)}
					previous={rate(previous.delivered, previous.emails)}
					kind="rate"
					goodWhen="up"
				/>
			),
			href: "/emails?status=delivered",
		},
		{
			label: "Bounce rate",
			value: formatPercent(rate(current.bounced, current.emails)),
			hint: `${formatNumber(current.bounced)} bounced`,
			delta: (
				<Delta
					current={rate(current.bounced, current.emails)}
					previous={rate(previous.bounced, previous.emails)}
					kind="rate"
					goodWhen="down"
				/>
			),
			href: "/emails?status=bounced",
		},
		{
			label: "Failure rate",
			value: formatPercent(rate(current.failed, current.emails)),
			hint: `${formatNumber(current.failed)} failed`,
			delta: (
				<Delta
					current={rate(current.failed, current.emails)}
					previous={rate(previous.failed, previous.emails)}
					kind="rate"
					goodWhen="down"
				/>
			),
			href: "/emails?status=failed",
		},
	];

	return (
		<div className="grid gap-px overflow-hidden rounded-2xl border border-stroke-soft-100 bg-stroke-soft-100 sm:grid-cols-2 xl:grid-cols-4 dark:border-stroke-soft-100/40 dark:bg-stroke-soft-100/40">
			{items.map((item) => (
				<Link
					key={item.label}
					href={item.href}
					className="bg-bg-white-0 p-4 transition-colors hover:bg-bg-weak-50 dark:bg-[#0c0c0c] dark:hover:bg-white/[0.03]"
				>
					<p className="text-[11px] text-text-sub-600 uppercase tracking-wide">
						{item.label}
					</p>
					<p className="mt-1.5 font-semibold text-[24px] text-text-strong-950 tracking-tight">
						{item.value}
					</p>
					<div className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-text-sub-600">
						{item.delta}
						<span>vs previous {RANGE_LABEL[range]}</span>
						{item.hint ? <span>· {item.hint}</span> : null}
					</div>
				</Link>
			))}
		</div>
	);
}

export function EmailVolumeCard({
	data,
	range,
}: {
	data: OverviewAnalytics;
	range: AnalyticsRange;
}) {
	const hasEmail = data.totals.current.emails > 0;
	return (
		<SectionCard
			title="Email volume"
			description={`Daily outcomes across all organizations · last ${RANGE_LABEL[range]} (UTC)`}
			action={
				<ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-text-sub-600">
					{EMAIL_SERIES.map((series) => (
						<li key={series.key} className="inline-flex items-center gap-1.5">
							<span
								className="h-2 w-2 rounded-[2px]"
								style={{ background: series.color }}
							/>
							{series.label}
						</li>
					))}
				</ul>
			}
		>
			<div className="h-[280px] px-2 pt-4 pb-2">
				{hasEmail ? (
					<EmailVolumeChart data={data.daily} />
				) : (
					<div className="flex h-full items-center justify-center text-[13px] text-text-sub-600">
						No emails sent in this period.
					</div>
				)}
			</div>
		</SectionCard>
	);
}

export function GrowthTiles({
	data,
	range,
}: {
	data: OverviewAnalytics;
	range: AnalyticsRange;
}) {
	const { current, previous } = data.totals;
	const tiles = [
		{
			key: "users",
			label: "New users",
			unit: "users",
			href: "/users",
		},
		{
			key: "organizations",
			label: "New organizations",
			unit: "orgs",
			href: "/organizations",
		},
		{
			key: "domains",
			label: "Domains added",
			unit: "domains",
			href: "/domains",
		},
	] as const;

	return (
		<div className="grid gap-3 md:grid-cols-3">
			{tiles.map((tile) => (
				<Link
					key={tile.key}
					href={tile.href}
					className={cn(
						CARD,
						"group block p-4 transition-colors hover:border-stroke-soft-200 dark:hover:bg-white/[0.02]",
					)}
				>
					<div className="flex items-start justify-between gap-2">
						<div>
							<p className="text-[11px] text-text-sub-600 uppercase tracking-wide">
								{tile.label}
							</p>
							<p className="mt-1.5 font-semibold text-[24px] text-text-strong-950 tracking-tight">
								{formatNumber(current[tile.key])}
							</p>
						</div>
						<Delta
							current={current[tile.key]}
							previous={previous[tile.key]}
							kind="count"
							goodWhen="up"
						/>
					</div>
					<div className="mt-3 h-[56px]">
						<Sparkline
							unit={tile.unit}
							data={data.daily.map((d) => ({
								date: d.date,
								value: d[tile.key],
							}))}
						/>
					</div>
					<p className="mt-2 text-[11px] text-text-sub-600">
						{formatNumber(previous[tile.key])} in the previous{" "}
						{RANGE_LABEL[range]}
					</p>
				</Link>
			))}
		</div>
	);
}

const DOMAIN_STATUS_ROWS: Array<{
	status: DomainStatus;
	label: string;
	color: string;
}> = [
	{ status: "active", label: "Active", color: "var(--chart-delivered)" },
	{ status: "pending", label: "Pending", color: "var(--chart-other)" },
	{ status: "verifying", label: "Verifying", color: "var(--chart-axis)" },
	{ status: "failed", label: "Failed", color: "var(--chart-failed)" },
	{ status: "suspended", label: "Suspended", color: "var(--chart-bounced)" },
];

export function DomainStatusCard({ data }: { data: OverviewAnalytics }) {
	const total = Object.values(data.domainStatus).reduce((a, b) => a + b, 0);
	return (
		<SectionCard
			title="Domain health"
			description={`${formatNumber(total)} domains on the platform`}
			action={
				<Link
					href="/domains"
					className="text-[12px] text-text-sub-600 hover:text-text-strong-950"
				>
					All domains →
				</Link>
			}
		>
			<div className="space-y-4 p-4">
				<div
					className="flex h-2.5 w-full gap-[2px] overflow-hidden rounded-full bg-bg-weak-50 dark:bg-white/[0.04]"
					role="img"
					aria-label={DOMAIN_STATUS_ROWS.map(
						(row) => `${row.label}: ${data.domainStatus[row.status]}`,
					).join(", ")}
				>
					{total > 0
						? DOMAIN_STATUS_ROWS.filter(
								(row) => data.domainStatus[row.status] > 0,
							).map((row) => (
								<span
									key={row.status}
									className="h-full"
									style={{
										width: `${(data.domainStatus[row.status] / total) * 100}%`,
										background: row.color,
									}}
								/>
							))
						: null}
				</div>
				<ul className="space-y-0.5">
					{DOMAIN_STATUS_ROWS.map((row) => {
						const value = data.domainStatus[row.status];
						return (
							<li key={row.status}>
								<Link
									href={`/domains?status=${row.status}`}
									className="-mx-2 flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] transition-colors hover:bg-bg-weak-50 dark:hover:bg-white/[0.03]"
								>
									<span
										className="h-2 w-2 shrink-0 rounded-[2px]"
										style={{ background: row.color }}
									/>
									<span className="flex-1 text-text-sub-600">{row.label}</span>
									<span className="text-text-strong-950 tabular-nums">
										{formatNumber(value)}
									</span>
									<span className="w-10 text-right text-[12px] text-text-soft-400 tabular-nums">
										{total > 0 ? formatPercent(value / total) : "–"}
									</span>
								</Link>
							</li>
						);
					})}
				</ul>
			</div>
		</SectionCard>
	);
}

export function RecentDomainsCard({ data }: { data: OverviewAnalytics }) {
	return (
		<SectionCard
			title="Recently added domains"
			action={
				<Link
					href="/domains"
					className="text-[12px] text-text-sub-600 hover:text-text-strong-950"
				>
					View all →
				</Link>
			}
		>
			{data.recentDomains.length === 0 ? (
				<p className="px-4 py-8 text-center text-[13px] text-text-sub-600">
					No domains added yet.
				</p>
			) : (
				<ul className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/40">
					{data.recentDomains.map((d) => (
						<li
							key={d.id}
							className="flex items-center gap-3 px-4 py-2.5 text-[13px]"
						>
							<div className="min-w-0 flex-1">
								<Link
									href={`/domains?q=${encodeURIComponent(d.domain)}`}
									className="block truncate font-medium text-text-strong-950 hover:underline"
								>
									{d.domain}
								</Link>
								<Link
									href={`/organizations/${d.organizationId}`}
									className="block truncate text-[12px] text-text-sub-600 hover:underline"
								>
									{d.organizationName ?? d.organizationId}
								</Link>
							</div>
							<StatusPill status={d.status} />
							<span className="w-16 shrink-0 text-right text-[12px] text-text-sub-600">
								{formatRelativeTime(d.createdAt)}
							</span>
						</li>
					))}
				</ul>
			)}
		</SectionCard>
	);
}

export function TopSendersCard({
	data,
	range,
}: {
	data: OverviewAnalytics;
	range: AnalyticsRange;
}) {
	const max = Math.max(1, ...data.topOrganizations.map((o) => o.total));
	return (
		<SectionCard
			title="Top sending organizations"
			description={`By email volume · last ${RANGE_LABEL[range]}`}
		>
			{data.topOrganizations.length === 0 ? (
				<p className="px-4 py-8 text-center text-[13px] text-text-sub-600">
					No sending activity in this period.
				</p>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full min-w-[560px] text-left text-[13px]">
						<thead>
							<tr className="border-stroke-soft-100 border-b text-[11px] text-text-sub-600 uppercase tracking-wide dark:border-stroke-soft-100/40">
								<th className="px-4 py-2.5 font-medium">Organization</th>
								<th className="px-4 py-2.5 font-medium">Volume</th>
								<th className="px-4 py-2.5 text-right font-medium">Bounce</th>
								<th className="px-4 py-2.5 text-right font-medium">Failed</th>
							</tr>
						</thead>
						<tbody>
							{data.topOrganizations.map((org) => {
								const bounce = rate(org.bounced, org.total);
								const fail = rate(org.failed, org.total);
								return (
									<tr
										key={org.organizationId}
										className="border-stroke-soft-100 border-t dark:border-stroke-soft-100/40"
									>
										<td className="max-w-[220px] px-4 py-3">
											<Link
												href={`/organizations/${org.organizationId}`}
												className="block truncate font-medium text-text-strong-950 hover:underline"
											>
												{org.organizationName ?? org.organizationId}
											</Link>
										</td>
										<td className="px-4 py-3">
											<div className="flex items-center gap-3">
												<div className="h-1.5 w-full max-w-[160px] overflow-hidden rounded-full bg-bg-weak-50 dark:bg-white/[0.06]">
													<div
														className="h-full rounded-full"
														style={{
															width: `${(org.total / max) * 100}%`,
															background: "var(--chart-delivered)",
														}}
													/>
												</div>
												<span className="shrink-0 tabular-nums">
													{formatNumber(org.total)}
												</span>
											</div>
										</td>
										<td
											className={cn(
												"px-4 py-3 text-right tabular-nums",
												bounce >= 0.05
													? "text-orange-600 dark:text-orange-400"
													: "text-text-sub-600",
											)}
										>
											{formatPercent(bounce)}
										</td>
										<td
											className={cn(
												"px-4 py-3 text-right tabular-nums",
												fail >= 0.05 ? "text-error-base" : "text-text-sub-600",
											)}
										>
											{formatPercent(fail)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</SectionCard>
	);
}
