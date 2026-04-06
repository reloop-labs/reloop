"use client";

import { PageSizeDropdown } from "@fe/dashboard/components/page-size-dropdown";
import { PaginationControls } from "@fe/dashboard/components/pagination-controls";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { parseAsInteger, useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { LogDrawer } from "./log-drawer";
import { LogTable } from "./log-table";
import {
	UnifiedLogFilterDropdown,
	type UnifiedLogFilters,
} from "./unified-log-filter";

interface LogData {
	uuid: string;
	event: string;
	level: string;
	source: string | null;
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

const SummaryCard = ({
	label,
	count,
	icon,
	isLoading,
}: {
	label: string;
	count?: number;
	icon: string;
	isLoading: boolean;
}) => (
	<div className="flex items-center gap-3 rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-4 py-3 dark:border-stroke-soft-100/50">
		<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-bg-weak-50">
			<Icon name={icon as any} className="h-4 w-4 text-text-sub-600" />
		</div>
		<div className="flex flex-col">
			<p className="text-text-sub-600 text-xs">{label}</p>
			{isLoading ? (
				<div className="mt-0.5 h-5 w-12 animate-pulse rounded bg-bg-weak-50" />
			) : (
				<p className="font-semibold text-sm text-text-strong-950">
					{count?.toLocaleString() || 0}
				</p>
			)}
		</div>
	</div>
);

export const LogList = () => {
	const { activeOrganization } = useUserOrganization();
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [currentPage, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);
	const [pageSize, setPageSize] = useQueryState(
		"limit",
		parseAsInteger.withDefault(10),
	);
	const [filters, setFilters] = useState<UnifiedLogFilters>({
		levels: [],
		status: null,
		startDate: null,
		endDate: null,
		datePreset: null,
	});

	// Drawer state
	const [drawerLogId, setDrawerLogId] = useState<string | null>(null);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	// Convert filters to API params
	const levelFilter = useMemo(() => {
		if (filters.levels.length === 0 || filters.levels.length === 5) return "";
		if (filters.levels.length === 1) return filters.levels[0];
		return "";
	}, [filters.levels]);

	// Build API URL with all filters
	const buildApiUrl = () => {
		if (!activeOrganization?.id) return null;

		const params = new URLSearchParams();
		params.set("limit", String(pageSize));
		params.set("page", String(currentPage));

		if (searchQuery) params.set("event", searchQuery);
		if (levelFilter) params.set("level", levelFilter);
		if (filters.startDate) params.set("start_date", filters.startDate);
		if (filters.endDate) params.set("end_date", filters.endDate);
		if (filters.status) params.set("status_code", filters.status);

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

	const handleFilterChange = (newFilters: UnifiedLogFilters) => {
		setFilters(newFilters);
		setCurrentPage(1);
	};

	const handleDownloadCSV = async () => {
		if (!data?.logs || data.logs.length === 0) return;

		try {
			const headers = ["Timestamp", "Event", "Level", "Source"];
			const csvRows = data.logs.map((log) => [
				new Date(log.created_at).toISOString(),
				log.event,
				log.level,
				log.source || "",
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
		} catch (error) {
			console.error("Failed to download CSV:", error);
		}
	};

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center gap-2 p-4">
				<Icon name="alert-circle" className="h-8 w-8 text-red-500" />
				<p className="text-center text-sm text-text-sub-600">
					Failed to load logs
				</p>
			</div>
		);
	}

	return (
		<div>
			{/* Summary Cards */}
			<div className="mb-4 grid grid-cols-3 gap-3">
				<SummaryCard
					label="Total Logs"
					icon="file-text"
					count={totalLogs}
					isLoading={isLoading}
				/>
				<SummaryCard
					label="Errors"
					icon="alert-triangle"
					count={(data?.stats?.error || 0) + (data?.stats?.fatal || 0)}
					isLoading={isLoading}
				/>
				<SummaryCard
					label="Warnings"
					icon="info-outline"
					count={data?.stats?.warn}
					isLoading={isLoading}
				/>
			</div>

			{/* Search + Filter + CSV toolbar */}
			<div className="flex items-center gap-3">
				<div className="flex-1">
					<Input.Root size="xsmall">
						<Input.Wrapper>
							<Input.Icon as={Icon} name="search" size="xsmall" />
							<Input.Input
								placeholder="Search events..."
								value={searchQuery}
								onChange={(e) => {
									setSearchQuery(e.target.value);
									setCurrentPage(1);
								}}
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>

				<UnifiedLogFilterDropdown
					value={filters}
					onChange={handleFilterChange}
				/>

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
			</div>

			{/* Table */}
			<div className="mt-4">
				<LogTable
					logs={data?.logs || []}
					activeOrganizationSlug={activeOrganization?.slug || ""}
					isLoading={isLoading}
					loadingRows={pageSize}
					onRowClick={(logId) => {
						setDrawerLogId(logId);
						setIsDrawerOpen(true);
					}}
				/>
			</div>

			{/* Log Drawer */}
			<LogDrawer
				logId={drawerLogId}
				isOpen={isDrawerOpen}
				onOpenChange={(open) => {
					setIsDrawerOpen(open);
					if (!open) setDrawerLogId(null);
				}}
				activeOrganizationSlug={activeOrganization?.slug || ""}
			/>

			{/* Pagination */}
			{data && totalLogs > 0 && (
				<div className="mt-4 flex items-center justify-between pb-8 text-paragraph-sm text-text-sub-600">
					<div className="flex items-center gap-3">
						<span>
							Showing {startIndex}–{endIndex} of {totalLogs} log
							{totalLogs !== 1 ? "s" : ""}
						</span>
						<PageSizeDropdown
							value={pageSize}
							onValueChange={(value) => {
								setPageSize(value);
								setCurrentPage(1);
							}}
						/>
					</div>
					<PaginationControls
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={setCurrentPage}
						isLoading={isLoading}
					/>
				</div>
			)}
		</div>
	);
};
