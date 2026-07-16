import { AgentInboxContent } from "#/features/agent-inbox/components/agent-inbox-content";
import { useAgentInbox } from "#/features/agent-inbox/components/agent-inbox-provider";
import { useInboxSidebar } from "#/features/agent-inbox/components/inbox-sidebar-context";
import { useLabelThreadIds } from "#/features/agent-inbox/hooks/use-inbox-labels";
import { useMailboxId } from "#/features/agent-inbox/lib/use-mailbox-id";
import { filterInboxThreads } from "#/features/agent-inbox/utils/inbox-folder-filters";
import { cn } from "@reloop/ui/cn";
import { useNavigate, useParams } from "@tanstack/react-router";
import { FileText, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export function InboxFolderPage() {
	const mailboxId = useMailboxId();
	const { getMailbox, threads } = useAgentInbox();
	const mailbox = mailboxId ? getMailbox(mailboxId) : undefined;

	const filteredThreads = useMemo(
		() => filterInboxThreads(threads, mailboxId),
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
	const mailboxId = useMailboxId();
	const { getMailbox, threads } = useAgentInbox();
	const mailbox = mailboxId ? getMailbox(mailboxId) : undefined;

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

export function SentFolderPage() {
	const mailboxId = useMailboxId();
	const { getMailbox, threads } = useAgentInbox();
	const mailbox = mailboxId ? getMailbox(mailboxId) : undefined;

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
	const mailboxId = useMailboxId();
	const { getMailbox, threads } = useAgentInbox();
	const mailbox = mailboxId ? getMailbox(mailboxId) : undefined;

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
	const mailboxId = useMailboxId();
	const { getMailbox, threads } = useAgentInbox();
	const mailbox = mailboxId ? getMailbox(mailboxId) : undefined;

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
	const mailboxId = useMailboxId();
	const { getMailbox, archivedThreads } = useAgentInbox();
	const mailbox = mailboxId ? getMailbox(mailboxId) : undefined;

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
	const mailboxId = useMailboxId();
	const { getMailbox, trashThreads } = useAgentInbox();
	const mailbox = mailboxId ? getMailbox(mailboxId) : undefined;

	if (!mailbox) return null;

	const filtered = trashThreads.filter((t) => t.mailboxId === mailboxId);

	return (
		<AgentInboxContent mailbox={mailbox} folder="trash" threads={filtered} />
	);
}

export function NeedsApprovalFolderPage() {
	const mailboxId = useMailboxId();
	const { getMailbox, threads } = useAgentInbox();
	const mailbox = mailboxId ? getMailbox(mailboxId) : undefined;

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
	const mailboxId = useMailboxId();
	const { labelId } = useParams({ strict: false }) as { labelId?: string };
	const { getMailbox, threads } = useAgentInbox();
	const { threadIds } = useLabelThreadIds(labelId ?? "");
	const mailbox = mailboxId ? getMailbox(mailboxId) : undefined;

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

type DraftRow = {
	id: string;
	mailboxId: string;
	to: string[];
	subject: string;
	text: string;
	updatedAt: string;
};

export function DraftsFolderPage() {
	const mailboxId = useMailboxId();
	const navigate = useNavigate();
	const { getMailbox, listComposeDrafts, deleteDraft } = useAgentInbox();
	const { openCompose } = useInboxSidebar();
	const mailbox = mailboxId ? getMailbox(mailboxId) : undefined;
	const [drafts, setDrafts] = useState<DraftRow[]>([]);
	const [loading, setLoading] = useState(true);

	const load = useCallback(async () => {
		if (!mailboxId) return;
		setLoading(true);
		try {
			const rows = await listComposeDrafts(mailboxId);
			setDrafts(rows);
		} finally {
			setLoading(false);
		}
	}, [mailboxId, listComposeDrafts]);

	useEffect(() => {
		void load();
	}, [load]);

	if (!mailbox) return null;

	return (
		<div className="flex h-full min-h-0 flex-1 flex-col rounded-2xl bg-panel-light p-4 shadow-sm md:m-1 dark:bg-panel-dark">
			<div className="mb-4 flex items-center justify-between">
				<div>
					<h1 className="font-semibold text-lg text-mail-foreground">Drafts</h1>
					<p className="text-mail-muted text-sm">
						Saved compose drafts for {mailbox.email}
					</p>
				</div>
				<button
					type="button"
					onClick={openCompose}
					className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-mail-primary px-3 text-sm text-white"
				>
					<Plus className="h-4 w-4" />
					New
				</button>
			</div>

			{loading ? (
				<div className="flex flex-1 items-center justify-center">
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent dark:border-white dark:border-t-transparent" />
				</div>
			) : drafts.length === 0 ? (
				<div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
					<FileText className="h-8 w-8 text-mail-muted" />
					<p className="font-medium text-mail-foreground">No drafts yet</p>
					<p className="text-mail-muted text-sm">
						Start composing and drafts autosave every few seconds.
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
								onClick={() => {
									void navigate({
										to: "/inbox/$mailboxId",
										params: { mailboxId },
										search: { draftId: d.id } as never,
									});
									openCompose();
								}}
							>
								<p className="truncate font-medium text-mail-foreground text-sm">
									{d.subject || "(No subject)"}
								</p>
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
											void load();
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
