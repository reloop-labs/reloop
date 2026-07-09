"use client";

import { useAgentInbox } from "@fe/dashboard/app/(protected)/inbox/components/agent-inbox-provider";
import type { AgentMailbox } from "@fe/dashboard/app/(protected)/inbox/types";
import {
	getAvatarGradient,
	getAvatarInitial,
} from "@fe/dashboard/utils/avatar";
import { cn } from "@reloop/ui/cn";
import { Check, Copy, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const InboxNavUser = ({
	mailbox,
	collapsed,
	onAddMailbox,
}: {
	mailbox: AgentMailbox;
	collapsed: boolean;
	onAddMailbox: () => void;
}) => {
	const router = useRouter();
	const { mailboxes } = useAgentInbox();

	const otherMailboxes = useMemo(
		() => mailboxes.filter((m) => m.id !== mailbox.id),
		[mailboxes, mailbox.id],
	);

	const displayName = mailbox.label || mailbox.email.split("@")[0];

	const switchMailbox = (id: string) => {
		if (id === mailbox.id) return;
		router.push(`/inbox/${id}`);
	};

	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(mailbox.email);
		setCopied(true);
		toast.success("Email copied");
		setTimeout(() => setCopied(false), 2000);
	};

	if (collapsed) {
		return (
			<button
				type="button"
				onClick={() => switchMailbox(mailbox.id)}
				className="mx-auto flex h-7 w-7 items-center justify-center rounded-[8px] font-semibold text-[11px] text-white uppercase ring-2 ring-zero-blue ring-offset-2 ring-offset-[var(--sidebar-background)] focus:outline-none"
				style={{ background: undefined }}
				title={mailbox.email}
			>
				<div
					className={cn(
						"flex h-7 w-7 items-center justify-center rounded-[8px] font-semibold text-[11px] text-white uppercase",
						getAvatarGradient(mailbox.email),
					)}
				>
					{getAvatarInitial(mailbox.label, mailbox.email)}
				</div>
			</button>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={() => switchMailbox(mailbox.id)}
					className="relative shrink-0 rounded-[8px] ring-2 ring-zero-blue ring-offset-2 ring-offset-[var(--sidebar-background)] focus:outline-none"
				>
					<div
						className={cn(
							"flex h-7 w-7 items-center justify-center rounded-[8px] font-semibold text-[11px] text-white uppercase",
							getAvatarGradient(mailbox.email),
						)}
					>
						{getAvatarInitial(mailbox.label, mailbox.email)}
					</div>
				</button>

				{otherMailboxes.slice(0, 2).map((m) => (
					<button
						key={m.id}
						type="button"
						title={m.email}
						onClick={() => switchMailbox(m.id)}
						className="relative shrink-0 rounded-[8px] transition-all hover:ring-2 hover:ring-mail-muted hover:ring-offset-2 hover:ring-offset-[var(--sidebar-background)] focus:outline-none"
					>
						<div
							className={cn(
								"flex h-7 w-7 items-center justify-center rounded-[8px] font-semibold text-[11px] text-white uppercase",
								getAvatarGradient(m.email),
							)}
						>
							{getAvatarInitial(m.label, m.email)}
						</div>
					</button>
				))}

				<button
					type="button"
					onClick={onAddMailbox}
					className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-[8px] border border-mail-muted border-dashed bg-[var(--inbox-muted-bg)] text-mail-muted transition-colors hover:bg-[var(--inbox-hover)] hover:text-mail-foreground focus:outline-none"
					aria-label="Add mailbox"
				>
					<Plus className="size-4" />
				</button>
			</div>

			<div className="mt-2 flex w-full flex-col gap-1.5 text-left">
				<div className="flex items-center gap-1 font-medium text-[14px] text-mail-foreground leading-none">
					<p className="max-w-[14.5ch] truncate">{displayName}</p>
				</div>
				<div className="group/copy flex w-full items-center justify-between gap-1.5">
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							handleCopy();
						}}
						className="h-5 flex-1 min-w-0 truncate text-left text-[13px] text-mail-muted leading-none transition-colors hover:text-mail-foreground focus:outline-none"
						title="Copy email address"
					>
						{mailbox.email}
					</button>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							handleCopy();
						}}
						className="shrink-0 flex items-center justify-center text-mail-muted transition-colors hover:text-mail-foreground focus:outline-none"
						title="Copy email address"
					>
						{copied ? (
							<Check className="size-3.5 text-green-500" />
						) : (
							<Copy className="size-3.5 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
						)}
					</button>
				</div>
			</div>
		</div>
	);
};
