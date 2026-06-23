"use client";

import { PageSizeDropdown } from "@fe/dashboard/components/page-size-dropdown";
import { PaginationControls } from "@fe/dashboard/components/pagination-controls";
import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
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
	/** Whether any filters are currently active */
	hasFilters?: boolean;
	/** Callback to clear all active filters */
	onClearFilters?: () => void;
	/** Pagination */
	total?: number;
	currentPage?: number;
	pageSize?: number;
	totalPages?: number;
	startIndex?: number;
	endIndex?: number;
	onPageChange?: (page: number) => void;
	onPageSizeChange?: (size: number) => void;
	isMobile?: boolean;
}

/** Grid template used for the header and every row */
const GRID_COLS = "grid-cols-[62px_44px_minmax(0,1fr)_90px]";

/** Returns status label and badge color */
const getStatusProps = (statusCode: number | null | undefined) => {
	if (!statusCode) return null;

	// Determine status label & color
	let label = `${statusCode}`;
	let color = "gray";

	if (statusCode >= 200 && statusCode < 300) {
		label = `${statusCode} OK`;
		color = "gray";
	} else if (statusCode >= 300 && statusCode < 400) {
		label = `${statusCode} REDIR`;
		color = "blue";
	} else if (statusCode >= 400 && statusCode < 500) {
		label = `${statusCode} ERR`;
		color = "orange";
	} else if (statusCode >= 500) {
		label = `${statusCode} ERR`;
		color = "red";
	}

	return { label, color };
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
		case "SMTP":
			return "text-purple-700 dark:text-purple-400";
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
		const existingIdx = seen.get(key);
		if (existingIdx !== undefined) {
			groups[existingIdx]?.logs.push(log);
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

/** Strip protocol + host from a URL, keeping only the path and stripping trailing slash */
const stripBasePath = (url: string) => {
	try {
		let path = new URL(url).pathname;
		if (path.length > 1 && path.endsWith("/")) {
			path = path.slice(0, -1);
		}
		return path;
	} catch {
		let path = url;
		if (path.length > 1 && path.endsWith("/")) {
			path = path.slice(0, -1);
		}
		return path;
	}
};

/** Extract method and endpoint from a log event + requestDetails */
const getMethodAndEndpoint = (
	log: LogData & { requestDetails?: Record<string, unknown> },
) => {
	const method = (log.requestDetails?.method as string) || "";
	const rawEndpoint =
		(log.requestDetails?.endpoint as string) || log.event || "";
	const endpoint = stripBasePath(rawEndpoint);
	return { method, endpoint };
};

export const LogTable = ({
	logs,
	isLoading,
	loadingRows = 5,
	selectedLogId,
	onRowClick,
	hasFilters,
	onClearFilters,
	total = 0,
	currentPage = 1,
	pageSize = 25,
	totalPages = 1,
	startIndex = 1,
	endIndex = 0,
	onPageChange,
	onPageSizeChange,
	isMobile,
}: LogTableProps) => {
	return (
		<div
			className={cn(
				"w-full rounded-[14px] border border-stroke-soft-100 bg-bg-white-0 text-paragraph-sm dark:border-stroke-soft-100/40",
				!isMobile && "flex flex-col overflow-hidden",
			)}
			style={!isMobile ? { maxHeight: "calc(100vh - 220px)" } : undefined}
		>
			{/* Scrollable Table Body */}
			<div
				className={cn(
					"divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/50",
					!isMobile && "flex-1 overflow-y-auto",
				)}
			>
				{isLoading ? (
					Array.from({ length: loadingRows }).map((_, i) => (
						<div
							key={`skel-${i}`}
							className={cn(
								"grid items-center border-l-2 border-l-transparent px-4 py-2.5",
								GRID_COLS,
							)}
						>
							<Skeleton className="h-5 w-16 rounded-md" />
							<Skeleton className="h-4 w-10 rounded" />
							<Skeleton className="h-4 w-full max-w-[280px] rounded" />
							<Skeleton className="ml-auto h-4 w-20 rounded" />
						</div>
					))
				) : logs.length === 0 ? (
					hasFilters ? (
						<div className="flex flex-col items-center bg-bg-soft-200/10 px-6 py-12 text-center dark:bg-transparent">
							<div className="mb-5 flex h-12 w-12 items-center justify-center rounded-3xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/50">
								<Icon name="search" className="h-5 w-5 text-text-sub-600" />
							</div>
							<h3 className="mb-2 font-semibold text-lg text-text-strong-950">
								No results found
							</h3>
							<p className="mx-auto mb-5 max-w-sm text-balance font-medium text-[12px] text-text-sub-600">
								No logs match your current filters. Try adjusting your search,
								date range, or status filters.
							</p>
							{onClearFilters && (
								<Button.Root
									variant="neutral"
									mode="stroke"
									size="xsmall"
									onClick={onClearFilters}
									className="gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
								>
									Clear all filters
								</Button.Root>
							)}
						</div>
					) : (
						<div className="flex flex-col items-center bg-bg-soft-200/10 px-6 py-12 text-center dark:bg-transparent">
							<div className="mb-5 flex h-12 w-12 items-center justify-center rounded-3xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/50">
								<Icon name="activity" className="h-5 w-5 text-text-sub-600" />
							</div>
							<h3 className="mb-2 font-semibold text-lg text-text-strong-950">
								No logs yet
							</h3>
							<p className="mx-auto mb-5 max-w-[260px] text-balance font-medium text-[12px] text-text-sub-600">
								Logs will appear here once API requests start flowing through
								your project.
							</p>
						</div>
					)
				) : (
					groupLogsByDate(logs as any).map((group) => (
						<div key={group.dateKey}>
							{/* Date separator */}
							<div className="sticky top-0 z-10 flex items-center gap-3 border-stroke-soft-100 border-b bg-bg-weak-50 px-4 py-2.5 dark:border-stroke-soft-100/40">
								<span className="font-medium text-text-sub-600 text-xs uppercase tracking-widest">
									{group.dateLabel}
								</span>
							</div>

							{/* Log rows */}
							<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/40">
								{group.logs.map((log) => {
									const logAny = log as any;
									const { method, endpoint } = getMethodAndEndpoint(logAny);
									const statusProps = getStatusProps(log.status_code);
									const isSelected = selectedLogId === log.uuid;

									return (
										<button
											key={log.uuid}
											type="button"
											onClick={() => onRowClick?.(log.uuid)}
											className={cn(
												"group/row grid w-full cursor-pointer items-center px-4 py-2 text-left transition-colors",
												GRID_COLS,
												getSelectedBorderClass(log.status_code, isSelected),
												isSelected
													? "bg-bg-weak-50/80 dark:bg-bg-weak-50/30"
													: "hover:bg-bg-weak-50/50 dark:hover:bg-bg-weak-50/10",
												"focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-inset",
											)}
										>
											{/* Status */}
											<div className="flex w-full flex-shrink-0 items-center justify-start">
												{statusProps ? (
													<Badge.Root
														variant="lighter"
														color={statusProps.color as any}
														className="h-[18px] rounded-md px-1.5 font-semibold text-[10px] tracking-normal"
													>
														{statusProps.label}
													</Badge.Root>
												) : (
													<span className="font-semibold text-[11px] text-text-soft-400">
														—
													</span>
												)}
											</div>

											{/* Method */}
											<span
												className={cn(
													"flex-shrink-0 font-semibold text-[11px] uppercase tracking-wide",
													method
														? getMethodBadgeClass(method)
														: "text-text-soft-400",
												)}
											>
												{method || "—"}
											</span>

											{/* Endpoint / Event */}
											<span className="truncate font-mono text-text-strong-950 text-xs">
												{endpoint || log.event}
											</span>

											{/* Time */}
											<span className="flex-shrink-0 text-right text-text-sub-600 text-xs tabular-nums">
												{formatTime(log.created_at)}
											</span>
										</button>
									);
								})}
							</div>
						</div>
					))
				)}
			</div>

			{/* Pagination — outside scrollable body, static at bottom of card */}
			{total > 0 && (
				<div className="flex flex-shrink-0 items-center justify-between rounded-b-[14px] border-stroke-soft-100 border-t bg-bg-white-0 px-4 py-2 text-label-xs text-text-sub-600 dark:border-stroke-soft-100/40">
					<div className="flex items-center">
						<span>
							Showing {startIndex}–{endIndex} of {total} log
							{total !== 1 ? "s" : ""}
						</span>
						{onPageSizeChange && (
							<PageSizeDropdown
								value={pageSize}
								onValueChange={(value) => onPageSizeChange(value)}
							/>
						)}
					</div>
					{onPageChange && (
						<PaginationControls
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={onPageChange}
							isLoading={isLoading}
						/>
					)}
				</div>
			)}
		</div>
	);
};
