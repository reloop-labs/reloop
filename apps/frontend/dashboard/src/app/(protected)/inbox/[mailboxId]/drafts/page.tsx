"use client";

import { useAgentInbox } from "@fe/dashboard/app/(protected)/inbox/components/agent-inbox-provider";
import { useInboxSidebar } from "@fe/dashboard/app/(protected)/inbox/components/inbox-sidebar-context";
import { cn } from "@reloop/ui/cn";
import { FileText, Plus, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type DraftRow = {
	id: string;
	mailboxId: string;
	to: string[];
	subject: string;
	text: string;
	updatedAt: string;
};

export default function AgentInboxDraftsPage() {
	const params = useParams<{ mailboxId: string }>();
	const mailboxId = params.mailboxId;
	const router = useRouter();
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
		<div className="flex h-full min-h-0 flex-1 flex-col rounded-2xl bg-panel-light p-4 shadow-sm dark:bg-panel-dark md:m-1">
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
									router.push(
										`/inbox/${mailboxId}?draftId=${encodeURIComponent(d.id)}`,
									);
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
