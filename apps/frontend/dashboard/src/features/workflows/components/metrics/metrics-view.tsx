"use client";

import { cn } from "@reloop/ui/cn";
import { motion } from "motion/react";
import { parseAsNumberLiteral, useQueryState } from "nuqs";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { CustomTooltip } from "#/features/metrics/components/custom-tooltip";
import { useAutomationMetrics } from "../../hooks/use-automation-runs";
import type {
	AutomationMetrics,
	EmailCounts,
} from "../../hooks/use-automations-api";
import type { Workflow } from "../../workflow-types";

const RANGES = [7, 30, 90] as const;
const rangeParser = parseAsNumberLiteral(RANGES).withDefault(30);

/**
 * Run status colors, bottom to top of each bar. Status hues are reserved for
 * state: green finished, red failed, ink for still running, gray cancelled.
 */
const SERIES = [
	{ key: "completed", label: "Completed", color: "#10B981" },
	{ key: "active", label: "Running", color: "var(--color-text-strong-950)" },
	{ key: "failed", label: "Failed", color: "#EF4444" },
	{ key: "cancelled", label: "Cancelled", color: "#A1A1AA" },
] as const;

const CARD =
	"rounded-2xl border border-stroke-soft-100 bg-bg-white-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.01]";

/**
 * Delivery funnel lines. Validated (CVD + normal vision, all pairs, light and
 * dark); Sent is ink, Bounced stays status red in the legend only.
 */
const DELIVERY = [
	{ key: "sent", label: "Sent", color: "var(--delivery-sent)" },
	{ key: "delivered", label: "Delivered", color: "var(--delivery-delivered)" },
	{ key: "opened", label: "Opened", color: "var(--delivery-opened)" },
	{ key: "clicked", label: "Clicked", color: "var(--delivery-clicked)" },
] as const;

const DELIVERY_COLORS =
	"[--delivery-sent:var(--color-text-strong-950)] [--delivery-delivered:#1baf7a] [--delivery-opened:#2a78d6] [--delivery-clicked:#eb6834] dark:[--delivery-delivered:#199e70] dark:[--delivery-opened:#3987e5] dark:[--delivery-clicked:#d95926]";

const DeliveryChart = ({
	daily,
	days,
}: {
	daily: AutomationMetrics["daily"];
	days: number;
}) => {
	const totals: EmailCounts = {
		sent: sum(daily, (day) => day.emails.sent),
		delivered: sum(daily, (day) => day.emails.delivered),
		opened: sum(daily, (day) => day.emails.opened),
		clicked: sum(daily, (day) => day.emails.clicked),
		bounced: sum(daily, (day) => day.emails.bounced),
	};
	const data = daily.map((day) => ({
		...day.emails,
		label: new Date(`${day.date}T00:00:00`).toLocaleDateString(undefined, {
			month: "short",
			day: "numeric",
		}),
	}));
	const rate = (n: number) =>
		totals.sent > 0 ? ` · ${Math.round((n / totals.sent) * 100)}%` : "";
	return (
		<section className={cn(CARD, DELIVERY_COLORS, "px-5 pt-4 pb-3")}>
			<h3 className="font-medium text-sm text-text-strong-950">
				Emails delivered, last {days} days
			</h3>
			{/* Legend doubles as the totals, so every line is labeled in text. */}
			<ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
				{DELIVERY.map((series) => (
					<li
						key={series.key}
						className="flex items-center gap-1.5 text-text-sub-600 text-xs"
					>
						<span
							aria-hidden
							className="h-0.5 w-3 rounded-full"
							style={{ backgroundColor: series.color }}
						/>
						{series.label}
						<span className="font-medium text-text-strong-950 tabular-nums">
							{totals[series.key].toLocaleString()}
							{series.key === "sent" ? "" : rate(totals[series.key])}
						</span>
					</li>
				))}
				<li className="flex items-center gap-1.5 text-text-sub-600 text-xs">
					Bounced
					<span className="font-medium text-text-strong-950 tabular-nums">
						{totals.bounced.toLocaleString()}
					</span>
				</li>
			</ul>
			<div className="mt-4 h-[180px] text-text-soft-400">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={data}>
						<CartesianGrid
							vertical={false}
							stroke="currentColor"
							strokeOpacity={0.15}
						/>
						<XAxis
							dataKey="label"
							tickLine={false}
							axisLine={false}
							tick={{ fontSize: 11, fill: "currentColor" }}
							interval="preserveStartEnd"
							minTickGap={24}
						/>
						<YAxis
							allowDecimals={false}
							tickLine={false}
							axisLine={false}
							width={32}
							tick={{ fontSize: 11, fill: "currentColor" }}
						/>
						<Tooltip
							cursor={{ stroke: "currentColor", strokeOpacity: 0.3 }}
							content={<CustomTooltip />}
						/>
						{DELIVERY.map((series) => (
							<Line
								key={series.key}
								type="monotone"
								dataKey={series.key}
								name={series.label}
								stroke={series.color}
								strokeWidth={2}
								dot={false}
								activeDot={{
									r: 4,
									strokeWidth: 2,
									stroke: "var(--color-bg-white-0)",
								}}
								isAnimationActive={false}
							/>
						))}
					</LineChart>
				</ResponsiveContainer>
			</div>
		</section>
	);
};

const RangeTabs = ({
	value,
	onChange,
}: {
	value: number;
	onChange: (value: (typeof RANGES)[number]) => void;
}) => (
	<div className="flex items-center gap-0.5">
		{RANGES.map((days) => (
			<button
				key={days}
				type="button"
				onClick={() => onChange(days)}
				className={cn(
					"relative rounded-lg px-2.5 py-1 font-medium text-xs transition-colors",
					value === days
						? "text-text-strong-950"
						: "text-text-sub-600 hover:text-text-strong-950",
				)}
			>
				{value === days ? (
					<motion.span
						layoutId="metrics-range-pill"
						className="absolute inset-0 rounded-lg bg-neutral-alpha-10"
						transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
					/>
				) : null}
				<span className="relative">{days} days</span>
			</button>
		))}
	</div>
);

const sum = <T,>(items: T[], pick: (item: T) => number) =>
	items.reduce((total, item) => total + pick(item), 0);

const RunsChart = ({
	daily,
	days,
}: {
	daily: AutomationMetrics["daily"];
	days: number;
}) => {
	const data = daily.map((day) => ({
		...day,
		label: new Date(`${day.date}T00:00:00`).toLocaleDateString(undefined, {
			month: "short",
			day: "numeric",
		}),
	}));
	return (
		<section className={cn(CARD, "px-5 pt-4 pb-3")}>
			<div className="flex items-baseline justify-between gap-3">
				<h3 className="font-medium text-sm text-text-strong-950">
					Runs started, last {days} days
				</h3>
				<span className="font-medium text-sm text-text-strong-950 tabular-nums">
					{sum(daily, (day) => day.total).toLocaleString()}
				</span>
			</div>
			{/* Legend doubles as the counts for the range. */}
			<ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
				{SERIES.map((series) => (
					<li
						key={series.key}
						className="flex items-center gap-1.5 text-text-sub-600 text-xs"
					>
						<span
							aria-hidden
							className="size-2 rounded-full"
							style={{ backgroundColor: series.color }}
						/>
						{series.label}
						<span className="font-medium text-text-strong-950 tabular-nums">
							{sum(daily, (day) => day[series.key]).toLocaleString()}
						</span>
					</li>
				))}
			</ul>
			<div className="mt-4 h-[180px] text-text-soft-400">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart data={data} barCategoryGap="28%">
						<CartesianGrid
							vertical={false}
							stroke="currentColor"
							strokeOpacity={0.15}
						/>
						<XAxis
							dataKey="label"
							tickLine={false}
							axisLine={false}
							tick={{ fontSize: 11, fill: "currentColor" }}
							interval="preserveStartEnd"
							minTickGap={24}
						/>
						<YAxis
							allowDecimals={false}
							tickLine={false}
							axisLine={false}
							width={32}
							tick={{ fontSize: 11, fill: "currentColor" }}
						/>
						<Tooltip
							cursor={{ fill: "currentColor", fillOpacity: 0.06 }}
							content={<CustomTooltip />}
						/>
						{SERIES.map((series, index) => (
							<Bar
								key={series.key}
								dataKey={series.key}
								name={series.label}
								stackId="runs"
								fill={series.color}
								// A 2px surface gap between stacked segments.
								stroke="var(--color-bg-white-0)"
								strokeWidth={2}
								radius={index === SERIES.length - 1 ? [4, 4, 0, 0] : 0}
								isAnimationActive={false}
							/>
						))}
					</BarChart>
				</ResponsiveContainer>
			</div>
		</section>
	);
};

const MetricsSkeleton = () => (
	<div className="flex flex-col gap-3">
		<div className={cn(CARD, "h-[268px] animate-pulse")} />
		<div className={cn(CARD, "h-[268px] animate-pulse")} />
	</div>
);

/** Metrics beside the editor: totals, email rates and runs per day. */
export function MetricsPanel({ workflow }: { workflow: Workflow }) {
	const [days, setDays] = useQueryState("days", rangeParser);
	const query = useAutomationMetrics(workflow.id, days);
	const metrics = query.data;
	return (
		<div className="min-h-0 flex-1 overflow-y-auto">
			<div className="flex flex-col gap-3 p-3">
				<div className="flex items-center justify-between gap-3">
					<h2 className="font-medium text-sm text-text-strong-950">Metrics</h2>
					<RangeTabs
						value={days}
						onChange={(value) => void setDays(value === 30 ? null : value)}
					/>
				</div>
				{query.isError ? (
					<p className="text-text-sub-600 text-xs">
						Couldn’t load metrics. {query.error.message}
					</p>
				) : !metrics ? (
					<MetricsSkeleton />
				) : (
					<>
						<RunsChart daily={metrics.daily} days={days} />
						<DeliveryChart daily={metrics.daily} days={days} />
					</>
				)}
			</div>
		</div>
	);
}
