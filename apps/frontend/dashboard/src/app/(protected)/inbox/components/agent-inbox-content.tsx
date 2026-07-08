"use client";

import { useAgentInbox } from "@fe/dashboard/app/(protected)/inbox/components/agent-inbox-provider";
import {
	applyInboxFilters,
	InboxCommandPalette,
	InboxSearchTrigger,
	useInboxActiveFilterCount,
} from "@fe/dashboard/app/(protected)/inbox/components/inbox-command-palette";
import { InboxEmptyState } from "@fe/dashboard/app/(protected)/inbox/components/inbox-empty-state";
import { useInboxSidebar } from "@fe/dashboard/app/(protected)/inbox/components/inbox-sidebar-context";
import { InboxSidebarToggle } from "@fe/dashboard/app/(protected)/inbox/components/inbox-sidebar-toggle";
import { ThreadDetail } from "@fe/dashboard/app/(protected)/inbox/components/thread-detail";
import {
	ThreadList,
	useInboxNavigation,
} from "@fe/dashboard/app/(protected)/inbox/components/thread-list";
import {
	ResizablePanel,
	ResizablePanelGroup,
} from "@fe/dashboard/app/(protected)/inbox/components/ui/resizable";
import { useInboxMail } from "@fe/dashboard/app/(protected)/inbox/components/use-inbox-mail";
import {
	findThreadByListId,
	groupThreadsByConversation,
} from "@fe/dashboard/app/(protected)/inbox/utils/group-threads";
import type {
	AgentMailbox,
	InboundThread,
} from "@fe/dashboard/app/(protected)/inbox/types";
import { cn } from "@reloop/ui/cn";
import { RefreshCcw, X } from "lucide-react";
import { useMediaQuery } from "usehooks-ts";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useMemo, useRef, useState } from "react";

export const AgentInboxContent = ({
	mailbox,
	threads,
}: {
	mailbox: AgentMailbox;
	folder: string;
	threads: InboundThread[];
}) => {
	const { markMessageRead, refresh } = useAgentInbox();
	const { toggleSidebar, openCompose } = useInboxSidebar();
	const [mail, setMail] = useInboxMail();
	const isDesktop = useMediaQuery("(min-width: 1024px)");
	const listContainerRef = useRef<HTMLDivElement>(null);
	const [paletteOpen, setPaletteOpen] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const activeFilterCount = useInboxActiveFilterCount();

	const [searchQuery, setSearchQuery] = useQueryState(
		"q",
		parseAsString.withDefault(""),
	);
	const [filterParam, setFilterParam] = useQueryState(
		"filter",
		parseAsString.withDefault(""),
	);
	const [selectedThreadId, setSelectedThreadId] = useQueryState(
		"threadId",
		parseAsString.withDefault(""),
	);

	const groupedThreads = useMemo(
		() => groupThreadsByConversation(threads),
		[threads],
	);

	const filteredThreads = useMemo(() => {
		return applyInboxFilters(groupedThreads, searchQuery, filterParam);
	}, [groupedThreads, searchQuery, filterParam]);

	const selectedThread = useMemo(() => {
		if (!selectedThreadId) return null;
		return (
			findThreadByListId(filteredThreads, selectedThreadId) ??
			findThreadByListId(groupedThreads, selectedThreadId) ??
			findThreadByListId(threads, selectedThreadId) ??
			null
		);
	}, [filteredThreads, groupedThreads, threads, selectedThreadId]);

	const handleSelectThread = useCallback(
		(id: string | null) => {
			setSelectedThreadId(id || null);
			if (!id) return;
			const thread = findThreadByListId(filteredThreads, id);
			if (thread?.unread && thread.messageId) {
				markMessageRead(thread.messageId, true).catch(() => {});
			}
		},
		[setSelectedThreadId, filteredThreads, markMessageRead],
	);

	const handleCloseThread = useCallback(() => {
		setSelectedThreadId(null);
	}, [setSelectedThreadId]);

	const { focusedIndex, handleMouseEnter, resetNavigation } =
		useInboxNavigation({
			items: filteredThreads,
			containerRef: listContainerRef,
			onNavigate: handleSelectThread,
			onMarkRead: (id) => {
				const thread = findThreadByListId(filteredThreads, id);
				if (thread?.messageId) {
					markMessageRead(thread.messageId, true).catch(() => {});
				}
			},
			isCommandPaletteOpen: paletteOpen,
		});

	const handleRefresh = useCallback(async () => {
		setIsRefreshing(true);
		try {
			await refresh();
		} finally {
			setIsRefreshing(false);
		}
	}, [refresh]);

	const handleExitBulkSelection = useCallback(() => {
		setMail((prev) => ({ ...prev, bulkSelected: [] }));
	}, [setMail]);

	const detailPane = selectedThread ? (
		<ThreadDetail
			thread={selectedThread}
			mailbox={mailbox}
			onBack={!isDesktop ? handleCloseThread : undefined}
			showBack={!isDesktop}
		/>
	) : (
		<InboxEmptyState onCompose={openCompose} />
	);

	return (
		<>
			<InboxCommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
			<div className="relative flex min-h-0 min-w-0 flex-1 rounded-inherit p-0 lg:h-[calc(100dvh-8px)]">
				<ResizablePanelGroup
					direction="horizontal"
					autoSaveId="agent-inbox-panel-layout"
					className="h-full min-h-0 flex-1 overflow-hidden rounded-inherit"
				>
					<ResizablePanel
						defaultSize={35}
						minSize={35}
						maxSize={35}
						className={cn(
							"mb-1 flex min-h-0 flex-1 flex-col bg-panel-dark shadow-sm md:mr-[3px] md:rounded-2xl lg:h-[calc(100dvh-8px)]",
							!isDesktop && selectedThreadId && "hidden",
						)}
					>
						<div className="flex min-h-0 flex-1 flex-col">
							<div className="sticky top-0 z-15 shrink-0 p-4 pb-0">
								<div className="flex items-center gap-2">
									<InboxSidebarToggle onClick={toggleSidebar} />

									{mail.bulkSelected.length === 0 ? (
										<InboxSearchTrigger
											onOpenPalette={() => setPaletteOpen(true)}
											activeFilterCount={activeFilterCount}
										/>
									) : (
										<div className="flex flex-1 items-center justify-between">
											<div className="font-medium text-mail-foreground text-sm">
												{mail.bulkSelected.length} selected
											</div>
											<button
												type="button"
												onClick={handleExitBulkSelection}
												className="inline-flex h-8 items-center gap-2 rounded-lg bg-mail-accent px-2 text-xs"
											>
												<X className="h-3 w-3" />
												<span>ESC</span>
											</button>
										</div>
									)}

									<button
										type="button"
										onClick={handleRefresh}
										disabled={isRefreshing}
										className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-[#202020] disabled:opacity-50"
										aria-label="Refresh"
									>
										<RefreshCcw
											className={cn(
												"h-4 w-4 text-mail-muted",
												isRefreshing && "animate-spin",
											)}
										/>
									</button>
								</div>
							</div>

							<div
								ref={listContainerRef}
								className="relative z-1 flex min-h-0 flex-1 flex-col overflow-hidden"
							>
								<ThreadList
									threads={filteredThreads}
									selectedId={selectedThreadId}
									onSelect={handleSelectThread}
									hasFilters={searchQuery !== "" || activeFilterCount > 0}
									onClearFilters={() => {
										setSearchQuery(null);
										setFilterParam(null);
										resetNavigation();
									}}
									focusedIndex={focusedIndex}
									onMouseEnterRow={handleMouseEnter}
								/>
							</div>
						</div>
					</ResizablePanel>

					{isDesktop && (
						<ResizablePanel
							defaultSize={65}
							minSize={30}
							className="mb-1 mr-0.5 flex min-h-0 flex-col rounded-2xl bg-panel-dark shadow-sm lg:h-[calc(100dvh-8px)]"
						>
							{detailPane}
						</ResizablePanel>
					)}
				</ResizablePanelGroup>

				{!isDesktop && selectedThreadId && (
					<div className="fixed inset-0 z-50 flex flex-col bg-panel-dark">
						{detailPane}
					</div>
				)}
			</div>
		</>
	);
};
