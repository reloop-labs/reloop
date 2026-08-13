import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Tooltip from "@reloop/ui/tooltip";
import { useQueryClient } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useCallback, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { dataTableToolbarControlClassName } from "#/components/data-table/toolbar-control";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { useSentEmailsQuery } from "#/features/emails/hooks/use-emails-query";
import { DateRangeFilter } from "#/features/logs/date-range-filter";
import { queryKeys } from "#/lib/query-keys";
import { ApiKeySelector } from "./api-key-selector";
import { DomainSelector } from "./domain-selector";
import { EmailTable } from "./email-table";
import { StatusSelector } from "./status-selector";

const SEARCH_INPUT_ID = "sent-emails-search-input";

export function EmailList() {
	const { activeOrganization } = useActiveOrganization();
	const queryClient = useQueryClient();
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);
	const [pageSize, setPageSize] = useQueryState(
		"limit",
		parseAsInteger.withDefault(10),
	);
	const [selectedDomain, setSelectedDomain] = useQueryState(
		"domain",
		parseAsString.withDefault(""),
	);
	const [selectedApiKey, setSelectedApiKey] = useQueryState(
		"api_key_id",
		parseAsString.withDefault(""),
	);
	const [selectedStatus, setSelectedStatus] = useQueryState(
		"status",
		parseAsString.withDefault(""),
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

	const searchInputRef = useRef<HTMLInputElement>(null);

	const focusSearch = useCallback(() => {
		const input =
			searchInputRef.current ?? document.getElementById(SEARCH_INPUT_ID);
		if (!(input instanceof HTMLInputElement)) return;
		input.focus();
		input.select();
	}, []);

	const listParams = {
		page: currentPage ?? 1,
		limit: pageSize ?? 10,
		search: searchQuery,
		domain: selectedDomain ?? "",
		apiKeyId: selectedApiKey ?? "",
		status: selectedStatus ?? "",
		startDate: startDate ?? "",
		endDate: endDate ?? "",
	};

	const { data, error, isPending, isFetching } = useSentEmailsQuery({
		...listParams,
		enabled: !!activeOrganization?.id,
	});

	const isLoading = isPending || (isFetching && !data);
	const totalLogs = data?.total || 0;

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

	const hasAnyFilter = !!(
		searchQuery ||
		selectedDomain ||
		selectedApiKey ||
		selectedStatus ||
		startDate ||
		endDate ||
		datePreset
	);

	const handleClearAll = () => {
		setSearchQuery("");
		void setSelectedDomain("");
		void setSelectedApiKey("");
		void setSelectedStatus("");
		void setStartDate("");
		void setEndDate("");
		void setDatePreset("");
		void setCurrentPage(1);
	};

	const handleRefresh = useCallback(() => {
		void queryClient.invalidateQueries({
			queryKey: [...queryKeys.emails.all, "sent"],
		});
	}, [queryClient]);

	useHotkeys(
		"r",
		(e) => {
			e.preventDefault();
			handleRefresh();
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys(
		"slash",
		(e) => {
			e.preventDefault();
			focusSearch();
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center gap-2 p-4">
				<Icon name="alert-circle" className="h-8 w-8 text-error-base" />
				<p className="text-center text-sm text-text-sub-600">
					Failed to load email logs
				</p>
			</div>
		);
	}

	return (
		<div>
			<div className="space-y-2">
				{/* Filters first — free space for full-width search below */}
				<div className="flex flex-wrap items-center gap-2">
					<DateRangeFilter
						startDate={startDate || null}
						endDate={endDate || null}
						activePreset={datePreset || null}
						onDateChange={handleDateChange}
					/>
					<StatusSelector
						value={selectedStatus ?? ""}
						onChange={(val) => {
							void setSelectedStatus(val);
							void setCurrentPage(1);
						}}
					/>
					<DomainSelector
						value={selectedDomain ?? ""}
						onChange={(val) => {
							void setSelectedDomain(val);
							void setCurrentPage(1);
						}}
					/>
					<ApiKeySelector
						value={selectedApiKey ?? ""}
						onChange={(val) => {
							void setSelectedApiKey(val);
							void setCurrentPage(1);
						}}
					/>
					{hasAnyFilter && (
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={handleClearAll}
							className="gap-1.5 rounded-xl"
						>
							Clear filters
						</Button.Root>
					)}
					<div className="ml-auto flex items-center gap-2">
						<Tooltip.Provider delayDuration={200}>
							<Tooltip.Root>
								<Tooltip.Trigger asChild>
									<button
										type="button"
										onClick={handleRefresh}
										disabled={isFetching}
										className={cn(
											dataTableToolbarControlClassName,
											"gap-2 px-1.5",
											isFetching ? "pointer-events-none" : "cursor-pointer",
										)}
										aria-label="Refresh sent emails"
										aria-keyshortcuts="r"
										aria-busy={isFetching}
									>
										<Icon
											name="rotate-cw"
											className={cn(
												"h-3.5 w-3.5 shrink-0",
												isFetching && "animate-spin",
											)}
										/>
										<ActionKbd>R</ActionKbd>
									</button>
								</Tooltip.Trigger>
								<Tooltip.Content
									side="top"
									sideOffset={-1}
									size="medium"
									variant="light"
									className="max-w-63 p-2.5"
								>
									<div className="flex items-start gap-2.5">
										<div
											className={cn(
												"mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
												"bg-bg-weak-50 ring-1 ring-stroke-soft-200",
											)}
											aria-hidden
										>
											<Icon
												name="rotate-cw"
												className={cn(
													"h-3.5 w-3.5 text-text-sub-600",
													isFetching && "animate-spin",
												)}
											/>
										</div>
										<div className="min-w-0 flex-1">
											<div className="flex items-center justify-between gap-3">
												<p className="font-medium text-label-sm text-text-strong-950">
													{isFetching ? "Refreshing…" : "Refresh"}
												</p>
												<ActionKbd>R</ActionKbd>
											</div>
											<p className="mt-0.5 text-paragraph-xs text-text-sub-600">
												{isFetching
													? "Fetching sent emails."
													: "Reload sent emails from the server."}
											</p>
										</div>
									</div>
								</Tooltip.Content>
							</Tooltip.Root>
						</Tooltip.Provider>
					</div>
				</div>

				{/* Full-width search */}
				<Input.Root size="small" className="w-full rounded-xl">
					<Input.Wrapper>
						<Input.Icon as={Icon} name="search" size="small" />
						<Input.Input
							id={SEARCH_INPUT_ID}
							ref={searchInputRef}
							placeholder="Search subject or sender..."
							value={searchQuery}
							aria-keyshortcuts="/"
							onChange={(e) => {
								setSearchQuery(e.target.value);
								void setCurrentPage(1);
							}}
							onKeyDown={(e) => {
								if (e.key === "Escape") {
									e.currentTarget.blur();
								}
							}}
						/>
						{searchQuery ? (
							<button
								type="button"
								onMouseDown={(e) => e.preventDefault()}
								onClick={() => {
									setSearchQuery("");
									void setCurrentPage(1);
								}}
								className="mr-1 rounded p-0.5 text-text-soft-400 transition-colors hover:bg-neutral-alpha-10 hover:text-text-strong-950"
							>
								<Icon name="cross" className="h-3 w-3" />
							</button>
						) : (
							<button
								type="button"
								tabIndex={-1}
								aria-label="Focus search"
								onMouseDown={(e) => {
									e.preventDefault();
									focusSearch();
								}}
								className="shrink-0 cursor-pointer rounded-[5px] outline-none focus-visible:ring-2 focus-visible:ring-stroke-strong-950"
							>
								<ActionKbd>/</ActionKbd>
							</button>
						)}
					</Input.Wrapper>
				</Input.Root>
			</div>

			<div className="mt-4">
				<EmailTable
					logs={data?.data || []}
					isLoading={isLoading}
					loadingRows={pageSize ?? 10}
					currentPage={currentPage ?? 1}
					pageSize={pageSize ?? 10}
					totalLogs={totalLogs}
					onPageChange={(page) => void setCurrentPage(page)}
					onPageSizeChange={(value) => {
						void setPageSize(value);
						void setCurrentPage(1);
					}}
					hasFilters={hasAnyFilter}
					onClearFilters={handleClearAll}
					variant="sent"
				/>
			</div>
		</div>
	);
}
