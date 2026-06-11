"use client";

import { AnimatedBackButton } from "@fe/dashboard/components/animated-back-button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { useRouter } from "next/navigation";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { useMemo } from "react";
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
	const router = useRouter();
	const mailboxId = mailbox.id;
	const [activeFilter, setActiveFilter] = useQueryState(
		"filter",
		parseAsStringLiteral(["primary", "spam"] as const).withDefault("primary"),
	);
	const [searchQuery, setSearchQuery] = useQueryState(
		"q",
		parseAsString.withDefault(""),
	);
	const [selectedThreadId, setSelectedThreadId] = useQueryState(
		"thread",
		parseAsString.withDefault(""),
	);

	const { threads, refresh, markMessageRead, markMessageSpam, deleteMessage } =
		useAgentInbox();

	const mailboxThreads = useMemo(
		() => threads.filter((t) => t.mailboxId === mailboxId),
		[mailboxId, threads],
	);

	const filteredThreads = useMemo(() => {
		let result = mailboxThreads.filter((t) =>
			threadMatchesFilter(t, activeFilter),
		);
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			result = result.filter(
				(t) =>
					t.subject.toLowerCase().includes(q) ||
					t.preview.toLowerCase().includes(q) ||
					t.from.email.toLowerCase().includes(q) ||
					t.from.name?.toLowerCase().includes(q),
			);
		}
		return result;
	}, [mailboxThreads, activeFilter, searchQuery]);

	const filterCounts = useMemo(() => {
		const filters: InboxFilter[] = ["primary", "spam"];
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
		const idx = threadsForNavigation.findIndex(
			(t) => t.id === selectedThread.id,
		);
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
				currentUnread
					? "Message marked as handled"
					: "Message marked as active",
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
		<div className="flex h-[calc(100vh-54px)] flex-col overflow-hidden pb-0">
			{/* Page Top Bar */}
			<div className="flex shrink-0 items-center justify-between border-stroke-soft-100 border-b px-4 pt-2 pb-2 dark:border-stroke-soft-100/40">
				<div className="flex items-center gap-3">
					<AnimatedBackButton
						showEscKey={true}
						showText={false}
						onClick={() => router.push("/agent-inbox")}
					/>
					<h1 className="font-semibold text-text-strong-950">
						{mailbox.email}
					</h1>
				</div>

				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={handleRefresh}
						title="Refresh"
						className="flex h-8 w-8 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/5"
					>
						<Icon name="refresh-cw" className="h-4 w-4" />
					</button>
					<button
						type="button"
						title="Mark all as read"
						className="flex h-8 w-8 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/5"
					>
						<Icon name="check-circle" className="h-4 w-4" />
					</button>
					<button
						type="button"
						title="Notifications"
						className="flex h-8 w-8 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/5"
					>
						<Icon name="notification-indicator" className="h-4 w-4" />
					</button>
				</div>
			</div>

			<InboxFilterTabs
				orientation="horizontal"
				activeFilter={activeFilter}
				onFilterChange={setActiveFilter}
				counts={filterCounts}
				className="pt-2"
			/>

			{/* Multi-pane side-by-side Split Layout */}
			<div className="flex min-h-0 flex-1 gap-0">
				{/* Left Pane: Thread List */}
				<div
					className={cn(
						"min-h-0 min-w-0 shrink-0 flex-col pr-4 pl-4 md:flex md:w-[380px] md:flex-none lg:w-[440px]",
						selectedThreadId ? "hidden md:flex" : "flex flex-1",
					)}
				>
					{/* List Header */}
					<div className="flex items-center gap-3 pt-4 pb-4">
						<div className="flex-1">
							<Input.Root size="xsmall" className="rounded-[10px]">
								<Input.Wrapper>
									<Input.Icon as={Icon} name="search" size="xsmall" />
									<Input.Input
										placeholder="Search from mails"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>
					</div>

					{/* Thread List Container */}
					<div className="scrollbar-hide min-h-0 flex-1">
						<ThreadList
							threads={filteredThreads}
							selectedId={selectedThreadId}
							onSelect={handleSelectThread}
							emptyMessage={emptyMessage}
							hasFilters={activeFilter !== "primary" || searchQuery !== ""}
							onClearFilters={() => {
								setActiveFilter("primary");
								setSearchQuery("");
							}}
						/>
					</div>
				</div>

				{/* Right Pane: Thread Detail View */}
				<div
					className={cn(
						"min-w-0 flex-1 border-stroke-soft-100 border-l bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5",
						selectedThreadId ? "flex flex-col" : "hidden md:flex md:flex-col",
					)}
				>
					{selectedThread ? (
						<div className="flex min-h-0 flex-1 flex-col">
							{/* Details Header (Gmail-style) */}
							<div className="flex shrink-0 items-center justify-between border-stroke-soft-100 border-b px-6 py-4 dark:border-stroke-soft-100/40">
								{/* Left Side Actions */}
								<div className="flex items-center gap-1 sm:gap-2">
									<button
										type="button"
										onClick={() => setSelectedThreadId("")}
										className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 md:hidden dark:hover:bg-white/5"
										title="Back to messages"
									>
										<Icon name="arrow-left" className="h-4 w-4" />
									</button>

									<div className="mx-1 h-4 w-px bg-stroke-soft-100 md:hidden dark:bg-stroke-soft-100/40" />

									<button
										type="button"
										title={
											selectedThread.unread
												? "Mark as Handled"
												: "Mark as Active"
										}
										onClick={() =>
											handleToggleRead(selectedThread.id, selectedThread.unread)
										}
										className="flex h-8 w-8 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/5"
									>
										<Icon name="check-circle" className="h-4 w-4" />
									</button>
									<button
										type="button"
										title="Mark as Spam"
										onClick={() => handleMarkSpam(selectedThread.id)}
										className="flex h-8 w-8 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-error-base dark:hover:bg-white/5"
									>
										<Icon name="cross-circle" className="h-4 w-4" />
									</button>
									<button
										type="button"
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
												type="button"
												disabled={currentIndex === 0}
												onClick={() =>
													setSelectedThreadId(
														threadsForNavigation[currentIndex - 1]?.id ?? "",
													)
												}
												className="flex h-8 w-8 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 disabled:pointer-events-none disabled:opacity-30 dark:hover:bg-white/5"
												title="Newer"
											>
												<Icon name="chevron-left" className="h-4 w-4" />
											</button>
											<button
												type="button"
												disabled={
													currentIndex === threadsForNavigation.length - 1
												}
												onClick={() =>
													setSelectedThreadId(
														threadsForNavigation[currentIndex + 1]?.id ?? "",
													)
												}
												className="flex h-8 w-8 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 disabled:pointer-events-none disabled:opacity-30 dark:hover:bg-white/5"
												title="Older"
											>
												<Icon name="chevron-right" className="h-4 w-4" />
											</button>
										</div>
									</div>
								)}
							</div>

							<div className="min-h-0 flex-1">
								<ThreadDetail thread={selectedThread} mailbox={mailbox} />
							</div>
						</div>
					) : (
						<div className="flex min-h-0 flex-1 flex-col">
							{/* Mailbox details header */}
							<div className="flex shrink-0 items-center justify-between border-stroke-soft-100 border-b px-6 py-4 dark:border-stroke-soft-100/40">
								<div className="flex items-center gap-2">
									<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary-base/20 bg-primary-base/10 font-semibold text-primary-base text-xs">
										{mailbox.label.charAt(0).toUpperCase()}
									</div>
									<div className="flex min-w-0 flex-col">
										<span className="mb-0.5 truncate font-semibold text-label-sm text-text-strong-950 leading-none">
											{mailbox.label}
										</span>
										<span className="truncate text-[11px] text-text-soft-400 leading-none">
											{mailbox.email}
										</span>
									</div>
								</div>
							</div>

							<div className="min-h-0 flex-1">
								<ThreadDetail thread={null} mailbox={mailbox} />
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
