import { cn } from "@reloop/ui/cn";
import { FileText, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";
import { useAgentInbox } from "#/features/agent-inbox/components/agent-inbox-provider";
import { AgentInboxContent } from "#/features/agent-inbox/components/mail-list/agent-inbox-content";
import { ListPanelSkeleton } from "#/features/agent-inbox/components/mail-list/list-panel-skeleton";
import { useInboxSidebar } from "#/features/agent-inbox/components/sidebar/inbox-sidebar-context";
import { useComposeDrafts } from "#/features/agent-inbox/hooks/use-compose-drafts";
import { useLabelThreadIds } from "#/features/agent-inbox/hooks/use-inbox-labels";
import { useFolderMailbox } from "#/features/agent-inbox/lib/use-folder-mailbox";
import { filterInboxThreads } from "#/features/agent-inbox/utils/inbox-folder-filters";

export function InboxFolderPage() {
	const { mailbox, mailboxId } = useFolderMailbox();
	const { threads } = useAgentInbox();

	const filteredThreads = useMemo(
		() => (mailboxId ? filterInboxThreads(threads, mailboxId) : []),
		[threads, mailboxId],
	);

	if (!mailbox) return null;

	return (
		<AgentInboxContent
			mailbox={mailbox}
			folder="inbox"
			threads={filteredThreads}
		/>
	);
}

export function AgentFolderPage() {
	const { mailbox, mailboxId } = useFolderMailbox();
	const { threads } = useAgentInbox();

	const filteredThreads = useMemo(
		() =>
			threads.filter(
				(t) =>
					t.mailboxId === mailboxId &&
					t.direction === "inbound" &&
					t.status === "handled",
			),
		[threads, mailboxId],
	);

	if (!mailbox) return null;

	return (
		<AgentInboxContent
			mailbox={mailbox}
			folder="agent"
			threads={filteredThreads}
		/>
	);
}

export function StarredFolderPage() {
	const { mailbox, mailboxId } = useFolderMailbox();
	const { threads } = useAgentInbox();

	const filteredThreads = useMemo(
		() => threads.filter((t) => t.mailboxId === mailboxId && !!t.isStarred),
		[threads, mailboxId],
	);

	if (!mailbox) return null;

	return (
		<AgentInboxContent
			mailbox={mailbox}
			folder="starred"
			threads={filteredThreads}
		/>
	);
}

export function SentFolderPage() {
	const { mailbox, mailboxId } = useFolderMailbox();
	const { threads } = useAgentInbox();

	const filteredThreads = useMemo(
		() =>
			threads.filter(
				(t) => t.mailboxId === mailboxId && t.direction === "outbound",
			),
		[threads, mailboxId],
	);

	if (!mailbox) return null;

	return (
		<AgentInboxContent
			mailbox={mailbox}
			folder="sent"
			threads={filteredThreads}
		/>
	);
}

export function YouFolderPage() {
	const { mailbox, mailboxId } = useFolderMailbox();
	const { threads } = useAgentInbox();

	const filteredThreads = useMemo(
		() =>
			threads.filter(
				(t) => t.mailboxId === mailboxId && t.direction === "outbound",
			),
		[threads, mailboxId],
	);

	if (!mailbox) return null;

	return (
		<AgentInboxContent
			mailbox={mailbox}
			folder="you"
			threads={filteredThreads}
		/>
	);
}

export function SpamFolderPage() {
	const { mailbox, mailboxId } = useFolderMailbox();
	const { threads } = useAgentInbox();

	const filteredThreads = useMemo(
		() =>
			threads.filter(
				(t) =>
					t.mailboxId === mailboxId &&
					t.direction === "inbound" &&
					t.status === "blocked",
			),
		[threads, mailboxId],
	);

	if (!mailbox) return null;

	return (
		<AgentInboxContent
			mailbox={mailbox}
			folder="spam"
			threads={filteredThreads}
		/>
	);
}

export function ArchiveFolderPage() {
	const { mailbox, mailboxId } = useFolderMailbox();
	const { archivedThreads } = useAgentInbox();

	const filteredThreads = useMemo(
		() => archivedThreads.filter((t) => t.mailboxId === mailboxId),
		[archivedThreads, mailboxId],
	);

	if (!mailbox) return null;

	return (
		<AgentInboxContent
			mailbox={mailbox}
			folder="archive"
			threads={filteredThreads}
		/>
	);
}

export function TrashFolderPage() {
	const { mailbox, mailboxId } = useFolderMailbox();
	const { trashThreads } = useAgentInbox();

	if (!mailbox) return null;

	const filtered = trashThreads.filter((t) => t.mailboxId === mailboxId);

	return (
		<AgentInboxContent mailbox={mailbox} folder="trash" threads={filtered} />
	);
}

export function NeedsApprovalFolderPage() {
	const { mailbox, mailboxId } = useFolderMailbox();
	const { threads } = useAgentInbox();

	const filteredThreads = useMemo(
		() =>
			threads.filter(
				(t) =>
					t.mailboxId === mailboxId &&
					t.direction === "inbound" &&
					t.status === "needs_approval",
			),
		[threads, mailboxId],
	);

	if (!mailbox) return null;

	return (
		<AgentInboxContent
			mailbox={mailbox}
			folder="needs_approval"
			threads={filteredThreads}
		/>
	);
}

export function LabelFolderPage() {
	const { labelId } = useParams() as { labelId?: string };
	const { mailbox, mailboxId } = useFolderMailbox();
	const { threads } = useAgentInbox();
	const { threadIds } = useLabelThreadIds(labelId ?? "");

	const filteredThreads = useMemo(() => {
		const assignedIds = new Set(threadIds);
		return threads.filter(
			(t) =>
				t.mailboxId === mailboxId &&
				(assignedIds.has(t.id) ||
					(t.threadId ? assignedIds.has(t.threadId) : false)),
		);
	}, [threads, mailboxId, threadIds]);

	if (!mailbox || !labelId) return null;

	return (
		<AgentInboxContent
			mailbox={mailbox}
			folder={`label:${labelId}`}
			threads={filteredThreads}
		/>
	);
}

function draftKindLabel(kind: string) {
	switch (kind) {
		case "reply":
			return "Reply";
		case "reply_all":
			return "Reply all";
		case "forward":
			return "Forward";
		default:
			return "Compose";
	}
}

function draftComposeParam(
	kind: string,
): "reply" | "replyAll" | "forward" | null {
	if (kind === "reply") return "reply";
	if (kind === "reply_all") return "replyAll";
	if (kind === "forward") return "forward";
	return null;
}

export function DraftsFolderPage() {
	const router = useRouter();
	const { mailbox, mailboxId } = useFolderMailbox();
	const { deleteDraft } = useAgentInbox();
	const { openCompose } = useInboxSidebar();
	const { drafts, isLoading, refresh } = useComposeDrafts(mailboxId);

	if (!mailbox) return null;

	const openDraft = (d: (typeof drafts)[number]) => {
		if (!mailboxId) return;
		const compose = draftComposeParam(d.kind);
		if (compose && d.threadId) {
			const qs = new URLSearchParams({
				threadId: d.threadId,
				draftId: d.id,
				compose,
			});
			router.push(`/inbox/${mailboxId}?${qs}`);
			return;
		}
		router.push(`/inbox/${mailboxId}?draftId=${encodeURIComponent(d.id)}`);
		openCompose();
	};

	return (
		<div className="flex h-full min-h-0 flex-1 flex-col bg-panel-light p-4 dark:bg-panel-dark">
			<div className="mb-4 flex items-center justify-between">
				<div>
					<h1 className="font-semibold text-lg text-mail-foreground">Drafts</h1>
					<p className="text-mail-muted text-sm">
						Saved drafts for {mailbox.email}
					</p>
				</div>
			</div>

			{isLoading ? (
				<ListPanelSkeleton className="min-h-0 flex-1 shadow-none" />
			) : drafts.length === 0 ? (
				<div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
					<FileText className="h-8 w-8 text-mail-muted" />
					<p className="font-medium text-mail-foreground">No drafts yet</p>
					<p className="text-mail-muted text-sm">
						Compose and reply drafts autosave every few seconds.
					</p>
				</div>
			) : (
				<div className="divide-y divide-mail-border overflow-y-auto rounded-xl border border-mail-border">
					{drafts.map((d) => (
						<div
							key={d.id}
							className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--inbox-hover)]"
						>
							<button
								type="button"
								className="min-w-0 flex-1 text-left"
								onClick={() => openDraft(d)}
							>
								<div className="mb-0.5 flex items-center gap-2">
									<span className="rounded-md bg-[var(--inbox-muted-bg)] px-1.5 py-0.5 font-medium text-[10px] text-mail-muted uppercase tracking-wide">
										{draftKindLabel(d.kind)}
									</span>
									<p className="truncate font-medium text-mail-foreground text-sm">
										{d.subject || "(No subject)"}
									</p>
								</div>
								<p className="truncate text-mail-muted text-xs">
									{d.to?.length ? `To: ${d.to.join(", ")}` : "No recipients"}
									{d.text ? ` — ${d.text.slice(0, 80)}` : ""}
								</p>
							</button>
							<span className="shrink-0 text-[11px] text-mail-muted">
								{new Date(d.updatedAt).toLocaleString()}
							</span>
							<button
								type="button"
								className={cn(
									"inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-red-500/10",
								)}
								onClick={() => {
									void deleteDraft(d.id)
										.then(() => {
											toast.success("Draft deleted");
											void refresh();
										})
										.catch(() => toast.error("Failed to delete draft"));
								}}
								aria-label="Delete draft"
							>
								<Trash2 className="h-3.5 w-3.5 text-red-500" />
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
