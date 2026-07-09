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
			<div className="relative mx-auto flex h-9 w-9 items-center justify-center shrink-0">
				<div className="absolute inset-0 rounded-[12px] bg-gradient-to-tr from-[#A855F7] via-[#EC4899] to-[#FF9500]" />
				<div className="absolute h-8 w-8 rounded-[10px] bg-[var(--sidebar-background)]" />
				<button
					type="button"
					onClick={() => switchMailbox(mailbox.id)}
					className="relative z-10 flex h-7 w-7 items-center justify-center rounded-[8px] font-semibold text-[11px] text-white uppercase focus:outline-none"
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
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-2">
				<div className="relative flex h-9 w-9 items-center justify-center shrink-0">
					<div className="absolute inset-0 rounded-[12px] bg-gradient-to-tr from-[#A855F7] via-[#EC4899] to-[#FF9500]" />
					<div className="absolute h-8 w-8 rounded-[10px] bg-[var(--sidebar-background)]" />
					<button
						type="button"
						onClick={() => switchMailbox(mailbox.id)}
						className="relative z-10 flex h-7 w-7 items-center justify-center rounded-[8px] font-semibold text-[11px] text-white uppercase focus:outline-none"
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
				</div>

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
				<div className="flex w-full items-center gap-1.5">
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							handleCopy();
						}}
						className="h-5 max-w-[170px] cursor-pointer truncate text-left text-[13px] text-mail-muted leading-none transition-colors hover:text-mail-foreground focus:outline-none"
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
						className="flex shrink-0 cursor-pointer items-center justify-center text-mail-muted transition-colors hover:text-mail-foreground focus:outline-none"
						title="Copy email address"
					>
						{copied ? (
							<Check className="size-3 text-green-500" />
						) : (
							<Copy className="size-2.5" />
						)}
					</button>
				</div>
			</div>
		</div>
	);
};
