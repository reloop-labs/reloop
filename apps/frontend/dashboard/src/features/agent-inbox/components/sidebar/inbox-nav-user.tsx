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
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { getAvatarGradient, getAvatarInitial } from "#/utils/avatar";

export const InboxNavUser = ({
	mailbox,
	collapsed,
	loading = false,
	onAddMailbox,
	/** When true, lays out for the top navbar account switcher. */
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
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

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

	useEffect(() => {
		if (!switcherOpen) {
			setHoverIdx(undefined);
			itemRefs.current = [];
		}
	}, [switcherOpen]);

	const displayName =
		mailbox.label || session?.user?.name || mailbox.email?.split("@")[0] || "";
	const initial = getAvatarInitial(mailbox.label, mailbox.email);
	const firstName = displayName.trim().split(/\s+/)[0] || displayName;
	/** Other accounts only — current is shown in the top fold. */
	const otherMailboxes = mailboxes.filter((m) => m.id !== mailbox.id);

	const addIdx = otherMailboxes.length;
	const currentTab = itemRefs.current[hoverIdx ?? -1] || undefined;
	const currentRect = currentTab?.getBoundingClientRect();

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
			</div>
		);
	}

	return (
		<div ref={switcherRef} className="relative">
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
						compact
							? "size-8 text-[12px] ring-1 ring-mail-border ring-offset-2 ring-offset-sidebar"
							: "size-5 text-[11px]",
						getAvatarGradient(mailbox.email || displayName),
						compact && switcherOpen && "ring-zero-blue/40",
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

			{switcherOpen && (
				<div
					role="dialog"
					aria-label="Switch account"
					className={cn(
						"absolute top-full z-[100] mt-2 overflow-hidden rounded-2xl pb-1",
						"bg-bg-white-0 shadow-regular-md ring-1 ring-stroke-soft-100",
						"dark:bg-[#1a1a1a] dark:ring-white/10",
						compact
							? "right-0 left-auto w-[min(320px,calc(100vw-1rem))]"
							: "right-0 left-0 w-full min-w-[280px]",
					)}
				>
					{/* Top fold: email, large avatar, greeting */}
					<div className="relative flex flex-col items-center gap-2.5 px-4 pt-3 pb-4">
						<button
							type="button"
							onClick={() => {
								void navigator.clipboard.writeText(mailbox.email);
								toast.success("Email copied");
							}}
							className="max-w-full truncate px-8 text-center font-medium text-[12px] text-mail-muted transition-colors hover:text-mail-foreground hover:underline"
							title="Copy email"
						>
							{mailbox.email}
						</button>
						<button
							type="button"
							onClick={() => setSwitcherOpen(false)}
							aria-label="Close"
							className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-lg text-mail-muted transition-colors hover:bg-[var(--inbox-control)] hover:text-mail-foreground"
						>
							<X className="size-3.5" strokeWidth={2} />
						</button>

						<div className="relative mt-1">
							<span
								className="absolute inset-[-3px] rounded-full"
								style={{
									background:
										"conic-gradient(from 210deg, #4285f4, #34a853, #fbbc04, #ea4335, #4285f4)",
								}}
								aria-hidden
							/>
							<span
								className={cn(
									"relative grid size-16 place-items-center rounded-full font-semibold text-[22px] text-white",
									"ring-2 ring-bg-white-0 dark:ring-[#1a1a1a]",
									getAvatarGradient(mailbox.email || displayName),
								)}
							>
								{initial}
							</span>
						</div>
						<p className="text-center font-semibold text-[18px] text-mail-foreground tracking-tight">
							Hi, {firstName}!
						</p>
					</div>

					{/* List with sliding hover (org-switcher style) */}
					{(otherMailboxes.length > 0 || onAddMailbox) && (
						<>
							<div className="mx-3 h-px bg-stroke-soft-100 dark:bg-white/10" />
							<div
								className="relative flex max-h-48 flex-col p-1.5"
								onPointerLeave={() => setHoverIdx(undefined)}
							>
								{otherMailboxes.map((m, idx) => {
									const name = m.label || m.email.split("@")[0] || m.email;
									return (
										<button
											key={m.id}
											type="button"
											ref={(el) => {
												itemRefs.current[idx] = el;
											}}
											onPointerEnter={() => setHoverIdx(idx)}
											onClick={() => {
												setSwitcherOpen(false);
												router.push(`/inbox/${m.id}`);
											}}
											className={cn(
												"relative z-10 flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2.5 text-left",
												"transition-colors duration-150",
												!currentRect &&
													hoverIdx === idx &&
													"bg-neutral-alpha-10",
												"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zero-blue/30",
											)}
										>
											<span className="relative shrink-0">
												<span
													className="absolute inset-[-2px] rounded-full"
													style={{
														background:
															"conic-gradient(from 210deg, #4285f4, #34a853, #fbbc04, #ea4335, #4285f4)",
													}}
													aria-hidden
												/>
												<span
													className={cn(
														"relative grid size-9 place-items-center rounded-full font-semibold text-[13px] text-white",
														"ring-2 ring-bg-white-0 dark:ring-[#1a1a1a]",
														getAvatarGradient(m.email || name),
													)}
												>
													{getAvatarInitial(m.label, m.email)}
												</span>
											</span>
											<span className="min-w-0 flex-1">
												<span className="block truncate font-semibold text-[13px] text-mail-foreground uppercase tracking-wide">
													{name}
												</span>
												<span className="mt-0.5 block truncate text-[12px] text-mail-muted">
													{m.email}
												</span>
											</span>
										</button>
									);
								})}

								{onAddMailbox && (
									<>
										{otherMailboxes.length > 0 && (
											<div className="mx-2 my-1 h-px bg-stroke-soft-100 dark:bg-white/10" />
										)}
										<button
											type="button"
											ref={(el) => {
												itemRefs.current[addIdx] = el;
											}}
											onPointerEnter={() => setHoverIdx(addIdx)}
											onClick={() => {
												setSwitcherOpen(false);
												onAddMailbox();
											}}
											className={cn(
												"relative z-10 flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2.5 text-left",
												"transition-colors duration-150",
												!currentRect &&
													hoverIdx === addIdx &&
													"bg-neutral-alpha-10",
												"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zero-blue/30",
											)}
										>
											<span className="grid size-9 shrink-0 place-items-center rounded-full bg-zero-blue/15 text-zero-blue">
												<Plus className="size-4" strokeWidth={2.25} />
											</span>
											<span className="font-medium text-[13px] text-mail-foreground">
												Add another account
											</span>
										</button>
									</>
								)}

								<AnimatedHoverBackground
									rect={currentRect}
									tabElement={currentTab}
									className="rounded-2xl"
								/>
							</div>
						</>
					)}
				</div>
			)}
		</div>
	);
};
