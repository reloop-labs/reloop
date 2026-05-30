"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { DateRangeFilter } from "./date-range-filter";
import { LogDetailPanel } from "./log-detail-panel";
import { LogDrawer } from "./log-drawer";
import { LogTable } from "./log-table";
import { LogsApiDetails } from "./logs-api-details";
import { StatusFilterDropdown } from "./status-filter-dropdown";

interface LogData {
	uuid: string;
	event: string;
	level: string;
	status_code?: number | null;
	created_at: string;
	trace_id?: string | null;
	metadata?: Record<string, unknown>;
	requestDetails?: Record<string, unknown>;
}

interface LevelStats {
	debug: number;
	info: number;
	warn: number;
	error: number;
	fatal: number;
}

interface LogListResponse {
	logs: LogData[];
	count: number;
	stats?: LevelStats;
}

/** Outcome tab type */
type OutcomeTab = "all" | "succeeded" | "failed";

const OUTCOME_TABS: {
	id: OutcomeTab;
	label: string;
	icon?: string;
	iconColor?: string;
}[] = [
	{ id: "all", label: "All" },
	{
		id: "succeeded",
		label: "Success",
		icon: "check-circle",
		iconColor: "text-green-500",
	},
	{
		id: "failed",
		label: "Failed",
		icon: "cross-circle",
		iconColor: "text-red-500",
	},
];

const useMediaQuery = (query: string) => {
	const [matches, setMatches] = useState(false);

	useEffect(() => {
		const media = window.matchMedia(query);
		if (media.matches !== matches) {
			setMatches(media.matches);
		}
		const listener = () => setMatches(media.matches);
		media.addEventListener("change", listener);
		return () => media.removeEventListener("change", listener);
	}, [matches, query]);

	return matches;
};

export const LogList = ({
	actorId,
	hideDocs,
}: {
	actorId?: string;
	hideDocs?: boolean;
}) => {
	const { activeOrganization } = useUserOrganization();
	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const [searchQuery, setSearchQuery] = useQueryState(
		"search",
		parseAsString.withDefault(""),
	);
	const [outcomeTab, setOutcomeTab] = useQueryState(
		"outcome",
		parseAsString.withDefault("all"),
	);
	const [currentPage, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);
	const [pageSize, setPageSize] = useQueryState(
		"limit",
		parseAsInteger.withDefault(25),
	);
	const [startDate, setStartDate] = useQueryState(
		"start_date",
		parseAsString.withDefault(""),
	);
	const [endDate, setEndDate] = useQueryState(
		"end_date",
		parseAsString.withDefault(""),
	);
	const [datePreset, setDatePreset] = useQueryState(
		"preset",
		parseAsString.withDefault(""),
	);
	const [statusCode, setStatusCode] = useQueryState(
		"status_code",
		parseAsString.withDefault(""),
	);

	// Selected log for the inline detail panel
	const [selectedLogId, setSelectedLogId] = useQueryState(
		"log",
		parseAsString.withDefault(""),
	);

	const activeIdx = OUTCOME_TABS.findIndex((tab) => tab.id === outcomeTab);
	const activeEl = buttonRefs.current[activeIdx];
	const currentEl =
		hoveredIdx !== undefined ? buttonRefs.current[hoveredIdx] : activeEl;
	const currentRect = currentEl?.getBoundingClientRect();

	// Mobile drawer state (for narrow viewports)
	const [drawerOpen, setDrawerOpen] = useState(false);
	const isMobile = useMediaQuery("(max-width: 1023px)");

	useEffect(() => {
		if (isMobile && selectedLogId) {
			setDrawerOpen(true);
		}
	}, [isMobile, selectedLogId]);

	// Build API URL
	const buildApiUrl = () => {
		if (!activeOrganization?.id) return null;

		const params = new URLSearchParams();
		params.set("limit", String(pageSize));
		params.set("page", String(currentPage));

		if (searchQuery) params.set("event", searchQuery);
		if (startDate) params.set("start_date", startDate);
		if (endDate) params.set("end_date", endDate);
		if (actorId) params.set("actor_id", actorId);

		// Map outcome tab → status code filter
		if (outcomeTab === "succeeded" && !statusCode) {
			params.set("status_code", "successes");
		} else if (outcomeTab === "failed" && !statusCode) {
			params.set("status_code", "errors");
		} else if (statusCode) {
			params.set("status_code", statusCode);
		}

		return `/api/logs/v1/list?${params.toString()}`;
	};

	const { data, error, isLoading } = useSWR<LogListResponse>(buildApiUrl(), {
		revalidateOnFocus: true,
		revalidateOnReconnect: true,
	});

	const totalLogs = data?.count || 0;
	const totalPages = Math.ceil(totalLogs / pageSize) || 1;
	const startIndex = (currentPage - 1) * pageSize + 1;
	const endIndex = Math.min(currentPage * pageSize, totalLogs);

	const handleDateChange = (
		newStartDate: string | null,
		newEndDate: string | null,
		preset: string | null,
	) => {
		setStartDate(newStartDate || "");
		setEndDate(newEndDate || "");
		setDatePreset(preset || "");
		setCurrentPage(1);
	};

	const handleClearAll = () => {
		setSearchQuery("");
		setStatusCode("");
		setStartDate("");
		setEndDate("");
		setDatePreset("");
		setOutcomeTab("all");
		setCurrentPage(1);
	};

	const hasAnyFilter =
		searchQuery || statusCode || startDate || endDate || outcomeTab !== "all";

	const handleDownloadCSV = async () => {
		if (!data?.logs || data.logs.length === 0) return;
		try {
			const headers = ["Timestamp", "Event", "Level", "Status"];
			const csvRows = data.logs.map((log) => [
				new Date(log.created_at).toISOString(),
				log.event,
				log.level,
				String(log.status_code || ""),
			]);
			const csvContent = [
				headers.join(","),
				...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
			].join("\n");
			const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
			const link = document.createElement("a");
			link.href = URL.createObjectURL(blob);
			link.download = `logs_${new Date().toISOString().split("T")[0]}.csv`;
			link.click();
			URL.revokeObjectURL(link.href);
		} catch (err) {
			console.error("Failed to download CSV:", err);
		}
	};

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center gap-2 p-8">
				<Icon name="alert-circle" className="h-8 w-8 text-error-base" />
				<p className="text-center text-sm text-text-sub-600">
					Failed to load logs
				</p>
			</div>
		);
	}

	return (
		<div className="flex min-h-0 flex-col">
			<div className="relative mt-6 flex items-center gap-2 py-3">
				{OUTCOME_TABS.map((tab, idx) => (
					<button
						key={tab.id}
						ref={(el) => {
							if (el) buttonRefs.current[idx] = el;
						}}
						type="button"
						onPointerEnter={() => setHoveredIdx(idx)}
						onPointerLeave={() => setHoveredIdx(undefined)}
						onClick={() => {
							setOutcomeTab(tab.id);
							setCurrentPage(1);
						}}
						className={cn(
							"relative z-10 inline-flex items-center gap-1.5 rounded-lg px-3 py-1 font-medium text-sm transition-all",
							outcomeTab === tab.id
								? "text-text-strong-950"
								: "text-text-sub-600 hover:text-text-strong-950",
						)}
					>
						{tab.icon && (
							<Icon
								name={tab.icon as any}
								className={cn("h-3.5 w-3.5", tab.iconColor)}
							/>
						)}
						{tab.label}
					</button>
				))}
				<AnimatedHoverBackground
					rect={currentRect}
					tabElement={currentEl}
					className="bg-bg-weak-50 ring-1 ring-stroke-soft-100 dark:bg-bg-weak-50/20 dark:ring-stroke-soft-100/40"
				/>
			</div>

			{/* ── Filter Bar ── */}
			<div className="flex flex-wrap items-center gap-2 px-0 pt-3 pb-2 dark:border-stroke-soft-100/40">
				{/* Search */}
				<div className="w-48">
					<Input.Root size="xsmall" className="rounded-xl">
						<Input.Wrapper>
							<Input.Icon as={Icon} name="search" size="xsmall" />
							<Input.Input
								placeholder="Filter by resource ID..."
								value={searchQuery}
								onChange={(e) => {
									setSearchQuery(e.target.value);
									setCurrentPage(1);
								}}
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>

				{/* Date */}
				<DateRangeFilter
					startDate={startDate || null}
					endDate={endDate || null}
					activePreset={datePreset || null}
					onDateChange={handleDateChange}
				/>

				{/* Status */}
				<StatusFilterDropdown
					value={statusCode || null}
					onChange={(val) => {
						setStatusCode(val || "");
						setCurrentPage(1);
					}}
				/>

				{/* Export CSV */}
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					onClick={handleDownloadCSV}
					disabled={!data?.logs || data.logs.length === 0}
					title="Export CSV"
				>
					<Icon name="file-download" className="h-4 w-4" />
				</Button.Root>

				<div className="ml-auto flex items-center gap-2">
					{hasAnyFilter && (
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="xsmall"
							onClick={handleClearAll}
						>
							Clear all
						</Button.Root>
					)}
					{!hideDocs && <LogsApiDetails size="xsmall" mode="ghost" />}
				</div>
			</div>

			{/* ── Split Panel ── */}
			<div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start">
				{/* LEFT — Log list */}
				<div
					className={cn(
						"w-full text-paragraph-sm",
						!isMobile && "sticky top-4 w-[480px] flex-shrink-0 self-start",
					)}
				>
					<LogTable
						logs={data?.logs || []}
						isLoading={isLoading}
						loadingRows={pageSize}
						selectedLogId={selectedLogId}
						onRowClick={(logId) => {
							setSelectedLogId(logId);
							if (isMobile) {
								setDrawerOpen(true);
							}
						}}
						hasFilters={!!hasAnyFilter}
						onClearFilters={handleClearAll}
						total={totalLogs}
						currentPage={currentPage}
						pageSize={pageSize}
						totalPages={totalPages}
						startIndex={startIndex}
						endIndex={endIndex}
						onPageChange={setCurrentPage}
						onPageSizeChange={(value) => {
							setPageSize(value);
							setCurrentPage(1);
						}}
						isMobile={isMobile}
					/>
				</div>

				{/* RIGHT — Inline detail panel */}
				{!isMobile && (
					<div className="min-w-0 flex-1 rounded-3xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5">
						{selectedLogId ? (
							<LogDetailPanel logId={selectedLogId} />
						) : (
							<div className="flex min-h-[500px] flex-col items-center justify-center gap-1 p-8 text-center">
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/50">
									<Icon name="search" className="h-5 w-5 text-text-sub-600" />
								</div>
								<h3 className="font-semibold text-base text-text-strong-950">
									Select a log to inspect
								</h3>
								<p className="mx-auto max-w-sm text-balance font-medium text-[12px] text-text-sub-600">
									Click any row on the left to view its request details, status,
									and response body.
								</p>
								<div className="mt-4 flex items-center gap-1.5 text-text-soft-400 text-xs">
									<Icon name="arrow-left" className="h-3.5 w-3.5" />
									<span className="font-medium">
										Pick a log entry to get started
									</span>
								</div>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Mobile drawer (only visible on narrow screens) */}
			<LogDrawer
				logId={drawerOpen ? selectedLogId : null}
				isOpen={drawerOpen}
				onOpenChange={(open) => {
					setDrawerOpen(open);
					if (!open) setSelectedLogId(null);
				}}
			/>
		</div>
	);
};
