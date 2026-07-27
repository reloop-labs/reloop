import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as TabMenuHorizontal from "@reloop/ui/tab-menu-horizontal";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { queryKeys } from "#/lib/query-keys";
import { DateRangeFilter } from "./date-range-filter";
import { useLogsQuery } from "./hooks/use-logs-query";
import { LogDetailPanel } from "./log-detail-panel";
import { LogDrawer } from "./log-drawer";
import { LogTable } from "./log-table";
import { StatusFilterDropdown } from "./status-filter-dropdown";

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
		iconColor: "text-success-base",
	},
	{
		id: "failed",
		label: "Failed",
		icon: "cross-circle",
		iconColor: "text-error-base",
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

export function LogList({
	actorId,
}: {
	actorId?: string;
	/** @deprecated unused; kept for call-site compatibility */
	hideDocs?: boolean;
}) {
	const { activeOrganization } = useActiveOrganization();
	const queryClient = useQueryClient();
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

	const activeIndex = OUTCOME_TABS.findIndex((tab) => tab.id === outcomeTab);
	const currentIdx = hoveredIdx !== undefined ? hoveredIdx : activeIndex;
	const tabEl = buttonRefs.current[currentIdx];
	const rect = tabEl?.getBoundingClientRect();

	// Mobile drawer state (for narrow viewports)
	const [drawerOpen, setDrawerOpen] = useState(false);
	const isMobile = useMediaQuery("(max-width: 1023px)");

	useEffect(() => {
		if (isMobile && selectedLogId) {
			setDrawerOpen(true);
		}
	}, [isMobile, selectedLogId]);

	const listParams = {
		page: currentPage ?? 1,
		limit: pageSize ?? 25,
		search: searchQuery ?? "",
		startDate: startDate ?? "",
		endDate: endDate ?? "",
		statusCode: statusCode ?? "",
		outcome: outcomeTab ?? "all",
		actorId: actorId ?? "",
	};

	const { data, error, isPending, isFetching } = useLogsQuery({
		...listParams,
		enabled: !!activeOrganization?.id,
	});
	const isLoading = isPending || (isFetching && !data);

	const totalLogs = data?.count || 0;
	const totalPages = Math.ceil(totalLogs / (pageSize ?? 25)) || 1;
	const startIndex = ((currentPage ?? 1) - 1) * (pageSize ?? 25) + 1;
	const endIndex = Math.min((currentPage ?? 1) * (pageSize ?? 25), totalLogs);

	const handleDateChange = (
		newStartDate: string | null,
		newEndDate: string | null,
		preset: string | null,
	) => {
		void setStartDate(newStartDate || "");
		void setEndDate(newEndDate || "");
		void setDatePreset(preset || "");
		void setCurrentPage(1);
	};

	const handleClearAll = () => {
		void setSearchQuery("");
		void setStatusCode("");
		void setStartDate("");
		void setEndDate("");
		void setDatePreset("");
		void setOutcomeTab("all");
		void setCurrentPage(1);
	};

	const hasAnyFilter =
		searchQuery || statusCode || startDate || endDate || outcomeTab !== "all";

	const handleRefresh = () => {
		void queryClient.invalidateQueries({
			queryKey: [...queryKeys.logs.all, "list"],
		});
	};

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

	return (
		<div className="flex min-h-0 flex-col">
			{/* Outcome tabs — same height as Emails Sent/Received */}
			<TabMenuHorizontal.Root
				value={outcomeTab || "all"}
				onValueChange={(val) => {
					void setOutcomeTab(val);
					void setCurrentPage(1);
				}}
			>
				<TabMenuHorizontal.List className="relative h-11 gap-0 border-b-0! py-0 [&_[aria-hidden=true]]:hidden">
					{OUTCOME_TABS.map((tab, index) => (
						<TabMenuHorizontal.Trigger
							key={tab.id}
							ref={(el) => {
								if (el) buttonRefs.current[index] = el;
							}}
							value={tab.id}
							onPointerEnter={() => setHoveredIdx(index)}
							onPointerLeave={() => setHoveredIdx(undefined)}
							className={cn(
								"flex cursor-pointer items-center gap-2 px-3 py-0! font-medium text-sm",
								hoveredIdx === undefined &&
									activeIndex === index &&
									"text-text-strong-950",
							)}
						>
							{tab.icon && (
								<Icon
									name={tab.icon}
									className={cn("h-4 w-4", tab.iconColor)}
								/>
							)}
							{tab.label}
						</TabMenuHorizontal.Trigger>
					))}
					<AnimatePresence>
						{rect && activeIndex !== -1 ? (
							<motion.div
								className="absolute top-0 left-0 rounded-xl bg-neutral-alpha-10"
								initial={{
									pointerEvents: "none",
									width: rect.width,
									height: rect.height - 14,
									left:
										rect.left -
										(tabEl?.offsetParent?.getBoundingClientRect().left || 0),
									top:
										rect.top -
										(tabEl?.offsetParent?.getBoundingClientRect().top || 0) +
										7,
									opacity: 0,
								}}
								animate={{
									pointerEvents: "none",
									width: rect.width,
									height: rect.height - 14,
									left:
										rect.left -
										(tabEl?.offsetParent?.getBoundingClientRect().left || 0),
									top:
										rect.top -
										(tabEl?.offsetParent?.getBoundingClientRect().top || 0) +
										7,
									opacity: 1,
								}}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.14 }}
							/>
						) : null}
					</AnimatePresence>
				</TabMenuHorizontal.List>
			</TabMenuHorizontal.Root>

			{/* Filter bar — all controls share h-9 */}
			<div className="flex flex-wrap items-center gap-2 pt-4">
				<div className="min-w-[200px] flex-1">
					<Input.Root size="small" className="h-9 rounded-xl">
						<Input.Wrapper>
							<Input.Icon as={Icon} name="search" size="small" />
							<Input.Input
								placeholder="Filter by resource ID..."
								value={searchQuery}
								onChange={(e) => {
									void setSearchQuery(e.target.value);
									void setCurrentPage(1);
								}}
							/>
							{(searchQuery ?? "") && (
								<button
									type="button"
									onMouseDown={(e) => e.preventDefault()}
									onClick={() => {
										void setSearchQuery("");
										void setCurrentPage(1);
									}}
									className="mr-1 rounded p-0.5 text-text-soft-400 transition-colors hover:bg-neutral-alpha-10 hover:text-text-strong-950"
								>
									<Icon name="cross" className="h-3 w-3" />
								</button>
							)}
						</Input.Wrapper>
					</Input.Root>
				</div>

				<DateRangeFilter
					startDate={startDate || null}
					endDate={endDate || null}
					activePreset={datePreset || null}
					onDateChange={handleDateChange}
				/>

				<StatusFilterDropdown
					value={statusCode || null}
					onChange={(val) => {
						void setStatusCode(val || "");
						void setCurrentPage(1);
					}}
				/>

				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="small"
					onClick={handleDownloadCSV}
					disabled={!data?.logs || data.logs.length === 0}
					title="Export CSV"
					className="h-9 rounded-xl"
				>
					<Icon name="file-download" className="h-4 w-4" />
					<span className="hidden sm:inline">Export</span>
				</Button.Root>

				{hasAnyFilter && (
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="small"
						onClick={handleClearAll}
						className="h-9 rounded-xl"
					>
						Clear all
					</Button.Root>
				)}

				<button
					type="button"
					onClick={handleRefresh}
					className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-stroke-soft-100/40"
					title="Refresh logs"
				>
					<Icon
						name="rotate-cw"
						className={cn("h-4 w-4", isFetching && "animate-spin")}
					/>
				</button>
			</div>

			{/* Split panel */}
			<div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start">
				{/* LEFT — Log list */}
				<div
					className={cn(
						"w-full text-paragraph-sm",
						!isMobile && "sticky top-4 w-[480px] shrink-0 self-start",
					)}
				>
					{error ? (
						<div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-8 dark:border-stroke-soft-100/40">
							<Icon name="alert-circle" className="h-8 w-8 text-error-base" />
							<p className="text-center text-sm text-text-sub-600">
								Failed to load logs
							</p>
						</div>
					) : (
						<LogTable
							logs={data?.logs || []}
							isLoading={isLoading}
							loadingRows={8}
							selectedLogId={selectedLogId}
							onRowClick={(logId) => {
								void setSelectedLogId(logId);
								if (isMobile) {
									setDrawerOpen(true);
								}
							}}
							hasFilters={!!hasAnyFilter}
							onClearFilters={handleClearAll}
							total={totalLogs}
							currentPage={currentPage ?? 1}
							pageSize={pageSize ?? 25}
							totalPages={totalPages}
							startIndex={startIndex}
							endIndex={endIndex}
							onPageChange={(p) => void setCurrentPage(p)}
							onPageSizeChange={(value) => {
								void setPageSize(value);
								void setCurrentPage(1);
							}}
							isMobile={isMobile}
						/>
					)}
				</div>

				{/* RIGHT — Inline detail panel */}
				{!isMobile && (
					<div className="min-w-0 flex-1 rounded-3xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5">
						{selectedLogId ? (
							<LogDetailPanel logId={selectedLogId} />
						) : (
							<div className="flex min-h-[500px] flex-col items-center justify-center gap-1 p-8 text-center">
								<div className="mb-4 flex items-center justify-center">
									<Icon name="logs" className="h-8 w-8 text-text-sub-600" />
								</div>
								<h3 className="font-semibold text-base text-text-strong-950">
									Select a log to inspect
								</h3>
								<p className="mx-auto max-w-sm text-balance font-medium text-[12px] text-text-sub-600">
									Click any row on the left to view its request details, status,
									and response body.
								</p>
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
					if (!open) void setSelectedLogId(null);
				}}
			/>
		</div>
	);
}
