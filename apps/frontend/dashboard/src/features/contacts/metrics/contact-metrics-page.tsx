"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as SegmentedControl from "@reloop/ui/segmented-control";
import { Skeleton } from "@reloop/ui/skeleton";
import {
	parseAsArrayOf,
	parseAsNumberLiteral,
	parseAsStringLiteral,
	useQueryState,
} from "nuqs";
import { useMemo, useState } from "react";
import { dataTableToolbarControlClassName } from "#/components/data-table/toolbar-control";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/features/api-keys/filters/base-ui-select";
import { useSubscriptionActivityQuery } from "#/features/contacts/hooks/use-contacts-query";
import { AnimatedBackButton } from "#/features/dashboard/animated-back-button";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import {
	average,
	buildPoints,
	type ChartType,
	detectSpikes,
	type Granularity,
	type MetricsView,
	percentChange,
	RANGE_OPTIONS,
	type RangeDays,
	type Series,
	type SpikeSensitivity,
	sum,
	toCumulative,
} from "./contact-metrics";
import {
	ContactMetricsChart,
	SERIES_META,
	SPIKE_COLOR,
} from "./contact-metrics-chart";

const ALL_SERIES = ["subscribed", "unsubscribed", "net"] as const;
const SENSITIVITY_OPTIONS: { id: SpikeSensitivity; label: string }[] = [
	{ id: "off", label: "Spikes off" },
	{ id: "low", label: "Big spikes only" },
	{ id: "medium", label: "Normal spikes" },
	{ id: "high", label: "All spikes" },
];

export function ContactMetricsPage() {
	const { activeOrganization } = useActiveOrganization();

	const [range, setRange] = useQueryState(
		"range",
		parseAsNumberLiteral(RANGE_OPTIONS).withDefault(30),
	);
	const [granularity, setGranularity] = useQueryState(
		"group",
		parseAsStringLiteral(["day", "week"] as const).withDefault("day"),
	);
	const [view, setView] = useQueryState(
		"view",
		parseAsStringLiteral(["period", "cumulative"] as const).withDefault(
			"period",
		),
	);
	const [chartType, setChartType] = useQueryState(
		"chart",
		parseAsStringLiteral(["area", "bar"] as const).withDefault("area"),
	);
	const [series, setSeries] = useQueryState(
		"series",
		parseAsArrayOf(parseAsStringLiteral(ALL_SERIES)).withDefault([
			"subscribed",
			"unsubscribed",
		]),
	);
	const [sensitivity, setSensitivity] = useQueryState(
		"spikes",
		parseAsStringLiteral(["off", "low", "medium", "high"] as const).withDefault(
			"medium",
		),
	);
	const [showAverage, setShowAverage] = useState(true);
	const [highlightKey, setHighlightKey] = useState<string | null>(null);

	// Fetch twice the range: the older half is the comparison period.
	const { data, isPending, isFetching, refetch } = useSubscriptionActivityQuery(
		range * 2,
		!!activeOrganization?.id,
	);

	const metrics = useMemo(() => {
		if (!data?.dates?.length) return null;
		const split = Math.max(0, data.dates.length - range);
		const dates = data.dates.slice(split);
		const sub = data.subscribed.slice(split);
		const unsub = data.unsubscribed.slice(split);
		const prevSub = sum(data.subscribed.slice(0, split));
		const prevUnsub = sum(data.unsubscribed.slice(0, split));

		const points = buildPoints(dates, sub, unsub, granularity);
		const totalSub = sum(sub);
		const totalUnsub = sum(unsub);
		const peak = points.reduce<(typeof points)[number] | null>(
			(best, p) => (!best || p.subscribed > best.subscribed ? p : best),
			null,
		);

		return {
			points,
			spikes: detectSpikes(points, sensitivity),
			peak: peak && peak.subscribed > 0 ? peak : null,
			averages: {
				subscribed: average(points.map((p) => p.subscribed)),
				unsubscribed: average(points.map((p) => p.unsubscribed)),
				net: average(points.map((p) => p.net)),
			} satisfies Record<Series, number>,
			cards: {
				subscribed: {
					value: totalSub,
					change: percentChange(totalSub, prevSub),
				},
				unsubscribed: {
					value: totalUnsub,
					change: percentChange(totalUnsub, prevUnsub),
				},
				net: {
					value: totalSub - totalUnsub,
					change: percentChange(totalSub - totalUnsub, prevSub - prevUnsub),
				},
				rate: {
					value: totalSub > 0 ? (totalUnsub / totalSub) * 100 : null,
				},
			},
		};
	}, [data, range, granularity, sensitivity]);

	const chartData = useMemo(() => {
		if (!metrics) return [];
		return view === "cumulative"
			? toCumulative(metrics.points)
			: metrics.points;
	}, [metrics, view]);

	const visibleSeries = ALL_SERIES.filter((s) => series.includes(s));
	const unit = granularity === "week" ? "week" : "day";
	const averageLines =
		metrics && showAverage && view === "period"
			? Object.fromEntries(visibleSeries.map((s) => [s, metrics.averages[s]]))
			: {};

	const toggleSeries = (s: Series) => {
		const next = series.includes(s)
			? series.filter((x) => x !== s)
			: [...series, s];
		// Keep at least one line on the chart
		if (next.length > 0) void setSeries(next);
	};

	return (
		<div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
			<div className="pb-8 max-md:hidden">
				<AnimatedBackButton fallbackHref="/contacts" />
			</div>

			<div className="flex flex-col gap-1 pb-6">
				<div className="flex items-center gap-2.5">
					<Icon
						name="activity"
						className="h-6 w-6 shrink-0 text-text-strong-950"
					/>
					<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						Audience metrics
					</h1>
				</div>
				<p className="text-sm text-text-sub-600">
					How your audience grows, when people leave, and which days stand out.
				</p>
			</div>

			{/* Toolbar */}
			<div className="flex flex-wrap items-center gap-2">
				<Select
					value={String(range)}
					onValueChange={(val) => {
						const next = Number(val) as RangeDays;
						if (RANGE_OPTIONS.includes(next)) {
							void setRange(next);
							setHighlightKey(null);
						}
					}}
				>
					<SelectTrigger className="w-40">
						<SelectValue>
							<Icon
								name="calendar"
								className="h-4 w-4 shrink-0 text-text-sub-600"
							/>
							<span className="min-w-0 truncate">Last {range} days</span>
						</SelectValue>
					</SelectTrigger>
					<SelectContent className="w-40">
						{RANGE_OPTIONS.map((d) => (
							<SelectItem key={d} value={String(d)}>
								Last {d} days
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Toggle
					value={granularity}
					onChange={(v) => {
						void setGranularity(v as Granularity);
						setHighlightKey(null);
					}}
					options={[
						{ id: "day", label: "Daily" },
						{ id: "week", label: "Weekly" },
					]}
				/>
				<Toggle
					value={view}
					onChange={(v) => void setView(v as MetricsView)}
					options={[
						{ id: "period", label: `Per ${unit}` },
						{ id: "cumulative", label: "Cumulative" },
					]}
				/>
				<Toggle
					value={chartType}
					onChange={(v) => void setChartType(v as ChartType)}
					options={[
						{ id: "area", label: "Area" },
						{ id: "bar", label: "Bars" },
					]}
				/>

				<button
					type="button"
					onClick={() => void refetch()}
					disabled={isFetching}
					className={cn(
						dataTableToolbarControlClassName,
						"ml-auto w-9 justify-center px-0",
						isFetching ? "pointer-events-none" : "cursor-pointer",
					)}
					aria-label="Refresh metrics"
					aria-busy={isFetching}
				>
					<Icon
						name="rotate-cw"
						className={cn("h-3.5 w-3.5", isFetching && "animate-spin")}
					/>
				</button>
			</div>

			{/* Summary */}
			<div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
				<SummaryCard
					label="New subscribers"
					value={metrics?.cards.subscribed.value}
					change={metrics?.cards.subscribed.change}
					isLoading={isPending}
				/>
				<SummaryCard
					label="Unsubscribes"
					value={metrics?.cards.unsubscribed.value}
					change={metrics?.cards.unsubscribed.change}
					lowerIsBetter
					isLoading={isPending}
				/>
				<SummaryCard
					label="Net growth"
					value={metrics?.cards.net.value}
					change={metrics?.cards.net.change}
					signed
					isLoading={isPending}
				/>
				<SummaryCard
					label="Unsubscribe rate"
					value={
						metrics?.cards.rate.value == null
							? undefined
							: `${metrics.cards.rate.value.toFixed(1)}%`
					}
					hint="Unsubscribes per new subscriber"
					isLoading={isPending}
				/>
			</div>

			{/* Chart */}
			<div className="mt-4 rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-4 dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5">
				<div className="flex flex-wrap items-center gap-2">
					{ALL_SERIES.map((s) => {
						const active = series.includes(s);
						return (
							<button
								key={s}
								type="button"
								onClick={() => toggleSeries(s)}
								aria-pressed={active}
								className={cn(
									dataTableToolbarControlClassName,
									"h-8 cursor-pointer gap-2 px-2.5",
									active
										? "text-text-strong-950"
										: "border-dashed opacity-60 hover:opacity-100",
								)}
							>
								<span
									className={cn(
										"h-2 w-2 shrink-0 rounded-full",
										SERIES_META[s].dotClassName,
									)}
								/>
								{SERIES_META[s].label}
							</button>
						);
					})}

					<div className="flex items-center gap-2 max-sm:w-full sm:ml-auto">
						{view === "period" ? (
							<button
								type="button"
								onClick={() => setShowAverage((v) => !v)}
								aria-pressed={showAverage}
								className={cn(
									dataTableToolbarControlClassName,
									"h-8 cursor-pointer gap-2 px-2.5",
									showAverage
										? "text-text-strong-950"
										: "border-dashed opacity-60 hover:opacity-100",
								)}
							>
								<span className="w-3 shrink-0 border-current border-t border-dashed" />
								Average
							</button>
						) : null}
						<Select
							value={sensitivity}
							onValueChange={(val) => {
								if (val) void setSensitivity(val as SpikeSensitivity);
								setHighlightKey(null);
							}}
						>
							<SelectTrigger className="h-8 w-40">
								<SelectValue>
									<Icon
										name="zap"
										className="h-3.5 w-3.5 shrink-0"
										style={{
											color: sensitivity === "off" ? undefined : SPIKE_COLOR,
										}}
									/>
									<span className="min-w-0 truncate">
										{
											SENSITIVITY_OPTIONS.find((o) => o.id === sensitivity)
												?.label
										}
									</span>
								</SelectValue>
							</SelectTrigger>
							<SelectContent className="w-40">
								{SENSITIVITY_OPTIONS.map((o) => (
									<SelectItem key={o.id} value={o.id}>
										{o.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="mt-4 h-[280px] w-full sm:h-[320px]">
					{isPending ? (
						<Skeleton className="h-full w-full rounded-xl" />
					) : metrics ? (
						<ContactMetricsChart
							data={chartData}
							series={visibleSeries}
							chartType={chartType}
							spikes={metrics.spikes}
							averages={averageLines}
							highlightKey={highlightKey}
						/>
					) : (
						<div className="flex h-full items-center justify-center text-sm text-text-sub-600">
							No activity to show yet.
						</div>
					)}
				</div>
			</div>

			<div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
				{/* Spikes */}
				<div className="rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-4 dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5">
					<div className="flex items-center justify-between gap-3">
						<p className="font-medium text-sm text-text-strong-950">Spikes</p>
						{metrics?.peak ? (
							<p className="truncate text-text-sub-600 text-xs">
								Best {unit}: {metrics.peak.label} ·{" "}
								{metrics.peak.subscribed.toLocaleString()} new
							</p>
						) : null}
					</div>
					<div className="mt-3 flex flex-col gap-1">
						{isPending ? (
							<>
								<Skeleton className="h-11 w-full rounded-xl" />
								<Skeleton className="h-11 w-full rounded-xl" />
							</>
						) : sensitivity === "off" ? (
							<p className="py-6 text-center text-sm text-text-sub-600">
								Spike detection is off.
							</p>
						) : !metrics?.spikes.length ? (
							<p className="py-6 text-center text-sm text-text-sub-600">
								No unusual {unit}s in this range.
							</p>
						) : (
							metrics.spikes.map((s) => {
								const active = highlightKey === s.key;
								return (
									<button
										key={`${s.series}-${s.key}`}
										type="button"
										onClick={() => setHighlightKey(active ? null : s.key)}
										aria-pressed={active}
										className={cn(
											"flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-bg-weak-50",
											active && "bg-bg-weak-50",
										)}
									>
										<span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
											<Icon
												name="zap"
												className="h-3.5 w-3.5"
												style={{ color: SPIKE_COLOR }}
											/>
										</span>
										<span className="min-w-0 flex-1">
											<span className="block truncate font-medium text-sm text-text-strong-950">
												{s.value.toLocaleString()}{" "}
												{SERIES_META[s.series].label.toLowerCase()}
											</span>
											<span className="block truncate text-text-sub-600 text-xs">
												{s.fullLabel}
											</span>
										</span>
										<span className="shrink-0 text-text-sub-600 text-xs tabular-nums">
											{s.ratio
												? `${s.ratio.toFixed(1)}× avg`
												: `avg ${s.average.toFixed(1)}`}
										</span>
									</button>
								);
							})
						)}
					</div>
				</div>

				{/* Breakdown */}
				<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5">
					<p className="p-4 pb-3 font-medium text-sm text-text-strong-950">
						{granularity === "week" ? "Weekly" : "Daily"} breakdown
					</p>
					<div className="max-h-[360px] overflow-auto">
						<table className="w-full min-w-[360px] text-sm">
							<thead className="sticky top-0 bg-bg-white-0 text-left text-text-sub-600 text-xs dark:bg-bg-weak-50">
								<tr>
									<th className="px-4 py-2 font-medium">Date</th>
									<th className="px-4 py-2 text-right font-medium">
										Subscribed
									</th>
									<th className="px-4 py-2 text-right font-medium">
										Unsubscribed
									</th>
									<th className="px-4 py-2 text-right font-medium">Net</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/50">
								{isPending
									? Array.from({ length: 5 }).map((_, i) => (
											<tr key={i}>
												<td className="px-4 py-2.5" colSpan={4}>
													<Skeleton className="h-4 w-full rounded-md" />
												</td>
											</tr>
										))
									: [...(metrics?.points ?? [])].reverse().map((p) => {
											const isSpike = metrics?.spikes.some(
												(s) => s.key === p.key,
											);
											return (
												<tr
													key={p.key}
													onClick={() =>
														setHighlightKey(
															highlightKey === p.key ? null : p.key,
														)
													}
													className={cn(
														"cursor-pointer hover:bg-bg-weak-50",
														highlightKey === p.key && "bg-bg-weak-50",
													)}
												>
													<td className="whitespace-nowrap px-4 py-2.5 text-text-strong-950">
														<span className="flex items-center gap-1.5">
															{p.fullLabel}
															{isSpike ? (
																<Icon
																	name="zap"
																	className="h-3 w-3 shrink-0"
																	style={{ color: SPIKE_COLOR }}
																	aria-label="Spike"
																/>
															) : null}
														</span>
													</td>
													<td className="px-4 py-2.5 text-right text-text-strong-950 tabular-nums">
														{p.subscribed.toLocaleString()}
													</td>
													<td className="px-4 py-2.5 text-right text-text-sub-600 tabular-nums">
														{p.unsubscribed.toLocaleString()}
													</td>
													<td
														className={cn(
															"px-4 py-2.5 text-right tabular-nums",
															p.net > 0
																? "text-success-base"
																: p.net < 0
																	? "text-error-base"
																	: "text-text-sub-600",
														)}
													>
														{p.net > 0 ? "+" : ""}
														{p.net.toLocaleString()}
													</td>
												</tr>
											);
										})}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			<p className="mt-4 pb-8 text-text-soft-400 text-xs">
				Days are in UTC. Unsubscribes are counted on the day a contact&apos;s
				status last changed.
			</p>
		</div>
	);
}

function Toggle({
	value,
	onChange,
	options,
}: {
	value: string;
	onChange: (value: string) => void;
	options: { id: string; label: string }[];
}) {
	return (
		<SegmentedControl.Root value={value} onValueChange={onChange}>
			<SegmentedControl.List className="h-9 w-auto rounded-xl">
				{options.map((o) => (
					<SegmentedControl.Trigger
						key={o.id}
						value={o.id}
						className="cursor-pointer px-2.5 text-xs"
					>
						{o.label}
					</SegmentedControl.Trigger>
				))}
			</SegmentedControl.List>
		</SegmentedControl.Root>
	);
}

function SummaryCard({
	label,
	value,
	change,
	hint,
	lowerIsBetter,
	signed,
	isLoading,
}: {
	label: string;
	value: number | string | undefined;
	change?: number | null;
	hint?: string;
	lowerIsBetter?: boolean;
	signed?: boolean;
	isLoading: boolean;
}) {
	const display =
		typeof value === "number"
			? `${signed && value > 0 ? "+" : ""}${value.toLocaleString()}`
			: (value ?? "–");
	const good =
		change == null || change === 0
			? null
			: lowerIsBetter
				? change < 0
				: change > 0;

	return (
		<div className="min-w-0 rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-4 dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5">
			<p className="truncate font-medium text-[11px] text-text-sub-600 uppercase tracking-wider">
				{label}
			</p>
			{isLoading ? (
				<Skeleton className="mt-2 h-7 w-16 rounded-lg" />
			) : (
				<p className="mt-1 truncate font-semibold text-2xl text-text-strong-950 tabular-nums tracking-tight">
					{display}
				</p>
			)}
			<p className="mt-1 truncate text-text-sub-600 text-xs">
				{isLoading ? (
					" "
				) : hint ? (
					hint
				) : change === undefined ? (
					" "
				) : change === null ? (
					"No data in previous period"
				) : (
					<>
						<span
							className={cn(
								good === null
									? "text-text-sub-600"
									: good
										? "text-success-base"
										: "text-error-base",
							)}
						>
							{change > 0 ? "▲" : change < 0 ? "▼" : ""}{" "}
							{Math.abs(change).toFixed(0)}%
						</span>{" "}
						vs previous period
					</>
				)}
			</p>
		</div>
	);
}
