import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import * as Tooltip from "@reloop/ui/tooltip";
import { PageSizeDropdown } from "#/features/api-keys/table/page-size-dropdown";
import { PaginationControls } from "#/features/api-keys/table/pagination-controls";
import type { LogData } from "./types";

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
const GRID_COLS = "grid-cols-[20px_auto_minmax(0,1fr)_auto]";

function statusIcon(statusCode: number | null | undefined): {
	name: string;
	className: string;
	label: string;
} {
	if (!statusCode) {
		return {
			name: "minus-circle",
			className: "text-text-soft-400",
			label: "Unknown",
		};
	}
	if (statusCode >= 200 && statusCode < 300) {
		return {
			name: "check-circle",
			className: "text-success-base",
			label: `${statusCode} OK`,
		};
	}
	if (statusCode >= 300 && statusCode < 400) {
		return {
			name: "arrow-right",
			className: "text-information-base",
			label: `${statusCode} Redirect`,
		};
	}
	if (statusCode >= 400 && statusCode < 500) {
		return {
			name: "alert-circle",
			className: "text-warning-base",
			label: `${statusCode} Client error`,
		};
	}
	return {
		name: "cross-circle",
		className: "text-error-base",
		label: `${statusCode} Server error`,
	};
}

function codeClass(statusCode: number | null | undefined) {
	if (!statusCode) return "text-text-soft-400";
	if (statusCode >= 200 && statusCode < 300) return "text-success-base";
	if (statusCode >= 300 && statusCode < 400) return "text-information-base";
	if (statusCode >= 400 && statusCode < 500) return "text-warning-base";
	return "text-error-base";
}

const getMethodColorClass = (method: string) => {
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

/** Format time as "4:24:08 PM" for denser rows */
const formatTime = (dateStr: string) => {
	return new Date(dateStr).toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
		second: "2-digit",
		hour12: true,
	});
};

/** Format date header as "Jul 23, 2026" */
const formatDateHeader = (dateStr: string) => {
	return new Date(dateStr).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
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

/** Extract method and endpoint path from a log */
const getMethodAndEndpoint = (log: LogData) => {
	const method =
		typeof log.requestDetails?.method === "string"
			? log.requestDetails.method
			: "";
	const rawEndpoint =
		typeof log.requestDetails?.endpoint === "string"
			? log.requestDetails.endpoint
			: log.event || "";
	const endpoint = stripBasePath(rawEndpoint);
	return { method, endpoint };
};

function TruncatedPath({ path }: { path: string }) {
	return (
		<Tooltip.Root>
			<Tooltip.Trigger asChild>
				<span className="min-w-0 truncate font-medium font-mono text-label-sm text-text-strong-950">
					{path}
				</span>
			</Tooltip.Trigger>
			<Tooltip.Content
				side="top"
				variant="light"
				className="max-w-sm break-all font-mono text-xs"
			>
				{path}
			</Tooltip.Content>
		</Tooltip.Root>
	);
}

function LogRowSkeleton() {
	return (
		<div
			className={cn("grid w-full items-center gap-3 px-4 py-2.5", GRID_COLS)}
		>
			<Skeleton className="h-3.5 w-3.5 rounded-full" />
			<Skeleton className="h-3.5 w-10 rounded" />
			<Skeleton className="h-3.5 w-full max-w-[180px] rounded" />
			<Skeleton className="h-3.5 w-16 rounded" />
		</div>
	);
}

function LogDateBandSkeleton() {
	return (
		<div className="sticky top-0 z-10 flex items-center gap-2 border-stroke-soft-100 border-b bg-bg-weak-50/70 px-4 py-1.5 backdrop-blur-md dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/50">
			<Icon name="calendar" className="h-3 w-3 shrink-0 text-text-soft-400" />
			<Skeleton className="h-3 w-24 rounded" />
			<Skeleton className="h-4 min-w-4 rounded-md" />
		</div>
	);
}

function LogTableHeader() {
	return (
		<div
			className={cn(
				"grid items-center gap-3 rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 dark:border-[#101010] dark:bg-bg-weak-50/40",
				GRID_COLS,
			)}
		>
			<div aria-hidden className="w-5" />
			<div className="flex items-center gap-1">
				<Icon name="code" className="h-3 w-3" />
				<span className="text-xs">Code</span>
			</div>
			<div className="flex items-center gap-1">
				<Icon name="activity-2" className="h-3 w-3" />
				<span className="text-xs">Request</span>
			</div>
			<div className="flex items-center justify-end gap-1">
				<Icon name="clock" className="h-3 w-3" />
				<span className="text-xs">Time</span>
			</div>
		</div>
	);
}

export const LogTable = ({
	logs,
	isLoading,
	loadingRows = 8,
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
			className={cn("w-full text-paragraph-sm", !isMobile && "flex flex-col")}
			style={!isMobile ? { maxHeight: "calc(100vh - 220px)" } : undefined}
		>
			{/* Soft overlapping header — matches API keys / delivery logs chrome */}
			<LogTableHeader />

			{/* Body card overlaps header */}
			<div
				className={cn(
					"-mt-2.5 flex min-h-0 flex-col overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40",
					!isMobile && "flex-1",
				)}
			>
				<div
					className={cn(
						"divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/50",
						!isMobile && "min-h-0 flex-1 overflow-y-auto",
					)}
				>
					{isLoading ? (
						<>
							<LogDateBandSkeleton />
							{Array.from({ length: loadingRows }).map((_, i) => (
								<LogRowSkeleton key={`skel-${i}`} />
							))}
						</>
					) : logs.length === 0 ? (
						hasFilters ? (
							<div className="flex flex-col items-center px-6 py-12 text-center dark:bg-bg-weak-50/30">
								<div className="mb-4 flex items-center justify-center">
									<Icon name="search" className="h-8 w-8 text-text-sub-600" />
								</div>
								<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
									No logs found
								</h3>
								<p className="mx-auto mb-6 max-w-75 text-balance font-medium text-[12px] text-text-sub-600">
									Try adjusting your search or filters.
								</p>
								{onClearFilters && (
									<Button.Root
										type="button"
										variant="neutral"
										mode="stroke"
										size="small"
										onClick={onClearFilters}
										className="gap-1.5 rounded-xl"
									>
										<Icon
											name="cross-circle"
											className="h-4 w-4 text-text-sub-600"
										/>
										Clear filters
									</Button.Root>
								)}
							</div>
						) : (
							<div className="flex flex-col items-center px-6 py-12 text-center dark:bg-bg-weak-50/30">
								<div className="mb-4 flex items-center justify-center">
									<Icon name="logs" className="h-8 w-8 text-text-sub-600" />
								</div>
								<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
									No logs yet
								</h3>
								<p className="mx-auto max-w-75 text-balance font-medium text-[12px] text-text-sub-600">
									Logs will appear here once API requests start flowing through
									your workspace.
								</p>
							</div>
						)
					) : (
						<Tooltip.Provider delayDuration={400}>
							{groupLogsByDate(logs).map((group) => (
								<div key={group.dateKey}>
									{/* Date section — soft sticky band */}
									<div className="sticky top-0 z-10 flex items-center gap-2 border-stroke-soft-100 border-b bg-bg-weak-50/70 px-4 py-1.5 backdrop-blur-md dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/50">
										<Icon
											name="calendar"
											className="h-3 w-3 shrink-0 text-text-soft-400"
										/>
										<span className="font-medium text-[11px] text-text-sub-600 tracking-wide">
											{group.dateLabel}
										</span>
										<span className="inline-flex h-4 min-w-4 items-center justify-center rounded-md bg-bg-white-0 px-1 font-medium text-[10px] text-text-soft-400 tabular-nums ring-1 ring-stroke-soft-100 dark:bg-bg-white-0/10 dark:ring-stroke-soft-100/40">
											{group.logs.length}
										</span>
									</div>

									{/* Log rows */}
									<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/40">
										{group.logs.map((log) => {
											const { method, endpoint } = getMethodAndEndpoint(log);
											const icon = statusIcon(log.status_code);
											const isSelected = selectedLogId === log.uuid;
											const primaryPath = endpoint || log.event;

											return (
												<button
													key={log.uuid}
													type="button"
													onClick={() => onRowClick?.(log.uuid)}
													className={cn(
														"group/row grid w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150",
														GRID_COLS,
														isSelected
															? "bg-bg-weak-50/50"
															: "hover:bg-bg-weak-50/50 dark:hover:bg-bg-weak-50/10",
														"focus:outline-none focus-visible:bg-bg-weak-50/50",
													)}
												>
													{/* Status icon */}
													<span className="flex items-center justify-center">
														<Icon
															name={icon.name}
															className={cn(
																"h-3.5 w-3.5 shrink-0",
																icon.className,
															)}
															aria-label={icon.label}
														/>
													</span>

													{/* Status code */}
													<span
														className={cn(
															"font-medium font-mono text-[13px] tabular-nums",
															codeClass(log.status_code),
														)}
													>
														{log.status_code ?? "—"}
													</span>

													{/* Method + path */}
													<div className="flex min-w-0 items-center gap-2">
														{method ? (
															<span
																className={cn(
																	"shrink-0 font-semibold text-[11px] uppercase tracking-wide",
																	getMethodColorClass(method),
																)}
															>
																{method}
															</span>
														) : null}
														{primaryPath ? (
															<TruncatedPath path={primaryPath} />
														) : (
															<span className="text-text-soft-400 text-xs">
																—
															</span>
														)}
													</div>

													{/* Time */}
													<span className="shrink-0 text-right font-medium text-[13px] text-text-sub-600 tabular-nums">
														{formatTime(log.created_at)}
													</span>
												</button>
											);
										})}
									</div>
								</div>
							))}
						</Tooltip.Provider>
					)}
				</div>

				{/* Pagination — outside scrollable body */}
				{!isLoading && total > 0 && (
					<div
						className={cn(
							"flex shrink-0 items-center justify-between border-stroke-soft-100 border-t bg-bg-white-0 px-4 text-text-sub-600 dark:border-stroke-soft-100/40",
							isMobile ? "py-3 text-paragraph-sm" : "py-2 text-[11px]",
						)}
					>
						<div className="flex items-center gap-3">
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
		</div>
	);
};
