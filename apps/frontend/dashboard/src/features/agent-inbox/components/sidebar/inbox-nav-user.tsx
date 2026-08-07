"use client";

import { cn } from "@reloop/ui/cn";
import { Skeleton } from "@reloop/ui/skeleton";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAgentInbox } from "#/features/agent-inbox/components/agent-inbox-provider";
import type { AgentMailbox } from "#/features/agent-inbox/types";
import { useSessionQuery } from "#/features/auth/session-query";
import { getAvatarGradient, getAvatarInitial } from "#/utils/avatar";

export const InboxNavUser = ({
	mailbox,
	collapsed,
	loading = false,
	onAddMailbox,
	/** When true, lays out for the top navbar (Google-style account panel). */
	compact = false,
}: {
	mailbox: AgentMailbox;
	collapsed: boolean;
	/** True while mailbox metadata is still resolving. */
	loading?: boolean;
	onAddMailbox?: () => void;
	compact?: boolean;
}) => {
	const router = useRouter();
	const { data: session } = useSessionQuery();
	const { mailboxes } = useAgentInbox();
	const [switcherOpen, setSwitcherOpen] = useState(false);
	const switcherRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!switcherOpen) return;
		const onPointerDown = (e: PointerEvent) => {
			if (
				switcherRef.current &&
				!switcherRef.current.contains(e.target as Node)
			) {
				setSwitcherOpen(false);
			}
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setSwitcherOpen(false);
		};
		document.addEventListener("pointerdown", onPointerDown);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("keydown", onKey);
		};
	}, [switcherOpen]);

	const displayName =
		mailbox.label || session?.user?.name || mailbox.email?.split("@")[0] || "";
	const initial = getAvatarInitial(mailbox.label, mailbox.email);
	const firstName = displayName.trim().split(/\s+/)[0] || displayName;
	const otherMailboxes = mailboxes.filter((m) => m.id !== mailbox.id);

	if (collapsed) {
		return (
			<button
				type="button"
				onClick={() => setSwitcherOpen((v) => !v)}
				title={displayName}
				className={cn(
					"relative mx-auto flex size-8 items-center justify-center rounded-full font-medium text-[11px] text-white",
					getAvatarGradient(mailbox.email || displayName),
				)}
			>
				{initial}
			</button>
		);
	}

	if (loading) {
		return (
			<div
				className={cn(
					"flex items-center gap-2.5 rounded-lg px-2 py-1.5",
					compact && "max-w-[200px]",
				)}
				aria-busy="true"
			>
				<span className="sr-only">Loading mailbox</span>
				<Skeleton className="size-8 shrink-0 rounded-full bg-[var(--inbox-skeleton)]" />
				{!compact && (
					<div className="flex min-w-0 flex-1 flex-col gap-1">
						<Skeleton className="h-3.5 w-28 bg-[var(--inbox-skeleton)]" />
					</div>
				)}
			</div>
		);
	}

	const trigger = (
		<button
			type="button"
			onClick={() => setSwitcherOpen((v) => !v)}
			aria-expanded={switcherOpen}
			aria-haspopup="dialog"
			aria-label={displayName || mailbox.email || "Account"}
			title={displayName || mailbox.email}
			className={cn(
				"flex items-center justify-center rounded-full transition-colors",
				compact
					? "size-9 hover:bg-[var(--inbox-row-hover)]"
					: "w-full gap-2.5 rounded-lg px-2 py-1.5 hover:bg-[var(--inbox-row-hover)]",
			)}
		>
			<span
				className={cn(
					"grid shrink-0 place-items-center rounded-full font-medium text-white",
					compact ? "size-8 text-[12px]" : "size-5 text-[11px]",
					getAvatarGradient(mailbox.email || displayName),
				)}
			>
				{initial}
			</span>
			{!compact && (
				<span className="min-w-0 flex-1 truncate font-medium text-[14px] text-mail-foreground leading-5">
					{displayName}
				</span>
			)}
		</button>
	);

	return (
		<div ref={switcherRef} className="relative">
			{trigger}

			{switcherOpen && (
				<div
					role="dialog"
					aria-label="Account menu"
					className={cn(
						"absolute top-full z-[100] mt-2 overflow-hidden rounded-2xl",
						"bg-bg-white-0 p-2 shadow-regular-md ring-1 ring-stroke-soft-100 ring-inset",
						"dark:bg-panel-dark dark:ring-stroke-soft-100/50",
						compact
							? "right-0 left-auto w-[min(320px,calc(100vw-1rem))]"
							: "right-0 left-0 w-full min-w-[280px]",
					)}
				>
					{/* Top: email + close */}
					<div className="relative flex items-center justify-center px-9 pt-2 pb-1">
						<button
							type="button"
							onClick={() => {
								void navigator.clipboard.writeText(mailbox.email);
								toast.success("Email copied");
							}}
							className="max-w-full truncate text-center font-medium text-[12px] text-mail-muted hover:text-mail-foreground hover:underline"
							title="Copy email"
						>
							{mailbox.email}
						</button>
						<button
							type="button"
							onClick={() => setSwitcherOpen(false)}
							aria-label="Close"
							className="absolute top-1 right-1 flex size-7 items-center justify-center rounded-lg text-mail-muted transition-colors hover:bg-[var(--inbox-control-hover)] hover:text-mail-foreground"
						>
							<X className="size-3.5" strokeWidth={2} />
						</button>
					</div>

					{/* Large avatar + greeting */}
					<div className="flex flex-col items-center px-4 pt-2 pb-3">
						<div
							className={cn(
								"mb-2.5 grid size-16 place-items-center rounded-full font-semibold text-[22px] text-white",
								"ring-2 ring-zero-blue/25 ring-offset-2 ring-offset-bg-white-0 dark:ring-offset-panel-dark",
								getAvatarGradient(mailbox.email || displayName),
							)}
						>
							{initial}
						</div>
						<p className="text-center font-semibold text-[18px] text-mail-foreground tracking-tight">
							Hi, {firstName}!
						</p>
					</div>

					{/* Other mailboxes */}
					{otherMailboxes.length > 0 && (
						<div className="mb-1 max-h-36 overflow-y-auto rounded-xl bg-[var(--inbox-muted-bg)] py-1">
							{otherMailboxes.map((m) => {
								const name = m.label || m.email.split("@")[0] || m.email;
								return (
									<button
										key={m.id}
										type="button"
										onClick={() => {
											setSwitcherOpen(false);
											router.push(`/inbox/${m.id}`);
										}}
										className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-[var(--inbox-control-hover)]"
									>
										<span
											className={cn(
												"grid size-8 shrink-0 place-items-center rounded-full font-medium text-[12px] text-white",
												getAvatarGradient(m.email || name),
											)}
										>
											{getAvatarInitial(m.label, m.email)}
										</span>
										<span className="min-w-0 flex-1">
											<span className="block truncate font-medium text-[13px] text-mail-foreground">
												{name}
											</span>
											<span className="block truncate text-[11px] text-mail-muted">
												{m.email}
											</span>
										</span>
									</button>
								);
							})}
						</div>
					)}

					{/* Add account */}
					{onAddMailbox && (
						<button
							type="button"
							onClick={() => {
								setSwitcherOpen(false);
								onAddMailbox();
							}}
							className="mt-4 mb-2 flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[var(--inbox-control)] font-medium text-[13px] text-mail-foreground transition-colors hover:bg-[var(--inbox-control-hover)]"
						>
							<span className="grid size-6 place-items-center rounded-full bg-zero-blue/10 text-zero-blue">
								<Plus className="size-3.5" strokeWidth={2.5} />
							</span>
							Add account
						</button>
					)}
				</div>
			)}
		</div>
	);
};
