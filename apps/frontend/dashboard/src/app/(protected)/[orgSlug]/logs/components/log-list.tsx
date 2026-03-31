import { PageSizeDropdown } from "@fe/dashboard/components/page-size-dropdown";
import { PaginationControls } from "@fe/dashboard/components/pagination-controls";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import useSWR from "swr";
import { LogTable } from "./log-table";

interface LogData {
	uuid: string;
	service: string;
	event: string;
	level: string;
	occurred_at: string;
}

interface LogListResponse {
	logs: LogData[];
	count: number;
	totalErrors?: number;
	totalWarnings?: number;
}

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

	const { data, error, isLoading } = useSWR<LogListResponse>(
		activeOrganization?.id
			? `/api/logs/v1/list?limit=${pageSize}&page=${currentPage}${
					searchQuery ? `&event=${searchQuery}` : ""
				}`
			: null,
		{
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
		},
	);

	const totalLogs = data?.count || 0;
	const totalPages = Math.ceil(totalLogs / pageSize) || 1;
	const startIndex = (currentPage - 1) * pageSize + 1;
	const endIndex = Math.min(currentPage * pageSize, totalLogs);

	const handleDownloadCSV = async () => {
		if (!data?.logs || data.logs.length === 0) return;

		try {
			const headers = ["Timestamp", "Service", "Event", "Level"];
			const csvRows = data.logs.map((log) => [
				new Date(log.occurred_at).toISOString(),
				log.service,
				log.event,
				log.level,
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

	return (
		<div className="pb-8">
			<div>
				{error ? (
					<div className="flex flex-col items-center justify-center gap-2 p-12">
						<Icon name="alert-triangle" className="h-8 w-8 text-error-base" />
						<p className="text-center text-sm text-text-sub-600">
							Failed to load logs. Please try again later.
						</p>
					</div>
				) : (
					<div className="flex flex-col gap-4">
						<div className="flex items-center gap-3">
							<div className="flex-1">
								<Input.Root size="xsmall">
									<Input.Wrapper>
										<Input.Icon as={Icon} name="search" size="xsmall" />
										<Input.Input
											type="text"
											placeholder="Search by event name..."
											value={searchQuery}
											onChange={(e) => {
												setSearchQuery(e.target.value);
												setCurrentPage(1);
											}}
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>

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

						<div className="mt-4">
							<LogTable
								logs={data?.logs || []}
								activeOrganizationSlug={activeOrganization?.slug || ""}
								isLoading={isLoading}
								loadingRows={pageSize}
							/>
						</div>

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
				)}
			</div>
		</div>
	);
};
