import * as Badge from "@reloop/ui/badge";
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
const GRID_COLS = "grid-cols-[62px_44px_minmax(0,1fr)_64px]";

/** Returns status label and badge color */
const getStatusProps = (statusCode: number | null | undefined) => {
	if (!statusCode) return null;

	let label = `${statusCode}`;
	let color: "gray" | "blue" | "orange" | "red" = "gray";

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

/** Format time as "4:24 PM" (no seconds — date band provides day context) */
const formatTime = (dateStr: string) => {
	return new Date(dateStr).toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
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
				<span className="min-w-0 truncate font-mono text-text-strong-950 text-xs">
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
		<div className={cn("grid items-center gap-2 px-4 py-2.5", GRID_COLS)}>
			<Skeleton className="h-[18px] w-14 rounded-md" />
			<Skeleton className="h-3.5 w-9 rounded" />
			<Skeleton className="h-3.5 w-full max-w-[220px] rounded" />
			{/* Time — square, no rounded corners */}
			<Skeleton className="ml-auto h-3.5 w-14 rounded-none" />
		</div>
	);
}

function LogDateBandSkeleton() {
	return (
		<div className="sticky top-0 z-10 flex items-center gap-2 border-stroke-soft-100 border-b bg-bg-weak-50/70 px-4 py-1.5 backdrop-blur-md dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/50">
			<Icon name="calendar" className="h-3 w-3 shrink-0 text-text-soft-400" />
			<Skeleton className="h-3 w-24 rounded-none" />
			<Skeleton className="h-4 min-w-4 rounded-md" />
		</div>
	);
}

function LogTableHeader() {
	return (
		<div
			className={cn(
				"grid items-center gap-2 rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l px-4 pt-2.5 pb-5 font-medium text-text-sub-600 dark:border-[#101010]",
				GRID_COLS,
			)}
		>
			<div className="flex items-center gap-1.5 text-xs">
				<Icon name="check-circle" className="h-3.5 w-3.5" />
				<span>Status</span>
			</div>
			<div className="flex items-center gap-1.5 text-xs">
				<span>Method</span>
			</div>
			<div className="flex items-center gap-1.5 text-xs">
				<Icon name="activity-2" className="h-3.5 w-3.5" />
				<span>Request</span>
			</div>
			<div className="flex items-center justify-end gap-1.5 text-xs">
				<Icon name="clock" className="h-3.5 w-3.5" />
				<span>Time</span>
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
			{/* Soft overlapping header — always visible (matches API keys / loading shell) */}
			<LogTableHeader />

			{/* Body card overlaps header */}
			<div
				className={cn(
					"-mt-2.5 flex min-h-0 flex-col overflow-hidden border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40",
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
											const statusProps = getStatusProps(log.status_code);
											const isSelected = selectedLogId === log.uuid;
											const primaryPath = endpoint || log.event;

											return (
												<button
													key={log.uuid}
													type="button"
													onClick={() => onRowClick?.(log.uuid)}
													className={cn(
														"group/row grid w-full cursor-pointer items-center gap-2 px-4 py-2 text-left transition-colors duration-150",
														GRID_COLS,
														isSelected
															? "bg-bg-weak-50/50"
															: "hover:bg-bg-weak-50/50 dark:hover:bg-bg-weak-50/10",
														"focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-inset",
													)}
												>
													{/* Status */}
													<div className="flex w-full flex-shrink-0 items-center justify-start">
														{statusProps ? (
															<Badge.Root
																variant="lighter"
																color={statusProps.color}
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
																? getMethodColorClass(method)
																: "text-text-soft-400",
														)}
													>
														{method || "—"}
													</span>

													{/* Endpoint / Event */}
													{primaryPath ? (
														<TruncatedPath path={primaryPath} />
													) : (
														<span className="text-text-soft-400 text-xs">
															—
														</span>
													)}

													{/* Time */}
													<span className="flex-shrink-0 text-right text-text-sub-600 text-xs tabular-nums">
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
					<div className="flex flex-shrink-0 items-center justify-between border-stroke-soft-100 border-t bg-bg-white-0 px-4 py-2 text-label-xs text-text-sub-600 dark:border-stroke-soft-100/40">
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
		</div>
	);
};
