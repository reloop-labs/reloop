import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Tooltip from "@reloop/ui/tooltip";
import { useQueryClient } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useCallback, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { dataTableToolbarControlClassName } from "#/components/data-table/toolbar-control";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { useReceivedEmailsQuery } from "#/features/emails/hooks/use-emails-query";
import { queryKeys } from "#/lib/query-keys";
import { InboundStatusSelector } from "./inbound-status-selector";
import { MailboxSelector } from "./mailbox-selector";
import { ReceivedEmailTable } from "./received-email-table";

const SEARCH_INPUT_ID = "received-emails-search-input";

export function ReceivedEmailList() {
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
	const [selectedMailbox, setSelectedMailbox] = useQueryState(
		"mailbox",
		parseAsString.withDefault(""),
	);
	const [selectedStatus, setSelectedStatus] = useQueryState(
		"status",
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

	const { data, error, isPending, isFetching } = useReceivedEmailsQuery(
		!!activeOrganization?.id,
	);
	const isLoading = isPending || (isFetching && !data);

	const filteredLogs = useMemo(() => {
		if (!data) return [];
		return data.filter((log) => {
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				const fromMatch =
					log.fromEmail?.toLowerCase().includes(query) ||
					log.fromName?.toLowerCase().includes(query);
				const subjectMatch = log.subject?.toLowerCase().includes(query);
				if (!fromMatch && !subjectMatch) return false;
			}
			if (selectedMailbox && log.mailboxId !== selectedMailbox) {
				return false;
			}
			if (
				selectedStatus &&
				log.status?.toLowerCase() !== selectedStatus.toLowerCase()
			) {
				return false;
			}
			return true;
		});
	}, [data, searchQuery, selectedMailbox, selectedStatus]);

	const totalLogs = filteredLogs.length;

	const paginatedLogs = useMemo(() => {
		const page = currentPage ?? 1;
		const limit = pageSize ?? 10;
		const start = (page - 1) * limit;
		return filteredLogs.slice(start, start + limit);
	}, [filteredLogs, currentPage, pageSize]);

	const hasAnyFilter = !!(searchQuery || selectedMailbox || selectedStatus);

	const handleClearAll = () => {
		setSearchQuery("");
		void setSelectedMailbox("");
		void setSelectedStatus("");
		void setCurrentPage(1);
	};

	const handleRefresh = useCallback(() => {
		void queryClient.invalidateQueries({
			queryKey: queryKeys.emails.received(),
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
					Failed to load received emails
				</p>
			</div>
		);
	}

	return (
		<div>
			<div className="space-y-2">
				{/* Filters first — free space for full-width search below */}
				<div className="flex flex-wrap items-center gap-2">
					<InboundStatusSelector
						value={selectedStatus ?? ""}
						onChange={(val) => {
							void setSelectedStatus(val);
							void setCurrentPage(1);
						}}
					/>
					<MailboxSelector
						value={selectedMailbox ?? ""}
						onChange={(val) => {
							void setSelectedMailbox(val);
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
										aria-label="Refresh received emails"
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
													? "Fetching received emails."
													: "Reload received emails from the server."}
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
							placeholder="Search sender or subject..."
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
				<ReceivedEmailTable
					logs={paginatedLogs}
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
				/>
			</div>
		</div>
	);
}
