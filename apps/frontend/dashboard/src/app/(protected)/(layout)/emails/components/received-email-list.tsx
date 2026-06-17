"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { InboundStatusSelector } from "./inbound-status-selector";
import { MailboxSelector } from "./mailbox-selector";
import { ReceivedEmailTable } from "./received-email-table";

interface ReceivedEmailData {
	id: string;
	mailboxId: string;
	fromEmail: string;
	fromName: string | null;
	toEmails: string[];
	subject: string | null;
	snippet: string | null;
	status: string;
	createdAt: string | Date;
	threadId: string | null;
}

export const ReceivedEmailList = () => {
	const { activeOrganization } = useUserOrganization();
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [isSearchActive, setIsSearchActive] = useState(false);
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

	const fetchUrl = activeOrganization?.id ? "/api/inbox/v1/messages" : null;

	const { data, error, isLoading } = useSWR<ReceivedEmailData[]>(fetchUrl, {
		revalidateOnFocus: true,
		revalidateOnReconnect: true,
	});

	// Filter data client-side
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

	// Paginate data client-side
	const paginatedLogs = useMemo(() => {
		const start = (currentPage - 1) * pageSize;
		const end = start + pageSize;
		return filteredLogs.slice(start, end);
	}, [filteredLogs, currentPage, pageSize]);

	const hasAnyFilter = !!(searchQuery || selectedMailbox || selectedStatus);

	const handleClearAll = () => {
		setSearchQuery("");
		setSelectedMailbox("");
		setSelectedStatus("");
		setCurrentPage(1);
	};

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center gap-2 p-4">
				<Icon name="alert-circle" className="h-8 w-8 text-red-500" />
				<p className="text-center text-sm text-text-sub-600">
					Failed to load received emails
				</p>
			</div>
		);
	}

	return (
		<div>
			<div className="flex items-center gap-2">
				<motion.div
					layout
					className="flex-1"
					transition={{ type: "spring", stiffness: 350, damping: 30 }}
				>
					<Input.Root size="xsmall" className="rounded-[10px]">
						<Input.Wrapper>
							<Input.Icon as={Icon} name="search" size="xsmall" />
							<Input.Input
								placeholder="Search sender or subject..."
								value={searchQuery}
								onChange={(e) => {
									setSearchQuery(e.target.value);
									setCurrentPage(1);
								}}
								onFocus={() => setIsSearchActive(true)}
								onBlur={() => setIsSearchActive(false)}
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
										setCurrentPage(1);
									}}
									className="mr-1 rounded p-0.5 text-text-soft-400 transition-colors hover:bg-neutral-alpha-10 hover:text-text-strong-950"
								>
									<Icon name="cross" className="h-3 w-3" />
								</button>
							)}
						</Input.Wrapper>
					</Input.Root>
				</motion.div>

				<AnimatePresence initial={false}>
					{!isSearchActive && (
						<motion.div
							key="filters"
							initial={{ opacity: 0, width: 0, scale: 0.95 }}
							animate={{ opacity: 1, width: "auto", scale: 1 }}
							exit={{ opacity: 0, width: 0, scale: 0.95 }}
							transition={{ type: "spring", stiffness: 350, damping: 30 }}
							className="flex shrink-0 items-center gap-2 overflow-hidden whitespace-nowrap"
						>
							<InboundStatusSelector
								value={selectedStatus}
								onChange={(val) => {
									setSelectedStatus(val);
									setCurrentPage(1);
								}}
							/>
							<MailboxSelector
								value={selectedMailbox}
								onChange={(val) => {
									setSelectedMailbox(val);
									setCurrentPage(1);
								}}
							/>
							{hasAnyFilter && (
								<Button.Root
									variant="neutral"
									mode="stroke"
									size="xsmall"
									onClick={handleClearAll}
									className="gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
								>
									Clear filters
								</Button.Root>
							)}
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			<div className="mt-4">
				<ReceivedEmailTable
					logs={paginatedLogs}
					isLoading={isLoading}
					loadingRows={pageSize}
					currentPage={currentPage}
					pageSize={pageSize}
					totalLogs={totalLogs}
					onPageChange={setCurrentPage}
					onPageSizeChange={(value) => {
						setPageSize(value);
						setCurrentPage(1);
					}}
					hasFilters={hasAnyFilter}
					onClearFilters={handleClearAll}
				/>
			</div>
		</div>
	);
};
