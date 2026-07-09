"use client";

import { useAgentInbox } from "@fe/dashboard/app/(protected)/inbox/components/agent-inbox-provider";
import type { AgentMailbox } from "@fe/dashboard/app/(protected)/inbox/types";
import {
	getAvatarGradient,
	getAvatarInitial,
} from "@fe/dashboard/utils/avatar";
import * as Dropdown from "@reloop/ui/dropdown";
import { cn } from "@reloop/ui/cn";
import {
	Copy,
	LogOut,
	Moon,
	Plus,
	RefreshCcw,
	Settings,
	Sun,
	Trash2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";

const ThreeDots = ({ className }: { className?: string }) => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="currentColor"
		className={className}
		aria-hidden
	>
		<circle cx="3" cy="8" r="1.5" />
		<circle cx="8" cy="8" r="1.5" />
		<circle cx="13" cy="8" r="1.5" />
	</svg>
);

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
	const { mailboxes, refresh } = useAgentInbox();
	const { theme, setTheme } = useTheme();

	const otherMailboxes = useMemo(
		() => mailboxes.filter((m) => m.id !== mailbox.id),
		[mailboxes, mailbox.id],
	);

	const displayName = mailbox.label || mailbox.email.split("@")[0];

	const switchMailbox = (id: string) => {
		if (id === mailbox.id) return;
		router.push(`/inbox/${id}`);
	};

	const handleRefresh = async () => {
		try {
			await refresh();
			toast.success("Synced");
		} catch {
			toast.error("Sync failed");
		}
	};

	const handleCopyId = async () => {
		await navigator.clipboard.writeText(mailbox.id);
		toast.success("Mailbox ID copied");
	};

	if (collapsed) {
		return (
			<button
				type="button"
				onClick={() => switchMailbox(mailbox.id)}
				className="mx-auto flex h-7 w-7 items-center justify-center rounded-[5px] font-semibold text-[10px] text-white uppercase"
				style={{ background: undefined }}
				title={mailbox.email}
			>
				<div
					className={cn(
						"flex h-7 w-7 items-center justify-center rounded-[5px] font-semibold text-white text-[10px] uppercase",
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
			<div className="flex w-full items-center justify-between">
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => switchMailbox(mailbox.id)}
						className="relative shrink-0"
					>
						<div
							className={cn(
								"flex h-7 w-7 items-center justify-center rounded-[5px] font-semibold text-white text-[10px] uppercase",
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
							className="relative shrink-0"
						>
							<div
								className={cn(
									"flex h-7 w-7 items-center justify-center rounded-[5px] font-semibold text-[10px] text-white uppercase",
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
						className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-[5px] border border-dashed border-mail-muted bg-[var(--inbox-muted-bg)] text-mail-muted transition-colors hover:bg-[var(--inbox-hover)]"
						aria-label="Add mailbox"
					>
						<Plus className="size-4" />
					</button>
				</div>

				<Dropdown.Root>
					<Dropdown.Trigger asChild>
						<button
							type="button"
							className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--inbox-hover)]"
							aria-label="Account menu"
						>
							<ThreeDots className="text-mail-muted" />
						</button>
					</Dropdown.Trigger>
					<Dropdown.Content
						align="end"
						className="min-w-56 border-mail-border bg-[var(--inbox-menu)] p-1 text-mail-foreground shadow-lg"
					>
						<Dropdown.Item
							className="rounded-md text-[13px] text-mail-muted hover:bg-[var(--inbox-hover)] focus:bg-[var(--inbox-hover)]"
							onSelect={() => router.push("/settings")}
						>
							<Settings className="size-4 opacity-60" />
							Settings
						</Dropdown.Item>
						<Dropdown.Item
							className="rounded-md text-[13px] text-mail-muted hover:bg-[var(--inbox-hover)] focus:bg-[var(--inbox-hover)]"
							onSelect={() => void handleRefresh()}
						>
							<RefreshCcw className="size-4 opacity-60" />
							Force re-sync
						</Dropdown.Item>
						<Dropdown.Item
							className="rounded-md text-[13px] text-mail-muted hover:bg-[var(--inbox-hover)] focus:bg-[var(--inbox-hover)]"
							onSelect={() => void handleCopyId()}
						>
							<Copy className="size-4 opacity-60" />
							Copy mailbox ID
						</Dropdown.Item>
						<Dropdown.Item
							className="rounded-md text-[13px] text-mail-muted hover:bg-[var(--inbox-hover)] focus:bg-[var(--inbox-hover)]"
							onSelect={() =>
								setTheme(theme === "dark" ? "light" : "dark")
							}
						>
							{theme === "dark" ? (
								<Sun className="size-4 opacity-60" />
							) : (
								<Moon className="size-4 opacity-60" />
							)}
							{theme === "dark" ? "Light mode" : "Dark mode"}
						</Dropdown.Item>
						<Dropdown.Separator className="my-1 bg-mail-border" />
						<Dropdown.Item
							className="rounded-md text-[13px] text-mail-muted hover:bg-[var(--inbox-hover)] focus:bg-[var(--inbox-hover)]"
							onSelect={() => router.push("/agent-inbox")}
						>
							<Trash2 className="size-4 opacity-60" />
							All mailboxes
						</Dropdown.Item>
						<Dropdown.Item
							className="rounded-md text-[13px] text-mail-muted hover:bg-[var(--inbox-hover)] focus:bg-[var(--inbox-hover)]"
							onSelect={() => router.push("/login")}
						>
							<LogOut className="size-4 opacity-60" />
							Log out
						</Dropdown.Item>
					</Dropdown.Content>
				</Dropdown.Root>
			</div>

			<div className="mt-2 flex flex-col gap-1">
				<div className="flex items-center gap-1 text-[13px] leading-none text-mail-foreground">
					<p className="max-w-[14.5ch] truncate">{displayName}</p>
				</div>
				<p className="h-5 max-w-[200px] truncate text-mail-muted text-xs leading-none">
					{mailbox.email}
				</p>
			</div>
		</div>
	);
};
