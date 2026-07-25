import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { useReceivedEmailsQuery } from "#/features/emails/hooks/use-emails-query";
import { queryKeys } from "#/lib/query-keys";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import { InboundStatusSelector } from "./inbound-status-selector";
import { MailboxSelector } from "./mailbox-selector";
import { ReceivedEmailTable } from "./received-email-table";

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

	const handleRefresh = () => {
		void queryClient.invalidateQueries({
			queryKey: queryKeys.emails.received(),
		});
	};

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
					<button
						type="button"
						onClick={handleRefresh}
						className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-stroke-soft-100/40"
						title="Refresh received emails"
					>
						<Icon name="rotate-cw" className="h-4 w-4" />
					</button>
				</div>

				{/* Full-width search */}
				<Input.Root size="small" className="w-full rounded-xl">
					<Input.Wrapper>
						<Input.Icon as={Icon} name="search" size="small" />
						<Input.Input
							placeholder="Search sender or subject..."
							value={searchQuery}
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
						{searchQuery && (
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
