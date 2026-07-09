"use client";

import { useAgentInbox } from "@fe/dashboard/app/(protected)/inbox/components/agent-inbox-provider";
import {
	AiSidebar,
	useAiSidebar,
} from "@fe/dashboard/app/(protected)/inbox/components/ai-sidebar";
import {
	applyInboxFilters,
	InboxCommandPalette,
	InboxSearchTrigger,
	useInboxActiveFilterCount,
} from "@fe/dashboard/app/(protected)/inbox/components/inbox-command-palette";
import { InboxEmptyState } from "@fe/dashboard/app/(protected)/inbox/components/inbox-empty-state";
import { useInboxSidebar } from "@fe/dashboard/app/(protected)/inbox/components/inbox-sidebar-context";
import { InboxSidebarToggle } from "@fe/dashboard/app/(protected)/inbox/components/inbox-sidebar-toggle";
import { SnoozeDialog } from "@fe/dashboard/app/(protected)/inbox/components/thread-detail/snooze-dialog";
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
import { useInboxUndo } from "@fe/dashboard/app/(protected)/inbox/hooks/use-inbox-undo";
import {
	findThreadByListId,
	groupThreadsByConversation,
} from "@fe/dashboard/app/(protected)/inbox/utils/group-threads";
import type {
	AgentMailbox,
	BatchThreadAction,
	InboundThread,
} from "@fe/dashboard/app/(protected)/inbox/types";
import { cn } from "@reloop/ui/cn";
import {
	Archive,
	MailOpen,
	RefreshCcw,
	Star,
	Trash2,
	X,
} from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";

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
	const { markMessageRead, batchThreads, snoozeThread, refresh } =
		useAgentInbox();
	const { toggleSidebar, openCompose } = useInboxSidebar();
	const { open: aiOpen, setOpen: setAiOpen, toggle: toggleAi } = useAiSidebar();
	const { pushBatchUndo, undo } = useInboxUndo();
	const [mail, setMail] = useInboxMail();
	const isDesktop = useMediaQuery("(min-width: 1024px)");
	const listContainerRef = useRef<HTMLDivElement>(null);
	const [paletteOpen, setPaletteOpen] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [snoozeThreadTarget, setSnoozeThreadTarget] =
		useState<InboundThread | null>(null);
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
		(mail.bulkSelected.length > 0 || focusedIndex !== null || !!selectedThreadId);

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
		{ enabled: hotkeysEnabled && mail.bulkSelected.length > 0, preventDefault: true },
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
			onBack={!isDesktop ? handleCloseThread : undefined}
			showBack={!isDesktop}
			onToggleAi={toggleAi}
		/>
	) : (
		<InboxEmptyState
			onCompose={openCompose}
			onOpenAi={toggleAi}
		/>
	);

	return (
		<>
			<InboxCommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
			<SnoozeDialog
				open={!!snoozeThreadTarget}
				onOpenChange={(open) => {
					if (!open) setSnoozeThreadTarget(null);
				}}
				onConfirm={(until) => {
					if (!snoozeThreadTarget) return;
					const id =
						snoozeThreadTarget.threadId || snoozeThreadTarget.id;
					void snoozeThread(id, until)
						.then(() => {
							toast.success("Snoozed");
							setSnoozeThreadTarget(null);
						})
						.catch((err: unknown) =>
							toast.error(
								err instanceof Error ? err.message : "Failed to snooze",
							),
						);
				}}
			/>
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
							"mb-1 flex min-h-0 flex-1 flex-col bg-panel-light dark:bg-panel-dark shadow-sm md:mr-[3px] md:rounded-2xl lg:h-[calc(100dvh-8px)]",
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
										<div className="flex flex-1 items-center justify-between gap-2">
											<div className="font-medium text-mail-foreground text-sm">
												{mail.bulkSelected.length} selected
											</div>
											<div className="flex items-center gap-1">
												<button
													type="button"
													title="Archive"
													onClick={() =>
														void runBulkAction("archive", "Archived")
													}
													className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--inbox-control)] hover:bg-[var(--inbox-control-hover)]"
												>
													<Archive className="h-3.5 w-3.5 text-mail-muted" />
												</button>
												<button
													type="button"
													title="Trash"
													onClick={() =>
														void runBulkAction("trash", "Moved to trash")
													}
													className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--inbox-control)] hover:bg-[var(--inbox-control-hover)]"
												>
													<Trash2 className="h-3.5 w-3.5 text-mail-muted" />
												</button>
												<button
													type="button"
													title="Spam"
													onClick={() =>
														void runBulkAction("spam", "Moved to spam")
													}
													className="inline-flex h-8 items-center justify-center rounded-lg bg-[var(--inbox-control)] px-2 text-[11px] text-mail-muted hover:bg-[var(--inbox-control-hover)]"
												>
													Spam
												</button>
												<button
													type="button"
													title="Star"
													onClick={() =>
														void runBulkAction("star", "Starred")
													}
													className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--inbox-control)] hover:bg-[var(--inbox-control-hover)]"
												>
													<Star className="h-3.5 w-3.5 text-mail-muted" />
												</button>
												<button
													type="button"
													title="Mark read"
													onClick={() =>
														void runBulkAction("read", "Marked as read")
													}
													className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--inbox-control)] hover:bg-[var(--inbox-control-hover)]"
												>
													<MailOpen className="h-3.5 w-3.5 text-mail-muted" />
												</button>
												<button
													type="button"
													onClick={handleExitBulkSelection}
													className="inline-flex h-8 items-center gap-2 rounded-lg bg-mail-accent px-2 text-xs"
												>
													<X className="h-3 w-3" />
													<span>ESC</span>
												</button>
											</div>
										</div>
									)}

									<button
										type="button"
										onClick={handleRefresh}
										disabled={isRefreshing}
										className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-[var(--inbox-hover)] disabled:opacity-50"
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
									mailboxId={mailbox.id}
									folder={folder}
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
									searchQuery={searchQuery}
									onReply={(t) => openThreadComposer(t, "reply")}
									onReplyAll={(t) => openThreadComposer(t, "replyAll")}
									onForward={(t) => openThreadComposer(t, "forward")}
									onSnooze={(t) => setSnoozeThreadTarget(t)}
								/>
							</div>
						</div>
					</ResizablePanel>

					{isDesktop && (
						<ResizablePanel
							defaultSize={65}
							minSize={30}
							className="mb-1 mr-0.5 flex min-h-0 flex-col rounded-2xl bg-panel-light dark:bg-panel-dark shadow-sm lg:h-[calc(100dvh-8px)]"
						>
							{detailPane}
						</ResizablePanel>
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
