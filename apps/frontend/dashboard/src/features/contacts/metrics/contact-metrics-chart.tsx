"use client";

import {
	Area,
	Bar,
	CartesianGrid,
	ComposedChart,
	ReferenceDot,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { ChartType, MetricsPoint, Series, Spike } from "./contact-metrics";

export const SERIES_META: Record<
	Series,
	{ label: string; color: string; dotClassName: string }
> = {
	// Same colors as the sparkline on the contacts page
	subscribed: {
		label: "Subscribed",
		color: "#10B981",
		dotClassName: "bg-emerald-500",
	},
	unsubscribed: {
		label: "Unsubscribed",
		color: "#EF4444",
		dotClassName: "bg-red-500",
	},
	net: {
		label: "Net growth",
		color: "#6366F1",
		dotClassName: "bg-indigo-500",
	},
};

export const SPIKE_COLOR = "#F59E0B";

const tick = { fill: "#888888", opacity: 0.8, fontSize: 10 };

type TooltipEntry = { dataKey?: string; value?: number };

function MetricsTooltip({
	active,
	payload,
	spikes,
}: {
	active?: boolean;
	payload?: TooltipEntry[];
	spikes: Spike[];
}) {
	const point = (payload?.[0] as { payload?: MetricsPoint } | undefined)
		?.payload;
	if (!active || !payload?.length || !point) return null;
	const pointSpikes = spikes.filter((s) => s.key === point.key);

	return (
		<div className="flex min-w-[190px] flex-col gap-3 rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-4 pt-3 pb-4 shadow-lg dark:border-stroke-soft-100/50 dark:bg-bg-weak-50">
			<span className="border-stroke-soft-100 border-b pb-2 font-semibold text-[11px] text-text-sub-600 uppercase tracking-wider dark:border-stroke-soft-100/30">
				{point.fullLabel}
			</span>
			<div className="flex flex-col gap-2">
				{payload.map((entry) => {
					const series = entry.dataKey as Series;
					const meta = SERIES_META[series];
					if (!meta) return null;
					return (
						<div
							key={series}
							className="flex items-center justify-between gap-4"
						>
							<div className="flex items-center gap-2">
								<span
									className={`h-2 w-2 shrink-0 rounded-full ${meta.dotClassName}`}
								/>
								<span className="text-text-sub-600 text-xs">{meta.label}</span>
							</div>
							<span className="font-semibold text-text-strong-950 text-xs tabular-nums">
								{(entry.value ?? 0).toLocaleString()}
							</span>
						</div>
					);
				})}
			</div>
			{pointSpikes.map((s) => (
				<div
					key={s.series}
					className="rounded-lg bg-amber-500/10 px-2 py-1.5 font-medium text-[11px] text-amber-600 dark:text-amber-400"
				>
					Spike in {SERIES_META[s.series].label.toLowerCase()}
					{s.ratio ? ` · ${s.ratio.toFixed(1)}× average` : ""}
				</div>
			))}
		</div>
	);
}

export function ContactMetricsChart({
	data,
	series,
	chartType,
	spikes,
	averages,
	highlightKey,
}: {
	data: MetricsPoint[];
	series: Series[];
	chartType: ChartType;
	spikes: Spike[];
	/** Per-series average lines; omitted in cumulative view. */
	averages: Partial<Record<Series, number>>;
	highlightKey: string | null;
}) {
	const visibleSpikes = spikes.filter((s) => series.includes(s.series));
	const highlight = data.find((p) => p.key === highlightKey);

	return (
		<ResponsiveContainer
			width="100%"
			height="100%"
			className="text-text-strong-950"
		>
			<ComposedChart
				data={data}
				margin={{ top: 12, right: 4, left: 4, bottom: 4 }}
				barGap={2}
			>
				<defs>
					{series.map((s) => (
						<linearGradient
							key={s}
							id={`contact-metrics-${s}`}
							x1="0"
							y1="0"
							x2="0"
							y2="1"
						>
							<stop
								offset="5%"
								stopColor={SERIES_META[s].color}
								stopOpacity={0.22}
							/>
							<stop
								offset="95%"
								stopColor={SERIES_META[s].color}
								stopOpacity={0}
							/>
						</linearGradient>
					))}
				</defs>
				<CartesianGrid
					strokeDasharray="3 3"
					stroke="currentColor"
					strokeOpacity={0.06}
					vertical={false}
				/>
				<XAxis
					dataKey="key"
					tickFormatter={(key: string) =>
						data.find((p) => p.key === key)?.label ?? key
					}
					axisLine={false}
					tickLine={false}
					tick={tick}
					minTickGap={24}
					dy={8}
				/>
				<YAxis
					orientation="right"
					axisLine={false}
					tickLine={false}
					tick={tick}
					width={36}
					allowDecimals={false}
				/>
				<Tooltip
					cursor={{ stroke: "currentColor", strokeOpacity: 0.1 }}
					content={<MetricsTooltip spikes={visibleSpikes} />}
				/>

				{highlight ? (
					<ReferenceLine
						x={highlight.key}
						stroke={SPIKE_COLOR}
						strokeOpacity={0.6}
						strokeDasharray="4 4"
					/>
				) : null}

				{series.map((s) =>
					averages[s] !== undefined ? (
						<ReferenceLine
							key={`avg-${s}`}
							y={averages[s]}
							stroke={SERIES_META[s].color}
							strokeOpacity={0.5}
							strokeDasharray="6 4"
						/>
					) : null,
				)}

				{series.map((s) =>
					chartType === "bar" ? (
						<Bar
							key={s}
							dataKey={s}
							name={SERIES_META[s].label}
							fill={SERIES_META[s].color}
							fillOpacity={0.9}
							radius={[4, 4, 0, 0]}
							maxBarSize={28}
							isAnimationActive={false}
						/>
					) : (
						<Area
							key={s}
							type="monotone"
							dataKey={s}
							name={SERIES_META[s].label}
							stroke={SERIES_META[s].color}
							strokeWidth={2}
							fill={`url(#contact-metrics-${s})`}
							fillOpacity={1}
							activeDot={{ r: 4 }}
							isAnimationActive={false}
						/>
					),
				)}

				{visibleSpikes.map((s) => {
					const point = data.find((p) => p.key === s.key);
					if (!point) return null;
					return (
						<ReferenceDot
							key={`spike-${s.series}-${s.key}`}
							x={s.key}
							y={point[s.series]}
							r={s.key === highlightKey ? 7 : 5}
							fill={SPIKE_COLOR}
							stroke="var(--color-bg-white-0, #fff)"
							strokeWidth={2}
						/>
					);
				})}
			</ComposedChart>
		</ResponsiveContainer>
	);
}
