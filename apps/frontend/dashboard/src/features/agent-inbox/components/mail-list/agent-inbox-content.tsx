import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { parseAsString, useQueryState } from "nuqs";
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
	useInboxActiveFilterCount,
} from "#/features/agent-inbox/components/mail-list/inbox-command-palette";
import { InboxEmptyState } from "#/features/agent-inbox/components/mail-list/inbox-empty-state";
import {
	ThreadList,
	useInboxNavigation,
} from "#/features/agent-inbox/components/mail-list/thread-list";
import { useInboxMail } from "#/features/agent-inbox/components/mail-list/use-inbox-mail";
import { LoadingDot } from "#/features/agent-inbox/components/shared/loading-dot";
import { SectionError } from "#/features/agent-inbox/components/shared/section-error";
import { useInboxSidebar } from "#/features/agent-inbox/components/sidebar/inbox-sidebar-context";
import { ThreadDetail } from "#/features/agent-inbox/components/thread-detail";
import { useInboxUndo } from "#/features/agent-inbox/hooks/use-inbox-undo";
import type {
	AgentMailbox,
	BatchThreadAction,
	InboundThread,
	InboxView,
} from "#/features/agent-inbox/types";
import { INBOX_VIEWS } from "#/features/agent-inbox/types";
import {
	applyInboxViewFilter,
	findThreadByListId,
	groupThreadsByConversation,
} from "#/features/agent-inbox/utils/group-threads";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";

const INBOX_VIEW_IDS = new Set<string>(INBOX_VIEWS.map((view) => view.id));

function parseInboxView(value: string): InboxView {
	return INBOX_VIEW_IDS.has(value) ? (value as InboxView) : "all";
}

const TAB_EMPTY: Record<InboxView, { title: string; description: string }> = {
	all: {
		title: "No received mail yet",
		description:
			"Inbox shows emails sent to this address. Outbound mail lives in Sent.",
	},
	unread: {
		title: "You're all caught up",
		description: "No unread mail in this inbox.",
	},
	needs_approval: {
		title: "Nothing to review",
		description: "Agent drafts that need your approval will show up here.",
	},
	starred: {
		title: "No starred mail",
		description: "Star a thread to keep it here.",
	},
};

const FOLDER_TITLES: Record<string, string> = {
	inbox: "Inbox",
	agent: "Agent",
	sent: "Sent",
	archive: "Archive",
	spam: "Spam",
	trash: "Trash",
	drafts: "Drafts",
	starred: "Starred",
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
	const { openCompose } = useInboxSidebar();
	const { pushBatchUndo, undo } = useInboxUndo();
	const [mail, setMail] = useInboxMail();
	const isDesktop = useMediaQuery("(min-width: 1024px)");
	const {
		open: aiOpen,
		setOpen: setAiOpen,
		toggle: toggleAi,
	} = useAiSidebar({ defaultOpen: true });
	const listContainerRef = useRef<HTMLDivElement>(null);
	const [paletteOpen, setPaletteOpen] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const activeFilterCount = useInboxActiveFilterCount();

	useEffect(() => {
		const openSearch = () => setPaletteOpen(true);
		window.addEventListener("inbox:open-search", openSearch);
		return () => window.removeEventListener("inbox:open-search", openSearch);
	}, []);

	const [searchQuery, setSearchQuery] = useQueryState(
		"q",
		parseAsString.withDefault(""),
	);
	const [filterParam, setFilterParam] = useQueryState(
		"filter",
		parseAsString.withDefault(""),
	);
	const [tabParam, setTabParam] = useQueryState(
		"tab",
		parseAsString.withDefault("all"),
	);
	const [selectedThreadId, setSelectedThreadId] = useQueryState(
		"threadId",
		parseAsString.withDefault(""),
	);
	const activeTab = parseInboxView(tabParam);
	const showInboxTabs = folder === "inbox";

	const folderTitle = folder.startsWith("label:")
		? "Label"
		: (FOLDER_TITLES[folder] ?? "Inbox");

	useEffect(() => {
		setMail((prev) =>
			prev.bulkSelected.length === 0 ? prev : { ...prev, bulkSelected: [] },
		);
	}, [setMail]);

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
		return showInboxTabs ? applyInboxViewFilter(searched, activeTab) : searched;
	}, [groupedThreads, searchQuery, filterParam, showInboxTabs, activeTab]);

	const tabCounts = useMemo(() => {
		if (!showInboxTabs) return undefined;
		return {
			unread: groupedThreads.filter((t) => t.unread).length,
			starred: groupedThreads.filter((t) => t.isStarred).length,
			needs_approval: groupedThreads.filter(
				(t) => t.status === "needs_approval",
			).length,
		};
	}, [groupedThreads, showInboxTabs]);

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
			if (thread?.unread) {
				const messageId = thread.messageId || thread.id;
				if (messageId) {
					markMessageRead(messageId, true, {
						threadId: thread.threadId ?? null,
					}).catch(() => {});
				}
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
				const messageId = thread?.messageId || thread?.id;
				if (messageId) {
					markMessageRead(messageId, true, {
						threadId: thread?.threadId ?? null,
					}).catch(() => {});
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
				const undoAction: BatchThreadAction | null =
					action === "archive"
						? "restore"
						: action === "restore" || action === "unarchive"
							? "archive"
							: null;
				toast.success(success, {
					action: undoAction
						? {
								label: "Undo",
								onClick: () => void batchThreads(ids, undoAction),
							}
						: undefined,
				});
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

	const inArchiveFolder = folder === "archive" || folder === "archived";

	const handleArchiveOrUnarchiveHotKey = useCallback(
		(e: KeyboardEvent) => {
			if (isTypingTarget(e.target)) return;
			const targetAction: BatchThreadAction = inArchiveFolder
				? "restore"
				: "archive";
			const successMsg = inArchiveFolder ? "Moved to inbox" : "Archived";
			if (mail.bulkSelected.length > 0) {
				void runBulkAction(targetAction, successMsg);
				return;
			}
			if (!selectedThread) return;
			const id = selectedThread.threadId || selectedThread.id;
			void batchThreads([id], targetAction)
				.then(() => {
					const undoAction: BatchThreadAction = inArchiveFolder
						? "archive"
						: "restore";
					toast.success(successMsg, {
						action: {
							label: "Undo",
							onClick: () => void batchThreads([id], undoAction),
						},
					});
				})
				.catch((err: unknown) =>
					toast.error(
						err instanceof Error ? err.message : "Failed to update thread",
					),
				);
		},
		[
			inArchiveFolder,
			mail.bulkSelected.length,
			selectedThread,
			runBulkAction,
			batchThreads,
		],
	);

	useHotkeys(
		"e, y",
		(e) => {
			handleArchiveOrUnarchiveHotKey(e as any);
		},
		{ enabled: hotkeysEnabled, preventDefault: true },
		[handleArchiveOrUnarchiveHotKey, hotkeysEnabled],
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
			void markMessageRead(msgId, false, {
				threadId: selectedThread.threadId ?? null,
			})
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

	const isThreadOpen = !!selectedThreadId;

	// Escape closes bulk select first, then returns from detail → list (Gmail-style).
	useHotkeys(
		"escape",
		(e) => {
			if (isTypingTarget(e.target)) return;
			if (mail.bulkSelected.length > 0) {
				handleExitBulkSelection();
				return;
			}
			if (isThreadOpen) {
				e.preventDefault();
				handleCloseThread();
			}
		},
		{ enabled: !paletteOpen, enableOnFormTags: false },
		[
			mail.bulkSelected.length,
			isThreadOpen,
			handleExitBulkSelection,
			handleCloseThread,
			paletteOpen,
		],
	);

	const detailPane = selectedThread ? (
		<ThreadDetail
			thread={selectedThread}
			mailbox={mailbox}
			folder={folder}
			onBack={handleCloseThread}
			showBack
			onToggleAi={toggleAi}
		/>
	) : selectedThreadId && threadsError ? (
		<div className="flex h-full min-h-0 flex-col">
			<div className="flex h-11 shrink-0 items-center gap-2 px-3">
				<button
					type="button"
					onClick={handleCloseThread}
					className="inline-flex size-8 items-center justify-center rounded-lg text-mail-muted hover:bg-[var(--inbox-row-hover)] hover:text-mail-foreground"
					aria-label="Back to list"
				>
					<Icon name="arrow-left" className="h-4 w-4" />
				</button>
				<span className="text-mail-muted text-sm">Back</span>
			</div>
			<SectionError
				message="Couldn't load this conversation"
				onRetry={() => void retryThreads()}
				className="flex-1"
			/>
		</div>
	) : selectedThreadId && (isLoadingThreads || listLoading) ? (
		<div className="flex h-full min-h-0 flex-col items-center justify-center">
			<LoadingDot
				label="Loading conversation"
				className="text-mail-muted"
				size={28}
				dotSize={3}
			/>
		</div>
	) : selectedThreadId ? (
		<div className="flex h-full min-h-0 flex-col items-center justify-center gap-3 p-6">
			<p className="text-mail-muted text-sm">Conversation not found</p>
			<button
				type="button"
				onClick={handleCloseThread}
				className="rounded-lg bg-[var(--inbox-control)] px-3 py-1.5 text-mail-foreground text-sm hover:bg-[var(--inbox-control-hover)]"
			>
				Back to list
			</button>
		</div>
	) : null;

	const listPane = (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="sticky top-0 z-15 shrink-0 bg-bg-white-0 dark:bg-black">
				<div className="flex h-11 items-center pr-6 pl-4">
					<span className="ml-1 flex w-5 shrink-0 items-center justify-center">
						<button
							type="button"
							aria-label={
								allVisibleSelected
									? "Deselect all threads"
									: "Select all threads"
							}
							aria-pressed={allVisibleSelected}
							disabled={filteredThreads.length === 0}
							onClick={handleToggleSelectAll}
							className={cn(
								"flex size-4 items-center justify-center rounded border transition-colors disabled:opacity-40",
								allVisibleSelected || mail.bulkSelected.length > 0
									? "border-zero-blue bg-zero-blue text-white"
									: "border-mail-border bg-transparent hover:border-mail-foreground/40",
							)}
						>
							{(allVisibleSelected || mail.bulkSelected.length > 0) && (
								<Icon
									name={allVisibleSelected ? "check" : "minus"}
									className="h-2.5 w-2.5 text-white"
								/>
							)}
						</button>
					</span>
					{!showInboxTabs ? (
						<>
							<span className="w-3 shrink-0" aria-hidden="true" />
							<h1 className="min-w-0 truncate font-semibold text-[18px] text-mail-foreground">
								{folderTitle}
							</h1>
						</>
					) : null}
					{mail.bulkSelected.length === 0 ? (
						<div className="flex items-center gap-1 text-mail-muted">
							{activeFilterCount > 0 && (
								<span className="mr-1 rounded-full bg-zero-blue/15 px-1.5 py-0.5 font-medium text-[11px] text-zero-blue tabular-nums">
									{activeFilterCount}
								</span>
							)}
							<button
								type="button"
								onClick={handleRefresh}
								disabled={isRefreshing}
								title="Refresh"
								aria-label="Refresh"
								className="inline-flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--inbox-row-hover)] disabled:opacity-50"
							>
								{isRefreshing ? (
									<LoadingDot
										label="Refreshing"
										className="text-mail-muted"
										style={{ fontSize: 12 }}
									/>
								) : (
									<Icon name="refresh-cw" className="h-4 w-4 text-mail-muted" />
								)}
							</button>
						</div>
					) : (
						<div className="ml-auto flex items-center gap-1">
							{inArchiveFolder ? (
								<button
									type="button"
									title="Move to inbox"
									onClick={() =>
										void runBulkAction("restore", "Moved to inbox")
									}
									className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--inbox-control)] hover:bg-[var(--inbox-control-hover)]"
								>
									<Icon name="inbox" className="h-3.5 w-3.5 text-mail-muted" />
								</button>
							) : (
								<button
									type="button"
									title="Archive"
									onClick={() => void runBulkAction("archive", "Archived")}
									className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--inbox-control)] hover:bg-[var(--inbox-control-hover)]"
								>
									<Icon
										name="archive"
										className="h-3.5 w-3.5 text-mail-muted"
									/>
								</button>
							)}
							<button
								type="button"
								title="Trash"
								onClick={() => void runBulkAction("trash", "Moved to trash")}
								className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--inbox-control)] hover:bg-[var(--inbox-control-hover)]"
							>
								<Icon name="trash" className="h-3.5 w-3.5 text-mail-muted" />
							</button>
							<button
								type="button"
								title="Spam"
								onClick={() => void runBulkAction("spam", "Moved to spam")}
								className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--inbox-control)] hover:bg-[var(--inbox-control-hover)]"
							>
								<Icon name="alert" className="h-3.5 w-3.5 text-mail-muted" />
							</button>
							<button
								type="button"
								title="Star"
								onClick={() => void runBulkAction("star", "Starred")}
								className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--inbox-control)] hover:bg-[var(--inbox-control-hover)]"
							>
								<Icon name="star" className="h-3.5 w-3.5 text-mail-muted" />
							</button>
							<button
								type="button"
								title="Pin"
								onClick={() => void runBulkAction("pin", "Pinned")}
								className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--inbox-control)] hover:bg-[var(--inbox-control-hover)]"
							>
								<Icon name="pin" className="h-3.5 w-3.5 text-mail-muted" />
							</button>
							<button
								type="button"
								title="Mark read"
								onClick={() => void runBulkAction("read", "Marked as read")}
								className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--inbox-control)] hover:bg-[var(--inbox-control-hover)]"
							>
								<Icon name="mail" className="h-3.5 w-3.5 text-mail-muted" />
							</button>
							<button
								type="button"
								onClick={handleToggleSelectAll}
								title={allVisibleSelected ? "Deselect all" : "Select all"}
								className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[var(--inbox-control)] px-2 text-mail-muted text-xs hover:bg-[var(--inbox-control-hover)]"
							>
								<span className="font-medium text-mail-foreground tabular-nums">
									{mail.bulkSelected.length}
								</span>
								selected
							</button>
							<button
								type="button"
								onClick={handleExitBulkSelection}
								className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-mail-accent px-2 text-xs"
							>
								<Icon name="cross" className="h-3 w-3" />
								<ActionKbd className="w-auto min-w-4 px-1">esc</ActionKbd>
							</button>
						</div>
					)}
				</div>
				{showInboxTabs ? (
					<InboxCategoryNavbar
						activeView={activeTab}
						onViewChange={(view) => {
							void setTabParam(view === "all" ? null : view);
						}}
						counts={tabCounts}
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
				) : filteredThreads.length === 0 && !listLoading && !threadsError ? (
					<div className="flex min-h-0 flex-1 items-center justify-center p-6">
						<InboxEmptyState
							title={
								showInboxTabs
									? TAB_EMPTY[activeTab].title
									: folder === "inbox"
										? "No received mail yet"
										: "It's empty here"
							}
							description={
								showInboxTabs
									? TAB_EMPTY[activeTab].description
									: folder === "inbox"
										? "Inbox shows emails sent to this address. Outbound mail lives in Sent."
										: folder === "sent"
											? "Emails you send from this address will show up here."
											: "Choose an email to view details"
							}
							onCompose={openCompose}
							onOpenAi={toggleAi}
						/>
					</div>
				) : (
					<ThreadList
						threads={filteredThreads}
						mailboxId={mailbox.id}
						folder={folder}
						selectedId={selectedThreadId}
						onSelect={handleSelectThread}
						isLoading={listLoading}
						hasFilters={searchQuery !== "" || activeFilterCount > 0}
						onClearFilters={() => {
							setSearchQuery(null);
							setFilterParam(null);
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
	);

	return (
		<>
			<InboxCommandPalette
				open={paletteOpen}
				onOpenChange={setPaletteOpen}
				threads={groupedThreads}
				onSelectThread={handleSelectThread}
			/>
			{/* Gmail-style: list OR detail fills the main pane (not side-by-side). */}
			<div className="relative flex min-h-0 min-w-0 flex-1 p-0">
				<div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-bg-white-0 dark:bg-black">
					{isThreadOpen ? detailPane : listPane}
				</div>

				{isDesktop && aiOpen && (
					<AiSidebar
						open={aiOpen}
						onClose={() => setAiOpen(false)}
						thread={selectedThread}
					/>
				)}
			</div>
		</>
	);
};
