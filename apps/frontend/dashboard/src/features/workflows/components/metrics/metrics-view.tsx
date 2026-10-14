"use client";

import { cn } from "@reloop/ui/cn";
import { motion } from "motion/react";
import { parseAsNumberLiteral, useQueryState } from "nuqs";
import { type ReactNode, useMemo } from "react";
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
import { useTemplatesQuery } from "#/features/templates/hooks/use-templates-query";
import { formatDelayAmount } from "../../delay-format";
import { useAutomationMetrics } from "../../hooks/use-automation-runs";
import type {
	AutomationMetrics,
	EmailCounts,
} from "../../hooks/use-automations-api";
import { nodeTone } from "../../node-tone";
import { formatDuration } from "../../run-format";
import {
	type ConditionNodeData,
	type DelayNodeData,
	type SendEmailNodeData,
	TRIGGER_NODE_ID,
	type Workflow,
	type WorkflowNode,
} from "../../workflow-types";
import { describeCondition } from "../nodes/condition-node";
import { StepIcon } from "../step-icon";

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

const RunsChart = ({ daily }: { daily: AutomationMetrics["daily"] }) => {
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
					Runs started per day
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
			<div className="mt-4 h-[220px] text-text-soft-400">
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

/** Steps in the order a contact meets them (Yes path before No). */
function stepsInFlowOrder(workflow: Workflow): WorkflowNode[] {
	const byId = new Map(workflow.nodes.map((n) => [n.id, n]));
	const ordered: WorkflowNode[] = [];
	const seen = new Set<string>();
	const visit = (id: string) => {
		if (seen.has(id)) return;
		seen.add(id);
		const node = byId.get(id);
		if (!node) return;
		if (node.id !== TRIGGER_NODE_ID) ordered.push(node);
		const out = workflow.edges
			.filter((e) => e.source === id)
			.sort(
				(a, b) =>
					(a.sourceHandle === "no" ? 1 : 0) - (b.sourceHandle === "no" ? 1 : 0),
			);
		for (const edge of out) visit(edge.target);
	};
	visit(TRIGGER_NODE_ID);
	return ordered;
}

const toneOf = (type: string) =>
	nodeTone[type as keyof typeof nodeTone] ?? nodeTone.send_email;

const EMPTY_EMAILS: EmailCounts = {
	sent: 0,
	delivered: 0,
	opened: 0,
	clicked: 0,
	bounced: 0,
};

const StepsTable = ({
	workflow,
	steps,
}: {
	workflow: Workflow;
	steps: AutomationMetrics["steps"];
}) => {
	const templates = useTemplatesQuery();
	const rows = useMemo(() => {
		const byNode = new Map(steps.map((s) => [s.nodeId, s]));
		const nodes = stepsInFlowOrder(workflow);
		const known = new Set(nodes.map((n) => n.id));
		const describe = (node: WorkflowNode): string => {
			if (node.type === "send_email") {
				const data = node.data as SendEmailNodeData;
				return (
					templates.data?.templates.find((t) => t.id === data.templateId)
						?.name ??
					data.subject ??
					"Email"
				);
			}
			if (node.type === "delay") {
				const data = node.data as DelayNodeData;
				return `Wait ${formatDelayAmount(Number(data.amount), data.unit)}`;
			}
			if (node.type === "condition") {
				return describeCondition(node.data as ConditionNodeData) ?? "Condition";
			}
			return toneOf(node.type ?? "").label;
		};
		return [
			...nodes.map((node) => ({
				id: node.id,
				type: node.type ?? "",
				label: describe(node),
				stats: byNode.get(node.id),
			})),
			// Steps that ran in an earlier version but are gone now.
			...steps
				.filter((s) => !known.has(s.nodeId) && s.nodeId !== TRIGGER_NODE_ID)
				.map((s) => ({
					id: s.nodeId,
					type: s.nodeType,
					label: "Removed step",
					stats: s,
				})),
		];
	}, [workflow, steps, templates.data]);

	const head =
		"px-4 py-2.5 text-left font-medium text-[11px] text-text-soft-400 uppercase tracking-[0.08em]";
	const cell = "px-4 py-3 text-[13px] tabular-nums text-text-sub-600";

	return (
		<section className={cn(CARD, "overflow-hidden")}>
			<h3 className="px-5 pt-4 pb-2 font-medium text-sm text-text-strong-950">
				Steps
			</h3>
			<div className="overflow-x-auto">
				<table className="w-full min-w-[720px]">
					<thead>
						<tr className="border-stroke-soft-100 border-b dark:border-white/10">
							<th className={head}>Step</th>
							<th className={cn(head, "text-right")}>Reached</th>
							<th className={cn(head, "text-right")}>Completed</th>
							<th className={cn(head, "text-right")}>Waiting</th>
							<th className={cn(head, "text-right")}>Skipped</th>
							<th className={cn(head, "text-right")}>Failed</th>
							<th className={cn(head, "text-right")}>Opened</th>
							<th className={cn(head, "text-right")}>Clicked</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((row) => {
							const s = row.stats;
							const reached = s
								? s.pending + s.running + s.completed + s.skipped + s.failed
								: 0;
							const emails = s?.emails ?? EMPTY_EMAILS;
							const isEmail = row.type === "send_email";
							return (
								<tr
									key={row.id}
									className="border-stroke-soft-100 border-b last:border-b-0 dark:border-white/10"
								>
									<td className="px-4 py-3">
										<span className="flex min-w-0 items-center gap-2.5">
											<span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-200 text-text-sub-600 dark:border-stroke-soft-100/50">
												<StepIcon
													name={toneOf(row.type).icon}
													className="size-3.5"
												/>
											</span>
											<span className="flex min-w-0 flex-col">
												<span className="truncate font-medium text-[13px] text-text-strong-950">
													{row.label}
												</span>
												<span className="text-text-soft-400 text-xs">
													{toneOf(row.type).label}
												</span>
											</span>
										</span>
									</td>
									<td className={cn(cell, "text-right text-text-strong-950")}>
										{reached.toLocaleString()}
									</td>
									<td className={cn(cell, "text-right")}>
										{(s?.completed ?? 0).toLocaleString()}
									</td>
									<td className={cn(cell, "text-right")}>
										{((s?.pending ?? 0) + (s?.running ?? 0)).toLocaleString()}
									</td>
									<td className={cn(cell, "text-right")}>
										{(s?.skipped ?? 0).toLocaleString()}
									</td>
									<td className={cn(cell, "text-right")}>
										{(s?.failed ?? 0).toLocaleString()}
									</td>
									<td className={cn(cell, "text-right")}>
										{isEmail ? percent(emails.opened, emails.sent) : "—"}
									</td>
									<td className={cn(cell, "text-right")}>
										{isEmail ? percent(emails.clicked, emails.sent) : "—"}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</section>
	);
};

const MetricsSkeleton = () => (
	<div className="flex flex-col gap-4">
		<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
			{Array.from({ length: 8 }, (_, i) => (
				<div key={i} className={cn(CARD, "h-[106px] animate-pulse")} />
			))}
		</div>
		<div className={cn(CARD, "h-[290px] animate-pulse")} />
	</div>
);

export function MetricsView({ workflow }: { workflow: Workflow }) {
	const [days, setDays] = useQueryState("days", rangeParser);
	const query = useAutomationMetrics(workflow.id, days);
	const metrics = query.data;

	return (
		<div className="min-h-0 flex-1 overflow-y-auto bg-bg-weak-50 dark:bg-black">
			<div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6">
				<div className="flex items-center justify-between gap-3">
					<p className="text-text-sub-600 text-xs">
						Totals cover every run; the chart covers the last {days} days.
					</p>
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
						<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
						<RunsChart daily={metrics.daily} />
						<StepsTable workflow={workflow} steps={metrics.steps} />
					</>
				)}
			</div>
		</div>
	);
}
