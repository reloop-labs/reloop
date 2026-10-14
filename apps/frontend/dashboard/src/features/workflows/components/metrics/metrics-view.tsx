"use client";

import { cn } from "@reloop/ui/cn";
import { motion } from "motion/react";
import { parseAsNumberLiteral, useQueryState } from "nuqs";
import type { ReactNode } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { CustomTooltip } from "#/features/metrics/components/custom-tooltip";
import { useAutomationMetrics } from "../../hooks/use-automation-runs";
import type { AutomationMetrics } from "../../hooks/use-automations-api";
import { formatDuration } from "../../run-format";
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

const percent = (part: number, whole: number) =>
	whole > 0 ? `${Math.round((part / whole) * 100)}%` : "—";

const Tile = ({
	label,
	value,
	detail,
}: {
	label: string;
	value: ReactNode;
	detail?: ReactNode;
}) => (
	<section className={cn(CARD, "flex flex-col px-5 py-4")}>
		<h3 className="font-medium text-[11px] text-text-soft-400 uppercase tracking-[0.08em]">
			{label}
		</h3>
		<p className="mt-2 font-semibold text-[26px] text-text-strong-950 tabular-nums tracking-tight">
			{value}
		</p>
		<p className="mt-0.5 min-h-4 text-text-sub-600 text-xs">{detail}</p>
	</section>
);

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
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h3 className="font-medium text-sm text-text-strong-950">
					Runs started, last {days} days
				</h3>
				<ul className="flex flex-wrap items-center gap-4">
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
						</li>
					))}
				</ul>
			</div>
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
		<div className="grid grid-cols-2 gap-3">
			{Array.from({ length: 8 }, (_, i) => (
				<div key={i} className={cn(CARD, "h-[98px] animate-pulse")} />
			))}
		</div>
		<div className={cn(CARD, "h-[240px] animate-pulse")} />
	</div>
);

/** Metrics beside the editor: totals, email rates and runs per day. */
export function MetricsPanel({ workflow }: { workflow: Workflow }) {
	const [days, setDays] = useQueryState("days", rangeParser);
	const query = useAutomationMetrics(workflow.id, days);
	const metrics = query.data;
	return (
		<aside className="flex w-[480px] shrink-0 flex-col overflow-y-auto border-stroke-soft-200 border-r bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-black">
			<div className="flex flex-col gap-3 p-3">
				<div className="flex items-center justify-between gap-3">
					<p className="text-text-sub-600 text-xs">Totals cover every run.</p>
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
						<div className="grid grid-cols-2 gap-3">
							<Tile
								label="Runs"
								value={metrics.runs.total.toLocaleString()}
								detail={`${metrics.runs.active.toLocaleString()} running now`}
							/>
							<Tile
								label="Completed"
								value={metrics.runs.completed.toLocaleString()}
								detail={`${percent(metrics.runs.completed, metrics.runs.total)} of runs`}
							/>
							<Tile
								label="Failed or cancelled"
								value={(
									metrics.runs.failed + metrics.runs.cancelled
								).toLocaleString()}
								detail={`${metrics.runs.failed.toLocaleString()} failed · ${metrics.runs.cancelled.toLocaleString()} cancelled`}
							/>
							<Tile
								label="Time to complete"
								value={
									metrics.runs.averageDurationMs === null
										? "—"
										: formatDuration(metrics.runs.averageDurationMs)
								}
								detail="Average for completed runs"
							/>
							<Tile
								label="Emails sent"
								value={metrics.emails.sent.toLocaleString()}
								detail={`${metrics.emails.bounced.toLocaleString()} bounced`}
							/>
							<Tile
								label="Delivered"
								value={percent(metrics.emails.delivered, metrics.emails.sent)}
								detail={`${metrics.emails.delivered.toLocaleString()} emails`}
							/>
							<Tile
								label="Opened"
								value={percent(metrics.emails.opened, metrics.emails.sent)}
								detail={`${metrics.emails.opened.toLocaleString()} emails`}
							/>
							<Tile
								label="Clicked"
								value={percent(metrics.emails.clicked, metrics.emails.sent)}
								detail={`${metrics.emails.clicked.toLocaleString()} emails`}
							/>
						</div>
						<RunsChart daily={metrics.daily} days={days} />
					</>
				)}
			</div>
		</aside>
	);
}
