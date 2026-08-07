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
						"absolute top-full z-[100] mt-2 overflow-hidden rounded-[28px] border border-mail-border/60 bg-[#f0f4f9] shadow-[0_4px_24px_rgba(0,0,0,0.12)] dark:border-white/10 dark:bg-[#1e1f20] dark:shadow-[0_4px_24px_rgba(0,0,0,0.45)]",
						compact
							? "right-0 left-auto w-[min(360px,calc(100vw-1rem))]"
							: "right-0 left-0 w-full min-w-[280px]",
					)}
				>
					{/* Top: email + close */}
					<div className="relative flex items-center justify-center px-10 pt-4 pb-1">
						<button
							type="button"
							onClick={() => {
								void navigator.clipboard.writeText(mailbox.email);
								toast.success("Email copied");
							}}
							className="max-w-full truncate text-center text-[13px] text-mail-foreground hover:underline"
							title="Copy email"
						>
							{mailbox.email}
						</button>
						<button
							type="button"
							onClick={() => setSwitcherOpen(false)}
							aria-label="Close"
							className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full text-mail-muted transition-colors hover:bg-black/5 hover:text-mail-foreground dark:hover:bg-white/10"
						>
							<X className="size-4" strokeWidth={2} />
						</button>
					</div>

					{/* Large avatar + greeting */}
					<div className="flex flex-col items-center px-6 pt-3 pb-4">
						<div className="relative mb-3">
							<div
								className="rounded-full p-[3px]"
								style={{
									background:
										"conic-gradient(from 180deg, #4285f4, #9b72cb, #d96570, #f2a60c, #34a853, #4285f4)",
								}}
							>
								<div
									className={cn(
										"grid size-[72px] place-items-center rounded-full font-semibold text-[28px] text-white ring-2 ring-white dark:ring-[#1e1f20]",
										getAvatarGradient(mailbox.email || displayName),
									)}
								>
									{initial}
								</div>
							</div>
						</div>
						<p className="text-center font-normal text-[22px] text-mail-foreground tracking-tight">
							Hi, {firstName}!
						</p>
					</div>

					{/* Other mailboxes */}
					{otherMailboxes.length > 0 && (
						<div className="mx-3 mb-2 max-h-36 overflow-y-auto rounded-2xl bg-white py-1 dark:bg-white/[0.06]">
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
										className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
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
											<span className="block truncate font-medium text-[14px] text-mail-foreground">
												{name}
											</span>
											<span className="block truncate text-[12px] text-mail-muted">
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
						<div className="mx-3 mb-3">
							<button
								type="button"
								onClick={() => {
									setSwitcherOpen(false);
									onAddMailbox();
								}}
								className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white font-medium text-[14px] text-mail-foreground shadow-sm transition-colors hover:bg-black/[0.03] dark:bg-white/[0.08] dark:hover:bg-white/[0.12]"
							>
								<span className="grid size-6 place-items-center rounded-full bg-[#e8f0fe] text-[#0b57d0] dark:bg-[#8ab4f8]/20 dark:text-[#8ab4f8]">
									<Plus className="size-3.5" strokeWidth={2.5} />
								</span>
								Add account
							</button>
						</div>
					)}

					{/* Footer */}
					<div className="flex items-center justify-center gap-1.5 pb-3 text-[11px] text-mail-muted">
						<a
							href="https://reloop.sh/privacy"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:underline"
						>
							Privacy Policy
						</a>
						<span aria-hidden>·</span>
						<a
							href="https://reloop.sh/terms-and-conditions"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:underline"
						>
							Terms of Service
						</a>
					</div>
				</div>
			)}
		</div>
	);
};
