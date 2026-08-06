import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import * as Tooltip from "@reloop/ui/tooltip";
import { PageSizeDropdown } from "#/features/api-keys/table/page-size-dropdown";
import { PaginationControls } from "#/features/api-keys/table/pagination-controls";
import { formatDisplayEndpoint } from "./format-endpoint";
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
	/** When true, omit outer card chrome (used inside unified split pane) */
	embedded?: boolean;
}

/** Stripe-like row: [status badge] [METHOD] [path…] [time] */
const GRID_COLS = "grid-cols-[auto_auto_minmax(0,1fr)_auto]";

type BadgeColor =
	| "gray"
	| "blue"
	| "orange"
	| "red"
	| "green"
	| "yellow"
	| "purple"
	| "sky"
	| "pink"
	| "teal";

function statusBadge(statusCode: number | null | undefined): {
	label: string;
	color: BadgeColor;
} {
	if (!statusCode) {
		return { label: "—", color: "gray" };
	}
	if (statusCode >= 200 && statusCode < 300) {
		return { label: `${statusCode} OK`, color: "gray" };
	}
	if (statusCode >= 300 && statusCode < 400) {
		return { label: `${statusCode}`, color: "blue" };
	}
	if (statusCode >= 400 && statusCode < 500) {
		return { label: `${statusCode}`, color: "orange" };
	}
	return { label: `${statusCode}`, color: "red" };
}

const getMethodColorClass = (method: string) => {
	switch (method?.toUpperCase()) {
		case "GET":
			return "text-success-base";
		case "POST":
			return "text-information-base";
		case "PUT":
		case "PATCH":
			return "text-warning-base";
		case "DELETE":
			return "text-error-base";
		case "SMTP":
			return "text-feature-base";
		default:
			return "text-text-sub-600";
	}
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

/** Format date header as "APR 3, 2024" (Stripe-style) */
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
	const endpoint = formatDisplayEndpoint(rawEndpoint);
	return { method, endpoint };
};

function TruncatedPath({ path }: { path: string }) {
	return (
		<span className="min-w-0 truncate font-mono text-[13px] text-text-strong-950">
			{path}
		</span>
	);
}

function LogRowSkeleton() {
	return (
		<div
			className={cn("grid w-full items-center gap-3 px-4 py-2.5", GRID_COLS)}
		>
			<Skeleton className="h-5 w-14 rounded-md" />
			<Skeleton className="h-3.5 w-10 rounded" />
			<Skeleton className="h-3.5 w-full max-w-[200px] rounded" />
			<Skeleton className="h-3.5 w-16 rounded" />
		</div>
	);
}

function LogDateBandSkeleton() {
	return (
		<div className="sticky top-0 z-10 flex items-center gap-2 border-stroke-soft-100 border-b bg-bg-white-0 px-4 py-2 dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5">
			<Skeleton className="h-3 w-28 rounded" />
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
	embedded = false,
}: LogTableProps) => {
	const body = (
		<>
			<div
				className={cn(
					"min-h-0 flex-1",
					!isMobile && "overflow-y-auto",
					!embedded &&
						"divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/50",
				)}
			>
				{isLoading ? (
					<>
						<LogDateBandSkeleton />
						{Array.from({ length: loadingRows }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
							<LogRowSkeleton key={`skel-${i}`} />
						))}
					</>
				) : logs.length === 0 ? (
					hasFilters ? (
						<div className="flex flex-col items-center px-6 py-16 text-center">
							<div className="mb-4 flex items-center justify-center">
								<Icon name="search" className="h-8 w-8 text-text-sub-600" />
							</div>
							<h3 className="mb-2 font-semibold text-lg text-text-strong-950">
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
						<div className="flex flex-col items-center px-6 py-16 text-center">
							<div className="mb-4 flex items-center justify-center">
								<Icon name="logs" className="h-8 w-8 text-text-sub-600" />
							</div>
							<h3 className="mb-2 font-semibold text-lg text-text-strong-950">
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
								{/* Date section — flat label, no band fill */}
								<div className="sticky top-0 z-10 flex items-center gap-2 border-stroke-soft-100 border-b bg-bg-white-0 px-4 py-2 dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5">
									<span className="font-medium text-[11px] text-text-sub-600 tracking-wide">
										{group.dateLabel}
									</span>
								</div>

								{/* Log rows */}
								<div>
									{group.logs.map((log) => {
										const { method, endpoint } = getMethodAndEndpoint(log);
										const badge = statusBadge(log.status_code);
										const isSelected = selectedLogId === log.uuid;
										const primaryPath = endpoint || log.event;

										return (
											<button
												key={log.uuid}
												type="button"
												onClick={() => onRowClick?.(log.uuid)}
												className={cn(
													"group/row relative grid w-full cursor-pointer items-center gap-2.5 border-stroke-soft-100 border-b px-4 py-2.5 text-left transition-colors duration-100 last:border-b-0 dark:border-stroke-soft-100/40",
													GRID_COLS,
													isSelected
														? "bg-bg-soft-50 dark:bg-bg-soft-50/20"
														: "hover:bg-bg-weak-50/70 dark:hover:bg-bg-weak-50/20",
													"focus:outline-none focus-visible:bg-bg-weak-50",
												)}
											>
												{/* Selected accent bar */}
												{isSelected && (
													<span
														aria-hidden
														className="absolute inset-y-0 left-0 w-[3px] bg-primary-base"
													/>
												)}

												{/* Status badge — "200 OK" pill */}
												<Badge.Root
													variant="lighter"
													color={badge.color}
													size="medium"
													className="h-[22px] shrink-0 rounded-md px-1.5 font-medium text-[11px] tabular-nums tracking-normal"
												>
													{badge.label}
												</Badge.Root>

												{/* Method */}
												{method ? (
													<span
														className={cn(
															"shrink-0 font-semibold text-[11px] uppercase tracking-wide",
															getMethodColorClass(method),
														)}
													>
														{method}
													</span>
												) : (
													<span className="w-8 shrink-0" />
												)}

												{/* Path */}
												{primaryPath ? (
													<TruncatedPath path={primaryPath} />
												) : (
													<span className="text-text-soft-400 text-xs">—</span>
												)}

												{/* Time */}
												<span
													className={cn(
														"shrink-0 text-right text-[12px] tabular-nums underline-offset-2",
														isSelected
															? "font-medium text-text-strong-950"
															: "text-text-sub-600 group-hover/row:underline",
													)}
												>
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
						"flex shrink-0 items-center justify-between border-stroke-soft-100 border-t bg-bg-white-0 px-4 text-text-sub-600 dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5",
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
		</>
	);

	if (embedded) {
		return (
			<div
				className={cn(
					"flex h-full min-h-0 w-full flex-col text-paragraph-sm",
					!isMobile && "flex-1",
				)}
			>
				{body}
			</div>
		);
	}

	return (
		<div
			className={cn(
				"flex w-full flex-col overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 text-paragraph-sm dark:border-stroke-soft-100/40",
				!isMobile && "min-h-0 flex-1",
			)}
			style={!isMobile ? { maxHeight: "calc(100vh - 220px)" } : undefined}
		>
			{body}
		</div>
	);
};
