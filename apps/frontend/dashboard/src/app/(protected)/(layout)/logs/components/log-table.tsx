"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";

interface LogData {
	uuid: string;
	event: string;
	level: string;
	status_code?: number | null;
	created_at: string;
}

interface LogTableProps {
	logs: LogData[];
	isLoading?: boolean;
	loadingRows?: number;
	selectedLogId?: string | null;
	onRowClick?: (logId: string) => void;
}

/** Returns Stripe-style status badge classes */
const getStatusBadge = (statusCode: number | null | undefined) => {
	if (!statusCode) return null;
	const isSuccess = statusCode >= 200 && statusCode < 400;
	return {
		label: `${statusCode}`,
		className: isSuccess
			? "bg-[#d1fae5] text-[#065f46] dark:bg-emerald-950/60 dark:text-emerald-400"
			: "bg-[#fee2e2] text-[#991b1b] dark:bg-red-950/60 dark:text-red-400",
	};
};

/** Returns method badge color */
const getMethodBadgeClass = (method: string) => {
	switch (method?.toUpperCase()) {
		case "GET":
			return "text-emerald-700 dark:text-emerald-400";
		case "POST":
			return "text-blue-700 dark:text-blue-400";
		case "PUT":
		case "PATCH":
			return "text-amber-700 dark:text-amber-400";
		case "DELETE":
			return "text-rose-700 dark:text-rose-400";
		default:
			return "text-text-sub-600";
	}
};

/** Left border accent for the selected row */
const getSelectedBorderClass = (
	statusCode: number | null | undefined,
	isSelected: boolean,
) => {
	if (!isSelected) return "border-l-2 border-l-transparent";
	if (!statusCode || (statusCode >= 200 && statusCode < 400))
		return "border-l-2 border-l-primary-base";
	return "border-l-2 border-l-error-base";
};

/** Format time as "4:24:00 PM" */
const formatTime = (dateStr: string) => {
	return new Date(dateStr).toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
		second: "2-digit",
		hour12: true,
	});
};

/** Format date header as "APR 3, 2024" */
const formatDateHeader = (dateStr: string) => {
	return new Date(dateStr)
		.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		})
		.toUpperCase();
};

/** Get date key "YYYY-MM-DD" for grouping */
const getDateKey = (dateStr: string) => {
	return new Date(dateStr).toISOString().slice(0, 10);
};

/** Group logs by date */
const groupLogsByDate = (logs: LogData[]) => {
	const groups: { dateKey: string; dateLabel: string; logs: LogData[] }[] = [];
	const seen = new Map<string, number>();

	for (const log of logs) {
		const key = getDateKey(log.created_at);
		if (seen.has(key)) {
			groups[seen.get(key)!].logs.push(log);
		} else {
			seen.set(key, groups.length);
			groups.push({
				dateKey: key,
				dateLabel: formatDateHeader(log.created_at),
				logs: [log],
			});
		}
	}
	return groups;
};

/** Extract method and endpoint from a log event + requestDetails */
const getMethodAndEndpoint = (log: LogData & { requestDetails?: Record<string, unknown> }) => {
	const method = (log.requestDetails?.method as string) || "";
	const endpoint = (log.requestDetails?.endpoint as string) || log.event || "";
	return { method, endpoint };
};

export const LogTable = ({
	logs,
	isLoading,
	loadingRows = 5,
	selectedLogId,
	onRowClick,
}: LogTableProps & { selectedLogId?: string | null }) => {
	if (isLoading) {
		return (
			<div className="w-full divide-y divide-stroke-soft-100 rounded-xl border border-stroke-soft-100 dark:divide-stroke-soft-100/40 dark:border-stroke-soft-100/40">
				{Array.from({ length: loadingRows }).map((_, i) => (
					<div
						key={`skel-${i}`}
						className="flex items-center gap-3 border-l-2 border-l-transparent px-4 py-2.5"
					>
						<Skeleton className="h-5 w-14 rounded-md flex-shrink-0" />
						<Skeleton className="h-4 w-10 rounded flex-shrink-0" />
						<Skeleton className="h-4 w-48 rounded flex-1" />
						<Skeleton className="h-4 w-20 rounded ml-auto flex-shrink-0" />
					</div>
				))}
			</div>
		);
	}

	if (logs.length === 0) {
		return (
			<div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-stroke-soft-100 text-text-sub-600 dark:border-stroke-soft-100/40">
				<Icon name="inbox" className="h-8 w-8 text-text-disabled-300" />
				<p className="text-sm">No logs found</p>
				<p className="text-xs text-text-soft-400">
					Try adjusting your filters or time range
				</p>
			</div>
		);
	}

	const groups = groupLogsByDate(logs as any);

	return (
		<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
			{groups.map((group) => (
				<div key={group.dateKey}>
					{/* Date separator */}
					<div className="flex items-center gap-3 border-b border-stroke-soft-100 bg-bg-weak-50/70 px-4 py-1.5 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/20">
						<span className="font-medium text-[10px] tracking-widest text-text-soft-400 uppercase">
							{group.dateLabel}
						</span>
					</div>

					{/* Log rows */}
					<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/40">
						{group.logs.map((log) => {
							const logAny = log as any;
							const { method, endpoint } = getMethodAndEndpoint(logAny);
							const statusBadge = getStatusBadge(log.status_code);
							const isSelected = selectedLogId === log.uuid;

							return (
								<button
									key={log.uuid}
									type="button"
									onClick={() => onRowClick?.(log.uuid)}
									className={cn(
										"group flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-paragraph-sm transition-colors",
										getSelectedBorderClass(log.status_code, isSelected),
										isSelected
											? "bg-bg-weak-50/80 dark:bg-bg-weak-50/30"
											: "hover:bg-bg-weak-50/50 dark:hover:bg-bg-weak-50/10",
										"focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-inset",
									)}
								>
									{/* Status badge */}
									<span
										className={cn(
											"inline-flex w-[70px] flex-shrink-0 items-center justify-center rounded-md px-2 py-0.5 font-semibold text-[11px] tabular-nums",
											statusBadge
												? statusBadge.className
												: "bg-neutral-alpha-10 text-text-sub-600",
										)}
									>
										{statusBadge ? statusBadge.label : "—"}
									</span>

									{/* Method */}
									{method && (
										<span
											className={cn(
												"w-12 flex-shrink-0 font-semibold text-[11px] uppercase tracking-wide",
												getMethodBadgeClass(method),
											)}
										>
											{method}
										</span>
									)}

									{/* Endpoint / Event */}
									<span className="flex-1 truncate font-mono text-xs text-text-strong-950">
										{endpoint || log.event}
									</span>

									{/* Time */}
									<span className="ml-auto flex-shrink-0 text-xs text-text-sub-600 tabular-nums">
										{formatTime(log.created_at)}
									</span>
								</button>
							);
						})}
					</div>
				</div>
			))}
		</div>
	);
};
