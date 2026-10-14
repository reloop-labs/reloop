"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useEffect } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/features/api-keys/filters/base-ui-select";
import {
	RUN_RANGES,
	type RunRange,
	useAutomationRun,
	useAutomationRuns,
	useNow,
} from "../../hooks/use-automation-runs";
import type {
	AutomationEnrollment,
	EnrollmentStatus,
} from "../../hooks/use-automations-api";
import { formatAgo, formatDuration } from "../../run-format";
import type { Workflow } from "../../workflow-types";
import { RunCanvas } from "./run-canvas";
import { RUN_STATUS, RunStatusIcon } from "./run-status-badge";

const STATUSES: EnrollmentStatus[] = [
	"active",
	"completed",
	"failed",
	"cancelled",
];

type Filter = "all" | EnrollmentStatus;

const filterParser = parseAsStringLiteral([
	"all",
	...STATUSES,
] as const).withDefault("all");

const rangeParser = parseAsStringLiteral(
	RUN_RANGES.map((r) => r.value),
).withDefault("all");

/** Shared column widths for the header and the rows (like the API keys table). */
const COLUMNS = "grid grid-cols-[minmax(0,1fr)_104px_72px] items-center gap-3";

function contactLabel(run: AutomationEnrollment) {
	return run.contactEmail ?? "Deleted contact";
}

const RunRow = ({
	run,
	selected,
	now,
	onSelect,
}: {
	run: AutomationEnrollment;
	selected: boolean;
	now: number;
	onSelect: () => void;
}) => (
	<button
		type="button"
		onClick={onSelect}
		aria-current={selected || undefined}
		className={cn(
			COLUMNS,
			"w-full px-4 py-2.5 text-left",
			"hover:bg-bg-weak-50 dark:hover:bg-white/[0.04]",
			selected && "bg-bg-weak-50/50 dark:bg-white/[0.06]",
		)}
	>
		<span className="flex min-w-0 items-center gap-2">
			<RunStatusIcon status={run.status} />
			<span className="truncate font-medium text-sm text-text-strong-950">
				{contactLabel(run)}
			</span>
		</span>
		<span className="whitespace-nowrap font-medium text-sm text-text-sub-600 tabular-nums">
			{formatAgo(run.enrolledAt, now)}
		</span>
		<span className="whitespace-nowrap text-right font-medium text-sm text-text-sub-600 tabular-nums">
			{run.endedAt
				? formatDuration(
						new Date(run.endedAt).getTime() -
							new Date(run.enrolledAt).getTime(),
					)
				: "—"}
		</span>
	</button>
);

/** Column title with a small icon, like the API keys table. */
const ColumnTitle = ({
	icon,
	label,
	className,
}: {
	icon: string;
	label: string;
	className?: string;
}) => (
	<div className={cn("flex items-center gap-1", className)}>
		<Icon name={icon} className="h-3 w-3" />
		<span className="text-xs">{label}</span>
	</div>
);

const STATUS_OPTIONS: {
	value: Filter;
	label: string;
}[] = [
	{ value: "all", label: "All statuses" },
	...STATUSES.map((value) => ({ value, label: RUN_STATUS[value].label })),
];

const StatusMark = ({ value }: { value: Filter }) =>
	value === "all" ? (
		<Icon name="activity" className="h-4 w-4 shrink-0" />
	) : (
		<RunStatusIcon status={value} />
	);

const Filters = ({
	range,
	onRangeChange,
	status,
	onStatusChange,
	refreshing,
	onRefresh,
}: {
	range: RunRange;
	onRangeChange: (value: RunRange) => void;
	status: Filter;
	onStatusChange: (value: Filter) => void;
	refreshing: boolean;
	onRefresh: () => void;
}) => {
	const rangeLabel = RUN_RANGES.find((r) => r.value === range)?.label;
	const statusLabel = STATUS_OPTIONS.find((o) => o.value === status)?.label;
	return (
		<div className="flex items-center gap-2">
			<Select
				value={range}
				onValueChange={(value) => onRangeChange(value as RunRange)}
			>
				<SelectTrigger className="min-w-0 flex-1" aria-label="Started">
					<SelectValue>
						<Icon name="calendar" className="h-4 w-4 shrink-0" />
						<span className="min-w-0 truncate">{rangeLabel}</span>
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{RUN_RANGES.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							<Icon name="calendar" className="h-4 w-4 shrink-0" />
							<span className="min-w-0 truncate">{option.label}</span>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<Select
				value={status}
				onValueChange={(value) => onStatusChange(value as Filter)}
			>
				<SelectTrigger className="min-w-0 flex-1" aria-label="Status">
					{/* The icon lives inside the value so it lines up with the items. */}
					<SelectValue>
						<StatusMark value={status} />
						<span className="min-w-0 truncate">{statusLabel}</span>
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{STATUS_OPTIONS.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							<StatusMark value={option.value} />
							<span className="min-w-0 truncate">{option.label}</span>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<button
				type="button"
				onClick={onRefresh}
				aria-label="Refresh runs"
				title="Refresh"
				className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50/60 hover:text-text-strong-950 dark:border-stroke-soft-100/50 dark:bg-bg-weak-50/40"
			>
				<Icon
					name="refresh-cw"
					className={cn(
						"size-4",
						refreshing && "animate-spin motion-reduce:animate-none",
					)}
				/>
			</button>
		</div>
	);
};

const ListSkeleton = () =>
	Array.from({ length: 6 }, (_, i) => (
		<div key={i} className={cn(COLUMNS, "px-4 py-3")}>
			<div className="flex items-center gap-2">
				<div className="size-4 animate-pulse rounded-full bg-neutral-alpha-5" />
				<div className="h-3.5 w-40 animate-pulse rounded bg-neutral-alpha-5" />
			</div>
			<div className="h-3 w-16 animate-pulse rounded bg-neutral-alpha-5" />
			<div className="ml-auto h-3 w-8 animate-pulse rounded bg-neutral-alpha-5" />
		</div>
	));

const EmptyRuns = ({
	workflow,
	filtered,
}: {
	workflow: Workflow;
	filtered: boolean;
}) => {
	const title = filtered ? "No matching runs" : "No runs yet";
	const body = filtered
		? "Try another date range or status."
		: workflow.status === "active"
			? "A run starts each time a contact enters this automation: track its trigger event from your app, or use Test automation in the … menu."
			: "Start the automation, then each contact that enters it shows up here as a run.";
	return (
		<div className="flex h-full flex-col items-center justify-center px-8 text-center">
			<span className="flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 dark:border-stroke-soft-100/50 dark:bg-[#141419]">
				<Icon name="workflow" className="size-5" />
			</span>
			<p className="mt-4 font-medium text-sm text-text-strong-950">{title}</p>
			<p className="mt-1 max-w-sm text-text-sub-600 text-xs leading-relaxed">
				{body}
			</p>
		</div>
	);
};

export function RunsView({ workflow }: { workflow: Workflow }) {
	const [filter, setFilter] = useQueryState("runs", filterParser);
	const [selectedId, setSelectedId] = useQueryState("run");
	const status: EnrollmentStatus | undefined =
		filter === "all" ? undefined : filter;
	const [range, setRange] = useQueryState("range", rangeParser);
	const runsQuery = useAutomationRuns(workflow.id, status, range);
	const runs = runsQuery.data?.pages.flatMap((page) => page.enrollments) ?? [];
	const total = runsQuery.data?.pages[0]?.total ?? 0;
	const now = useNow();

	// Show the newest run until one is picked (or the picked one is filtered out).
	const firstId = runs[0]?.id ?? null;
	const selectedInList = runs.some((run) => run.id === selectedId);
	// A run that just started may not be in the list until it refreshes.
	const keepSelected = selectedInList || (runsQuery.isFetching && !!selectedId);
	const activeId = keepSelected ? selectedId : firstId;
	useEffect(() => {
		if (!runsQuery.isSuccess || keepSelected) return;
		void setSelectedId(firstId, { history: "replace" });
	}, [runsQuery.isSuccess, keepSelected, firstId, setSelectedId]);

	const runQuery = useAutomationRun(workflow.id, activeId);

	return (
		<div className="flex min-h-0 flex-1">
			<aside className="flex w-[480px] shrink-0 flex-col border-stroke-soft-200 border-r bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-black">
				<div className="px-3 pt-3">
					<Filters
						range={range}
						onRangeChange={(value) =>
							void setRange(value === "all" ? null : value)
						}
						status={filter}
						onStatusChange={(value) =>
							void setFilter(value === "all" ? null : value)
						}
						refreshing={runsQuery.isFetching && !runsQuery.isPending}
						onRefresh={() => {
							void runsQuery.refetch();
							if (activeId) void runQuery.refetch();
						}}
					/>
				</div>
				<div className="min-h-0 flex-1 overflow-y-auto px-3 pt-3 pb-3">
					<div className="w-full text-paragraph-sm">
						<div
							className={cn(
								COLUMNS,
								"rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 text-xs dark:border-[#101010] dark:bg-bg-weak-50/40",
							)}
						>
							<ColumnTitle icon="contacts" label="Contact" />
							<ColumnTitle icon="history" label="Started" />
							<ColumnTitle
								icon="clock"
								label="Duration"
								className="justify-end"
							/>
						</div>
						<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100 dark:border-stroke-soft-100/70 dark:bg-black">
							{runsQuery.isPending ? (
								<ListSkeleton />
							) : runsQuery.isError ? (
								<p className="px-4 py-3 text-sm text-text-sub-600">
									Couldn’t load runs. {runsQuery.error.message}
								</p>
							) : runs.length === 0 ? (
								<p className="px-4 py-6 text-center text-sm text-text-sub-600">
									No runs to show.
								</p>
							) : (
								runs.map((run) => (
									<RunRow
										key={run.id}
										run={run}
										now={now}
										selected={run.id === activeId}
										onSelect={() => void setSelectedId(run.id)}
									/>
								))
							)}
							{runs.length > 0 ? (
								<div className="flex items-center justify-between px-4 py-2 text-label-xs text-text-sub-600">
									<span className="tabular-nums">
										{runs.length.toLocaleString()} of {total.toLocaleString()}{" "}
										{total === 1 ? "run" : "runs"}
									</span>
									{runsQuery.hasNextPage ? (
										<button
											type="button"
											onClick={() => void runsQuery.fetchNextPage()}
											disabled={runsQuery.isFetchingNextPage}
											className="rounded-lg px-2 py-1 font-medium transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 disabled:opacity-60 dark:hover:bg-white/5"
										>
											{runsQuery.isFetchingNextPage ? "Loading…" : "Load more"}
										</button>
									) : null}
								</div>
							) : null}
						</div>
					</div>
				</div>
			</aside>
			<section className="relative flex min-w-0 flex-1 bg-bg-weak-50 dark:bg-black">
				{runsQuery.isSuccess && runs.length === 0 ? (
					<EmptyRuns
						workflow={workflow}
						filtered={filter !== "all" || range !== "all"}
					/>
				) : runQuery.data ? (
					<RunCanvas detail={runQuery.data} />
				) : runQuery.isError ? (
					<p className="m-auto text-text-sub-600 text-xs">
						Couldn’t load this run. {runQuery.error.message}
					</p>
				) : null}
			</section>
		</div>
	);
}
