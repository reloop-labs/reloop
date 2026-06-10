"use client";

import * as Input from "@reloop/ui/input";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { AgentMailbox } from "../mock-data";
import {
	countThreadsForFilter,
	type InboxFilter,
	threadMatchesFilter,
} from "../mock-data";
import { useAgentInbox } from "./agent-inbox-provider";
import { InboxFilterTabs } from "./inbox-filter-tabs";
import { ThreadDetail } from "./thread-detail";
import { ThreadList } from "./thread-list";

export const AgentInboxLayout = ({ mailbox }: { mailbox: AgentMailbox }) => {
	const mailboxId = mailbox.id;
	const [activeFilter, setActiveFilter] = useState<InboxFilter>("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedThreadId, setSelectedThreadId] = useQueryState(
		"thread",
		parseAsString.withDefault(""),
	);


	const { threads, refresh, markMessageRead, markMessageSpam, deleteMessage } = useAgentInbox();

	const mailboxThreads = useMemo(
		() => threads.filter((t) => t.mailboxId === mailboxId),
		[mailboxId, threads],
	);

	const filteredThreads = useMemo(() => {
		let result = mailboxThreads.filter((t) => threadMatchesFilter(t, activeFilter));
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			result = result.filter(
				(t) =>
					t.subject.toLowerCase().includes(q) ||
					t.preview.toLowerCase().includes(q) ||
					t.from.email.toLowerCase().includes(q) ||
					(t.from.name && t.from.name.toLowerCase().includes(q)),
			);
		}
		return result;
	}, [mailboxThreads, activeFilter, searchQuery]);

	const filterCounts = useMemo(() => {
		const filters: InboxFilter[] = [
			"all",
			"spam",
		];
		return Object.fromEntries(
			filters.map((f) => [f, countThreadsForFilter(threads, f, mailboxId)]),
		) as Record<InboxFilter, number>;
	}, [mailboxId, threads]);

	const selectedThread = useMemo(
		() =>
			filteredThreads.find((t) => t.id === selectedThreadId) ??
			mailboxThreads.find((t) => t.id === selectedThreadId) ??
			null,
		[filteredThreads, mailboxThreads, selectedThreadId],
	);

	// Find current index and navigation info if viewing a detailed thread
	const threadsForNavigation = useMemo(() => {
		return filteredThreads.length > 0 ? filteredThreads : mailboxThreads;
	}, [filteredThreads, mailboxThreads]);

	const { currentIndex, hasNavigation } = useMemo(() => {
		if (!selectedThread) return { currentIndex: -1, hasNavigation: false };
		const idx = threadsForNavigation.findIndex((t) => t.id === selectedThread.id);
		return { currentIndex: idx, hasNavigation: idx !== -1 };
	}, [selectedThread, threadsForNavigation]);

	const handleNavigateAfterAction = (currentId: string) => {
		const idx = threadsForNavigation.findIndex((t) => t.id === currentId);
		if (idx !== -1 && threadsForNavigation.length > 1) {
			if (idx < threadsForNavigation.length - 1) {
				setSelectedThreadId(threadsForNavigation[idx + 1]?.id ?? "");
			} else {
				setSelectedThreadId(threadsForNavigation[idx - 1]?.id ?? "");
			}
		} else {
			setSelectedThreadId("");
		}
	};

	const handleToggleRead = async (id: string, currentUnread: boolean) => {
		try {
			await markMessageRead(id, currentUnread);
			toast.success(
				currentUnread ? "Message marked as handled" : "Message marked as active",
			);
		} catch (err: any) {
			toast.error(err.message || "Failed to update status");
		}
	};

	const handleMarkSpam = async (id: string) => {
		try {
			await markMessageSpam(id, true);
			toast.success("Message marked as spam");
			handleNavigateAfterAction(id);
		} catch (err: any) {
			toast.error(err.message || "Failed to update status");
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this message?")) return;
		try {
			await deleteMessage(id);
			toast.success("Message deleted");
			handleNavigateAfterAction(id);
		} catch (err: any) {
			toast.error(err.message || "Failed to delete message");
		}
	};

	const handleSelectThread = (id: string) => {
		setSelectedThreadId(id || null);
	};

	const handleRefresh = async () => {
		try {
			await refresh();
			toast.success("Inbox refreshed");
		} catch {
			toast.error("Failed to refresh inbox");
		}
	};

	const emptyMessage =
		mailboxThreads.length === 0
			? "No inbound messages yet. Set up a webhook to receive email."
			: activeFilter === "spam"
				? "No spam messages"
				: "No messages in this filter";

	return (
		<div className="flex min-h-0 flex-col pb-8">
			{/* Header */}
			{selectedThread ? (
				/* Details Header (Gmail-style) */
				<div className="flex items-center justify-between border-b border-stroke-soft-100 dark:border-stroke-soft-100/40 pt-6 pb-4 sm:px-2">
					{/* Left Side Actions */}
					<div className="flex items-center gap-1 sm:gap-2">
						<button
							onClick={() => setSelectedThreadId("")}
							className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/5"
							title="Back to messages"
						>
							<Icon name="arrow-left" className="h-4 w-4" />
						</button>

						<div className="h-4 w-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40 mx-1" />

						<button
							title={selectedThread.unread ? "Mark as Handled" : "Mark as Active"}
							onClick={() => handleToggleRead(selectedThread.id, selectedThread.unread)}
							className="flex h-8 w-8 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/5"
						>
							<Icon name="check-circle" className="h-4 w-4" />
						</button>
						<button
							title="Mark as Spam"
							onClick={() => handleMarkSpam(selectedThread.id)}
							className="flex h-8 w-8 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-error-base dark:hover:bg-white/5"
						>
							<Icon name="cross-circle" className="h-4 w-4" />
						</button>
						<button
							title="Delete Message"
							onClick={() => handleDelete(selectedThread.id)}
							className="flex h-8 w-8 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-error-base dark:hover:bg-white/5"
						>
							<Icon name="trash" className="h-4 w-4" />
						</button>
					</div>

					{/* Right Side Pagination/Navigation */}
					{hasNavigation && (
						<div className="flex items-center gap-3 text-label-xs text-text-soft-400 tabular-nums">
							<span>
								{currentIndex + 1} of {threadsForNavigation.length}
							</span>
							<div className="flex items-center gap-0.5">
								<button
									disabled={currentIndex === 0}
									onClick={() => setSelectedThreadId(threadsForNavigation[currentIndex - 1]?.id ?? "")}
									className="flex h-8 w-8 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 disabled:opacity-30 disabled:pointer-events-none dark:hover:bg-white/5"
									title="Newer"
								>
									<Icon name="chevron-left" className="h-4 w-4" />
								</button>
								<button
									disabled={currentIndex === threadsForNavigation.length - 1}
									onClick={() => setSelectedThreadId(threadsForNavigation[currentIndex + 1]?.id ?? "")}
									className="flex h-8 w-8 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 disabled:opacity-30 disabled:pointer-events-none dark:hover:bg-white/5"
									title="Older"
								>
									<Icon name="chevron-right" className="h-4 w-4" />
								</button>
							</div>
						</div>
					)}
				</div>
			) : (
				/* List Header */
				<div className="flex flex-wrap items-center justify-between gap-4 pt-6 pb-4 sm:px-2">
					{/* Left side: Back & Search */}
					<div className="flex flex-1 min-w-0 items-center gap-3 max-w-sm sm:max-w-md">
						<Link
							href="/agent-inbox"
							className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/5"
							aria-label="Back to agent addresses"
						>
							<Icon name="arrow-left" className="h-4 w-4" />
						</Link>
						<div className="flex-1">
							<Input.Root size="xsmall" className="rounded-[10px]">
								<Input.Wrapper>
									<Input.Icon as={Icon} name="search" size="xsmall" />
									<Input.Input
										placeholder="Search subject, sender, preview..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>
					</div>

					{/* Right side: User Icon/Email & Actions */}
					<div className="flex flex-wrap items-center gap-6">
						{/* Mailbox Avatar Details */}
						<div className="flex items-center gap-2">
							<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-base/10 text-primary-base font-semibold text-xs border border-primary-base/20">
								{mailbox.label.charAt(0).toUpperCase()}
							</div>
							<div className="hidden md:flex flex-col min-w-0">
								<span className="text-label-sm font-semibold text-text-strong-950 leading-none mb-0.5 truncate">
									{mailbox.label}
								</span>
								<span className="text-[11px] text-text-soft-400 leading-none truncate">
									{mailbox.email}
								</span>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Content Panel */}
			<div className="mt-3 flex min-h-0 flex-1 flex-col gap-4 sm:px-2">
				{selectedThread ? (
					<div className="min-w-0 flex-1 rounded-3xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5">
						<ThreadDetail
							thread={selectedThread}
							mailbox={mailbox}
						/>
					</div>
				) : (
					<div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
						<InboxFilterTabs
							orientation="horizontal"
							activeFilter={activeFilter}
							onFilterChange={setActiveFilter}
							counts={filterCounts}
							className="py-0"
						/>

						<ThreadList
							threads={filteredThreads}
							selectedId={null}
							onSelect={handleSelectThread}
							emptyMessage={emptyMessage}
							hasFilters={activeFilter !== "all" || searchQuery !== ""}
							onClearFilters={() => {
								setActiveFilter("all");
								setSearchQuery("");
							}}
						/>
					</div>
				)}
			</div>
		</div>
	);
};
