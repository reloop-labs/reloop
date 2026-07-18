import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";
import { useAgentInbox } from "#/features/agent-inbox/components/agent-inbox-provider";
import {
	AiSidebar,
	useAiSidebar,
} from "#/features/agent-inbox/components/ai-sidebar";
import { InboxCategoryNavbar } from "#/features/agent-inbox/components/mail-list/inbox-category-navbar";
import {
	applyInboxFilters,
	InboxCommandPalette,
	InboxSearchTrigger,
	useInboxActiveFilterCount,
} from "#/features/agent-inbox/components/mail-list/inbox-command-palette";
import { InboxEmptyState } from "#/features/agent-inbox/components/mail-list/inbox-empty-state";
import { useInboxSidebar } from "#/features/agent-inbox/components/sidebar/inbox-sidebar-context";
import { InboxSidebarToggle } from "#/features/agent-inbox/components/sidebar/inbox-sidebar-toggle";
import {
	ThreadList,
	useInboxNavigation,
} from "#/features/agent-inbox/components/mail-list/thread-list";
import { LoadingDot } from "#/features/agent-inbox/components/shared/loading-dot";
import { SectionError } from "#/features/agent-inbox/components/shared/section-error";
import { ThreadDetail } from "#/features/agent-inbox/components/thread-detail";
import { DetailPanelSkeleton } from "#/features/agent-inbox/components/thread-detail/detail-panel-skeleton";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "#/features/agent-inbox/components/ui/resizable";
import { useInboxMail } from "#/features/agent-inbox/components/mail-list/use-inbox-mail";
import { useInboxUndo } from "#/features/agent-inbox/hooks/use-inbox-undo";
import type {
	AgentMailbox,
	BatchThreadAction,
	InboundThread,
	InboxView,
} from "#/features/agent-inbox/types";
import {
	applyInboxViewFilter,
	findThreadByListId,
	groupThreadsByConversation,
} from "#/features/agent-inbox/utils/group-threads";

const INBOX_VIEW_VALUES = ["primary", "alerts", "person", "tag"] as const;

const FOLDER_TITLES: Record<string, string> = {
	inbox: "Inbox",
	agent: "Agent",
	sent: "Sent",
	archive: "Archive",
	spam: "Spam",
	trash: "Bin",
	drafts: "Drafts",
	needs_approval: "Needs approval",
};

const isTypingTarget = (target: EventTarget | null) => {
	if (!(target instanceof HTMLElement)) return false;
	const tag = target.tagName;
	if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
	if (target.isContentEditable) return true;
	return Boolean(target.closest("[contenteditable='true'], [role='textbox']"));
};

export const AgentInboxContent = ({
	mailbox,
	folder,
	threads,
}: {
	mailbox: AgentMailbox;
	folder: string;
	threads: InboundThread[];
}) => {
	const {
		markMessageRead,
		batchThreads,
		refresh,
		isLoadingThreads,
		isLoadingMailboxes,
		getMailbox,
		threadsError,
		retryThreads,
	} = useAgentInbox();
	const mailboxReady = !!getMailbox(mailbox.id) && !!mailbox.email;
	const { toggleSidebar, openCompose } = useInboxSidebar();
	const { open: aiOpen, setOpen: setAiOpen, toggle: toggleAi } = useAiSidebar();
	const { pushBatchUndo, undo } = useInboxUndo();
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
	const [viewParam, setViewParam] = useQueryState(
		"view",
		parseAsStringLiteral(INBOX_VIEW_VALUES).withDefault("primary"),
	);
	const [selectedThreadId, setSelectedThreadId] = useQueryState(
		"threadId",
		parseAsString.withDefault(""),
	);

	const activeView = viewParam as InboxView;
	const folderTitle = folder.startsWith("label:")
		? "Label"
		: (FOLDER_TITLES[folder] ?? "Inbox");
	const showCategoryNavbar = folder === "inbox";

	useEffect(() => {
		setMail((prev) =>
			prev.bulkSelected.length === 0 ? prev : { ...prev, bulkSelected: [] },
		);
	}, [folder, setMail]);

	const groupedThreads = useMemo(
		() => groupThreadsByConversation(threads),
		[threads],
	);

	const filteredThreads = useMemo(() => {
		const searched = applyInboxFilters(
			groupedThreads,
			searchQuery,
			filterParam,
		);
		if (!showCategoryNavbar) return searched;
		return applyInboxViewFilter(searched, activeView);
	}, [
		groupedThreads,
		searchQuery,
		filterParam,
		activeView,
		showCategoryNavbar,
	]);

	/** Row skeleton until mailbox metadata + first thread fetch settle. */
	const listLoading =
		(isLoadingThreads || !mailboxReady || isLoadingMailboxes) &&
		filteredThreads.length === 0 &&
		!threadsError;

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

	const resolveBulkThreadIds = useCallback(() => {
		return mail.bulkSelected
			.map((listId) => {
				const thread = findThreadByListId(filteredThreads, listId);
				return thread?.threadId || thread?.id || listId;
			})
			.filter(Boolean);
	}, [mail.bulkSelected, filteredThreads]);

	const runBulkAction = useCallback(
		async (action: BatchThreadAction, success: string) => {
			const ids = resolveBulkThreadIds();
			if (ids.length === 0) return;
			try {
				await batchThreads(ids, action);
				pushBatchUndo(ids, action, success);
				toast.success(success);
				setMail((prev) => ({ ...prev, bulkSelected: [] }));
			} catch (err: unknown) {
				toast.error(err instanceof Error ? err.message : "Bulk action failed");
			}
		},
		[batchThreads, resolveBulkThreadIds, setMail, pushBatchUndo],
	);

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

	const allVisibleSelected =
		filteredThreads.length > 0 &&
		mail.bulkSelected.length === filteredThreads.length;

	const handleToggleSelectAll = useCallback(() => {
		setMail((prev) => ({
			...prev,
			bulkSelected: allVisibleSelected ? [] : filteredThreads.map((t) => t.id),
		}));
	}, [allVisibleSelected, filteredThreads, setMail]);

	const openThreadComposer = useCallback(
		(thread: InboundThread, mode: "reply" | "replyAll" | "forward") => {
			handleSelectThread(thread.id);
			const url = new URL(window.location.href);
			url.searchParams.set("threadId", thread.id);
			url.searchParams.set("compose", mode);
			window.history.replaceState({}, "", url.toString());
		},
		[handleSelectThread],
	);

	const hotkeysEnabled =
		!paletteOpen &&
		(mail.bulkSelected.length > 0 ||
			focusedIndex !== null ||
			!!selectedThreadId);

	const listHotkeysEnabled = !paletteOpen;

	useHotkeys(
		"e",
		(e) => {
			if (isTypingTarget(e.target)) return;
			if (mail.bulkSelected.length > 0) {
				void runBulkAction("archive", "Archived");
				return;
			}
			if (!selectedThread) return;
			const id = selectedThread.threadId || selectedThread.id;
			void batchThreads([id], "archive")
				.then(() => toast.success("Archived"))
				.catch((err: unknown) =>
					toast.error(err instanceof Error ? err.message : "Failed to archive"),
				);
		},
		{ enabled: hotkeysEnabled, preventDefault: true },
		[mail.bulkSelected.length, selectedThread, runBulkAction, batchThreads],
	);

	useHotkeys(
		"d",
		(e) => {
			if (isTypingTarget(e.target)) return;
			if (mail.bulkSelected.length > 0) {
				void runBulkAction("trash", "Moved to trash");
				return;
			}
			if (!selectedThread) return;
			const id = selectedThread.threadId || selectedThread.id;
			void batchThreads([id], "trash")
				.then(() => toast.success("Moved to trash"))
				.catch((err: unknown) =>
					toast.error(err instanceof Error ? err.message : "Failed to trash"),
				);
		},
		{ enabled: hotkeysEnabled, preventDefault: true },
		[mail.bulkSelected.length, selectedThread, runBulkAction, batchThreads],
	);

	useHotkeys(
		"s",
		(e) => {
			if (isTypingTarget(e.target)) return;
			if (mail.bulkSelected.length > 0) {
				void runBulkAction("star", "Starred");
			}
		},
		{
			enabled: hotkeysEnabled && mail.bulkSelected.length > 0,
			preventDefault: true,
		},
		[mail.bulkSelected.length, runBulkAction],
	);

	useHotkeys(
		"u",
		(e) => {
			if (isTypingTarget(e.target)) return;
			if (mail.bulkSelected.length > 0) {
				void runBulkAction("unread", "Marked unread");
				return;
			}
			if (!selectedThread?.messageId && !selectedThread?.id) return;
			const msgId = selectedThread.messageId ?? selectedThread.id;
			void markMessageRead(msgId, false)
				.then(() => toast.success("Marked unread"))
				.catch((err: unknown) =>
					toast.error(err instanceof Error ? err.message : "Failed"),
				);
		},
		{ enabled: hotkeysEnabled, preventDefault: true },
		[mail.bulkSelected.length, selectedThread, runBulkAction, markMessageRead],
	);

	useHotkeys(
		"mod+a",
		(e) => {
			if (isTypingTarget(e.target)) return;
			e.preventDefault();
			setMail((prev) => ({
				...prev,
				bulkSelected: filteredThreads.map((t) => t.id),
			}));
		},
		{ enabled: listHotkeysEnabled, preventDefault: true },
		[filteredThreads, setMail],
	);

	useHotkeys(
		"c",
		(e) => {
			if (isTypingTarget(e.target)) return;
			openCompose();
		},
		{ enabled: listHotkeysEnabled, preventDefault: true },
		[openCompose],
	);

	useHotkeys(
		"mod+z",
		(e) => {
			if (isTypingTarget(e.target)) return;
			void undo().then((did) => {
				if (did) toast.success("Undone");
			});
		},
		{ enabled: !paletteOpen, preventDefault: true },
		[undo, paletteOpen],
	);

	const detailPane = selectedThread ? (
		<ThreadDetail
			thread={selectedThread}
			mailbox={mailbox}
			folder={folder}
			onBack={handleCloseThread}
			showBack={!isDesktop}
			onToggleAi={toggleAi}
		/>
	) : isLoadingThreads && filteredThreads.length === 0 ? (
		<DetailPanelSkeleton />
	) : selectedThreadId && threadsError ? (
		<div className="flex h-full min-h-0 flex-col rounded-xl bg-panel-light dark:bg-panel-dark">
			<SectionError
				message="Couldn't load this conversation"
				onRetry={() => void retryThreads()}
				className="flex-1"
			/>
		</div>
	) : selectedThreadId && isLoadingThreads ? (
		<DetailPanelSkeleton />
	) : (
		<InboxEmptyState onCompose={openCompose} onOpenAi={toggleAi} />
	);

	return (
		<>
			<InboxCommandPalette
				open={paletteOpen}
				onOpenChange={setPaletteOpen}
				threads={groupedThreads}
				onSelectThread={handleSelectThread}
			/>
			<div className="relative flex min-h-0 min-w-0 flex-1 rounded-inherit p-0 lg:h-[calc(100dvh-8px)]">
				<ResizablePanelGroup
					direction="horizontal"
					autoSaveId="agent-inbox-panel-layout"
					className="h-full min-h-0 flex-1 overflow-hidden rounded-inherit"
				>
					<ResizablePanel
						defaultSize={35}
						minSize={25}
						maxSize={50}
						className={cn(
							"mb-1 flex min-h-0 flex-1 flex-col bg-panel-light md:rounded-2xl lg:h-[calc(100dvh-8px)] dark:bg-panel-dark",
							!isDesktop && selectedThreadId && "hidden",
						)}
					>
						<div className="flex min-h-0 flex-1 flex-col">
							<div className="sticky top-0 z-15 shrink-0 space-y-3 p-4 pb-2">
								<div className="flex items-center">
									<InboxSidebarToggle onClick={toggleSidebar} />
									<div className="flex min-w-0 flex-1 items-center gap-2">
										<h1 className="truncate font-medium text-base text-mail-foreground">
											{folderTitle}
										</h1>
									</div>
									{mail.bulkSelected.length === 0 ? (
										<button
											type="button"
											onClick={handleRefresh}
											disabled={isRefreshing}
											className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-[var(--inbox-hover)] disabled:opacity-50"
											aria-label="Refresh"
										>
											{isRefreshing ? (
												<LoadingDot
													label="Refreshing"
													className="text-mail-muted"
													style={{ fontSize: 12 }}
												/>
											) : (
												<Icon
													name="refresh-cw"
													className="h-4 w-4 text-mail-muted"
												/>
											)}
										</button>
									) : (
										<div className="flex items-center gap-1">
											<button
												type="button"
												title="Archive"
												onClick={() =>
													void runBulkAction("archive", "Archived")
												}
												className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--inbox-control)] hover:bg-[var(--inbox-control-hover)]"
											>
												<Icon
													name="archive"
													className="h-3.5 w-3.5 text-mail-muted"
												/>
											</button>
											<button
												type="button"
												title="Trash"
												onClick={() =>
													void runBulkAction("trash", "Moved to trash")
												}
												className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--inbox-control)] hover:bg-[var(--inbox-control-hover)]"
											>
												<Icon
													name="trash"
													className="h-3.5 w-3.5 text-mail-muted"
												/>
											</button>
											<button
												type="button"
												title="Spam"
												onClick={() =>
													void runBulkAction("spam", "Moved to spam")
												}
												className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--inbox-control)] hover:bg-[var(--inbox-control-hover)]"
											>
												<Icon
													name="alert"
													className="h-3.5 w-3.5 text-mail-muted"
												/>
											</button>
											<button
												type="button"
												title="Star"
												onClick={() => void runBulkAction("star", "Starred")}
												className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--inbox-control)] hover:bg-[var(--inbox-control-hover)]"
											>
												<Icon
													name="star"
													className="h-3.5 w-3.5 text-mail-muted"
												/>
											</button>
											<button
												type="button"
												title="Pin"
												onClick={() => void runBulkAction("pin", "Pinned")}
												className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--inbox-control)] hover:bg-[var(--inbox-control-hover)]"
											>
												<Icon
													name="pin"
													className="h-3.5 w-3.5 text-mail-muted"
												/>
											</button>
											<button
												type="button"
												title="Mark read"
												onClick={() =>
													void runBulkAction("read", "Marked as read")
												}
												className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--inbox-control)] hover:bg-[var(--inbox-control-hover)]"
											>
												<Icon
													name="mail"
													className="h-3.5 w-3.5 text-mail-muted"
												/>
											</button>
											<button
												type="button"
												onClick={handleExitBulkSelection}
												className="inline-flex h-8 items-center gap-2 rounded-lg bg-mail-accent px-2 text-xs"
											>
												<Icon name="cross" className="h-3 w-3" />
												<span>ESC</span>
											</button>
										</div>
									)}
								</div>

								{mail.bulkSelected.length === 0 ? (
									<InboxSearchTrigger
										onOpenPalette={() => setPaletteOpen(true)}
										activeFilterCount={activeFilterCount}
									/>
								) : (
									<button
										type="button"
										onClick={handleToggleSelectAll}
										title={allVisibleSelected ? "Deselect all" : "Select all"}
										className={cn(
											"relative flex h-10 w-full flex-1 select-none items-center justify-start overflow-hidden rounded-2xl border border-mail-border/40 bg-[var(--inbox-control)] pl-3 text-left font-normal text-mail-foreground text-sm shadow-none transition-colors",
											"hover:bg-[var(--inbox-control-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mail-foreground/15",
										)}
									>
										<span
											className={cn(
												"flex h-6 w-6 items-center justify-center rounded-full transition-[transform,background-color] duration-150 ease-out",
												allVisibleSelected
													? "bg-zero-blue text-white"
													: "border border-mail-border/50 bg-panel-light text-mail-muted dark:bg-panel-dark",
											)}
										>
											<Icon name="check" className="h-3.5 w-3.5" />
										</span>
										<span className="ml-3 truncate font-medium tabular-nums">
											{mail.bulkSelected.length} selected
										</span>
										<span className="ml-auto pr-3 text-mail-muted text-xs">
											{allVisibleSelected ? "Deselect all" : "Select all"}
										</span>
									</button>
								)}

								{showCategoryNavbar ? (
									<InboxCategoryNavbar
										activeView={activeView}
										onViewChange={(view) => {
											void setViewParam(view === "primary" ? null : view);
											resetNavigation();
										}}
									/>
								) : null}
							</div>

							<div
								ref={listContainerRef}
								className="relative z-1 flex min-h-0 flex-1 flex-col overflow-hidden"
							>
								{threadsError && filteredThreads.length === 0 ? (
									<SectionError
										message="Couldn't load messages"
										onRetry={() => void retryThreads()}
										className="flex-1"
									/>
								) : (
									<ThreadList
										threads={filteredThreads}
										mailboxId={mailbox.id}
										folder={folder}
										sectionLabel={
											showCategoryNavbar
												? activeView === "primary"
													? "Primary"
													: activeView === "alerts"
														? "Alerts"
														: activeView === "person"
															? "Person"
															: "Tag"
												: folderTitle
										}
										selectedId={selectedThreadId}
										onSelect={handleSelectThread}
										isLoading={listLoading}
										hasFilters={
											searchQuery !== "" ||
											activeFilterCount > 0 ||
											(showCategoryNavbar && activeView !== "primary")
										}
										onClearFilters={() => {
											setSearchQuery(null);
											setFilterParam(null);
											void setViewParam(null);
											resetNavigation();
										}}
										focusedIndex={focusedIndex}
										onMouseEnterRow={handleMouseEnter}
										searchQuery={searchQuery}
										onReply={(t) => openThreadComposer(t, "reply")}
										onReplyAll={(t) => openThreadComposer(t, "replyAll")}
										onForward={(t) => openThreadComposer(t, "forward")}
									/>
								)}
							</div>
						</div>
					</ResizablePanel>

					{isDesktop && (
						<>
							<ResizableHandle className="mx-0.5 w-1 rounded-full bg-transparent transition-colors hover:bg-mail-border/60 data-[resize-handle-active]:bg-mail-primary/40" />
							<ResizablePanel
								defaultSize={65}
								minSize={30}
								className="mr-0.5 mb-1 flex min-h-0 flex-col rounded-2xl bg-panel-light lg:h-[calc(100dvh-8px)] dark:bg-panel-dark"
							>
								{detailPane}
							</ResizablePanel>
						</>
					)}
				</ResizablePanelGroup>

				{isDesktop && (
					<AiSidebar
						open={aiOpen}
						onClose={() => setAiOpen(false)}
						thread={selectedThread}
					/>
				)}

				{!isDesktop && selectedThreadId && (
					<div className="fixed inset-0 z-50 flex flex-col bg-panel-light dark:bg-panel-dark">
						{detailPane}
					</div>
				)}
			</div>
		</>
	);
};
