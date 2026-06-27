"use client";

import { useAgentInbox } from "@fe/dashboard/app/(protected)/inbox/components/agent-inbox-provider";
import { ComposeModal } from "@fe/dashboard/app/(protected)/inbox/components/compose-modal";
import type { AgentMailbox } from "@fe/dashboard/app/(protected)/inbox/types";
import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import {
	getAvatarGradient,
	getAvatarInitial,
} from "@fe/dashboard/utils/avatar";
import * as Avatar from "@reloop/ui/avatar";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

export const AgentInboxLayoutWrapper = ({
	mailbox,
	folder,
	children,
}: {
	mailbox: AgentMailbox;
	folder: string;
	children: React.ReactNode;
}) => {
	const router = useRouter();
	const mailboxId = mailbox.id;
	const [isComposeOpen, setIsComposeOpen] = useState(false);

	const handleFolderChange = (targetFolder: string) => {
		if (targetFolder === "inbox") {
			router.push(`/inbox/${mailboxId}`);
		} else {
			router.push(`/inbox/${mailboxId}/${targetFolder}`);
		}
	};

	const { threads } = useAgentInbox();

	const mailboxThreads = useMemo(
		() => threads.filter((t) => t.mailboxId === mailboxId),
		[mailboxId, threads],
	);

	// Dynamic folder counts
	const inboxCount = useMemo(
		() =>
			mailboxThreads.filter(
				(t) => t.direction === "inbound" && t.status !== "blocked",
			).length,
		[mailboxThreads],
	);
	const sentCount = useMemo(
		() => mailboxThreads.filter((t) => t.direction === "outbound").length,
		[mailboxThreads],
	);
	const draftsCount = useMemo(
		() =>
			mailboxThreads.filter(
				(t) =>
					t.direction === "inbound" &&
					(t.status === "needs_approval" || t.status === "parsing"),
			).length,
		[mailboxThreads],
	);
	const spamCount = useMemo(
		() =>
			mailboxThreads.filter(
				(t) => t.direction === "inbound" && t.status === "blocked",
			).length,
		[mailboxThreads],
	);
	const agentCount = useMemo(
		() =>
			mailboxThreads.filter(
				(t) => t.direction === "inbound" && t.status === "handled",
			).length,
		[mailboxThreads],
	);
	const youCount = useMemo(
		() => mailboxThreads.filter((t) => t.direction === "outbound").length,
		[mailboxThreads],
	);
	const needsApprovalCount = useMemo(
		() =>
			mailboxThreads.filter(
				(t) => t.direction === "inbound" && t.status === "needs_approval",
			).length,
		[mailboxThreads],
	);

	// Hover & Active States
	const [hoveredEl, setHoveredEl] = useState<HTMLButtonElement | undefined>(
		undefined,
	);
	const [rect, setRect] = useState<DOMRect | undefined>(undefined);
	const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

	const activeEl = folder
		? (buttonRefs.current[folder] ?? undefined)
		: undefined;
	const currentEl = hoveredEl ?? activeEl;

	useLayoutEffect(() => {
		if (currentEl) {
			setRect(currentEl.getBoundingClientRect());
		} else {
			setRect(undefined);
		}
	}, [currentEl]);

	return (
		<div className="flex h-screen w-screen flex-col overflow-hidden bg-[#FAF8F4] font-sans text-text-strong-950 dark:bg-[#09090b] dark:text-neutral-50">
			{/* Topbar */}
			<header className="flex h-14 shrink-0 items-center justify-between border-stroke-inbox border-b bg-[#FAF8F4] px-4 dark:border-stroke-soft-100/40 dark:bg-neutral-900">
				<div className="flex items-center gap-3">
					<Logo className="h-11 w-11" />
					<span className="-ml-3 font-semibold">Agent Inbox</span>
					<div className="h-4 w-px bg-stroke-strong-200 dark:bg-neutral-800" />
				</div>

				<div className="flex items-center gap-2">
					<p className="ml-2 font-semibold text-base">{mailbox.email}</p>
					<Avatar.Root size="24" color="gray" className="shrink-0">
						<Avatar.Image asChild>
							<div
								className={cn(
									"flex h-full w-full items-center justify-center rounded-full font-semibold text-white text-xs uppercase tracking-wide shadow-sm",
									getAvatarGradient(mailbox.email),
								)}
							>
								{getAvatarInitial(mailbox.label, mailbox.email)}
							</div>
						</Avatar.Image>
					</Avatar.Root>
				</div>
			</header>

			{/* Main Grid: Sidebar + children content */}
			<div className="flex min-h-0 flex-1">
				{/* Left Folder Rail */}
				<aside className="relative flex w-60 shrink-0 flex-col justify-between border-stroke-inbox border-r bg-[#FAF8F4] p-4 dark:border-stroke-soft-100/40 dark:bg-neutral-900">
					<div className="flex flex-col gap-5">
						<Button.Root
							variant="neutral"
							mode="filled"
							size="medium"
							onClick={() => setIsComposeOpen(true)}
							className="w-full"
						>
							<Button.Icon as={Icon} name="edit" />
							Compose
						</Button.Root>

						{/* Folders List */}
						<div className="flex flex-col">
							<button
								type="button"
								ref={(el) => {
									buttonRefs.current["inbox"] = el;
								}}
								onPointerEnter={() =>
									setHoveredEl(buttonRefs.current["inbox"] ?? undefined)
								}
								onPointerLeave={() => setHoveredEl(undefined)}
								onClick={() => handleFolderChange("inbox")}
								className={cn(
									"group relative z-10 flex items-center justify-between rounded-lg px-3 py-2 font-medium text-xs transition-colors",
									folder === "inbox"
										? "text-[var(--color-primary-base)]"
										: "text-text-sub-600 hover:text-[var(--color-primary-base)] dark:text-neutral-400 dark:hover:text-[var(--color-primary-base)]",
								)}
							>
								<div className="flex items-center gap-2.5">
									<Icon
										name="inbox"
										className={cn(
											"h-3.5 w-3.5 transition-colors",
											folder === "inbox"
												? "text-[var(--color-primary-base)]"
												: "text-text-sub-600 opacity-70 group-hover:text-[var(--color-primary-base)] group-hover:opacity-100",
										)}
									/>
									<span>Inbox</span>
								</div>
								{inboxCount > 0 && (
									<span className="rounded-md bg-bg-weak-100/80 px-1.5 py-0.5 font-medium font-mono text-[10px] text-text-soft-400 dark:bg-neutral-800">
										{inboxCount}
									</span>
								)}
							</button>

							<button
								type="button"
								ref={(el) => {
									buttonRefs.current["sent"] = el;
								}}
								onPointerEnter={() =>
									setHoveredEl(buttonRefs.current["sent"] ?? undefined)
								}
								onPointerLeave={() => setHoveredEl(undefined)}
								onClick={() => handleFolderChange("sent")}
								className={cn(
									"group relative z-10 flex items-center justify-between rounded-lg px-3 py-2 font-medium text-xs transition-colors",
									folder === "sent"
										? "text-[var(--color-primary-base)]"
										: "text-text-sub-600 hover:text-[var(--color-primary-base)] dark:text-neutral-400 dark:hover:text-[var(--color-primary-base)]",
								)}
							>
								<div className="flex items-center gap-2.5">
									<Icon
										name="send-1"
										className={cn(
											"h-3.5 w-3.5 transition-colors",
											folder === "sent"
												? "text-[var(--color-primary-base)]"
												: "text-text-sub-600 opacity-70 group-hover:text-[var(--color-primary-base)] group-hover:opacity-100",
										)}
									/>
									<span>Sent</span>
								</div>
								{sentCount > 0 && (
									<span className="rounded-md bg-bg-weak-100/80 px-1.5 py-0.5 font-medium font-mono text-[10px] text-text-soft-400 dark:bg-neutral-800">
										{sentCount}
									</span>
								)}
							</button>

							<button
								type="button"
								ref={(el) => {
									buttonRefs.current["drafts"] = el;
								}}
								onPointerEnter={() =>
									setHoveredEl(buttonRefs.current["drafts"] ?? undefined)
								}
								onPointerLeave={() => setHoveredEl(undefined)}
								onClick={() => handleFolderChange("drafts")}
								className={cn(
									"group relative z-10 flex items-center justify-between rounded-lg px-3 py-2 font-medium text-xs transition-colors",
									folder === "drafts"
										? "text-[var(--color-primary-base)]"
										: "text-text-sub-600 hover:text-[var(--color-primary-base)] dark:text-neutral-400 dark:hover:text-[var(--color-primary-base)]",
								)}
							>
								<div className="flex items-center gap-2.5">
									<Icon
										name="file"
										className={cn(
											"h-3.5 w-3.5 transition-colors",
											folder === "drafts"
												? "text-[var(--color-primary-base)]"
												: "text-text-sub-600 opacity-70 group-hover:text-[var(--color-primary-base)] group-hover:opacity-100",
										)}
									/>
									<span>Drafts</span>
								</div>
								{draftsCount > 0 && (
									<span className="rounded-md bg-bg-weak-100/80 px-1.5 py-0.5 font-medium font-mono text-[10px] text-text-soft-400 dark:bg-neutral-800">
										{draftsCount}
									</span>
								)}
							</button>

							<button
								type="button"
								ref={(el) => {
									buttonRefs.current["spam"] = el;
								}}
								onPointerEnter={() =>
									setHoveredEl(buttonRefs.current["spam"] ?? undefined)
								}
								onPointerLeave={() => setHoveredEl(undefined)}
								onClick={() => handleFolderChange("spam")}
								className={cn(
									"group relative z-10 flex items-center justify-between rounded-lg px-3 py-2 font-medium text-xs transition-colors",
									folder === "spam"
										? "text-[var(--color-primary-base)]"
										: "text-text-sub-600 hover:text-[var(--color-primary-base)] dark:text-neutral-400 dark:hover:text-[var(--color-primary-base)]",
								)}
							>
								<div className="flex items-center gap-2.5">
									<Icon
										name="alert-triangle"
										className={cn(
											"h-3.5 w-3.5 transition-colors",
											folder === "spam"
												? "text-[var(--color-primary-base)]"
												: "text-text-sub-600 opacity-70 group-hover:text-[var(--color-primary-base)] group-hover:opacity-100",
										)}
									/>
									<span>Spam</span>
								</div>
								{spamCount > 0 && (
									<span className="rounded-md bg-bg-weak-100/80 px-1.5 py-0.5 font-medium font-mono text-[10px] text-text-soft-400 dark:bg-neutral-800">
										{spamCount}
									</span>
								)}
							</button>

							<button
								type="button"
								ref={(el) => {
									buttonRefs.current["trash"] = el;
								}}
								onPointerEnter={() =>
									setHoveredEl(buttonRefs.current["trash"] ?? undefined)
								}
								onPointerLeave={() => setHoveredEl(undefined)}
								onClick={() => handleFolderChange("trash")}
								className={cn(
									"group relative z-10 flex items-center justify-between rounded-lg px-3 py-2 font-medium text-xs transition-colors",
									folder === "trash"
										? "text-[var(--color-primary-base)]"
										: "text-text-sub-600 hover:text-[var(--color-primary-base)] dark:text-neutral-400 dark:hover:text-[var(--color-primary-base)]",
								)}
							>
								<div className="flex items-center gap-2.5">
									<Icon
										name="trash"
										className={cn(
											"h-3.5 w-3.5 transition-colors",
											folder === "trash"
												? "text-[var(--color-primary-base)]"
												: "text-text-sub-600 opacity-70 group-hover:text-[var(--color-primary-base)] group-hover:opacity-100",
										)}
									/>
									<span>Trash</span>
								</div>
							</button>
						</div>

						{/* Filter by Actor Section */}
						<div className="flex flex-col gap-1.5">
							<div className="px-3 font-bold font-mono text-[10px] text-text-soft-400 uppercase tracking-wider">
								Filter by actor
							</div>
							<div className="flex flex-col">
								<button
									type="button"
									ref={(el) => {
										buttonRefs.current["agent"] = el;
									}}
									onPointerEnter={() =>
										setHoveredEl(buttonRefs.current["agent"] ?? undefined)
									}
									onPointerLeave={() => setHoveredEl(undefined)}
									onClick={() => handleFolderChange("agent")}
									className={cn(
										"group relative z-10 flex items-center justify-between rounded-lg px-3 py-1.5 font-medium text-xs transition-colors",
										folder === "agent"
											? "text-[var(--color-primary-base)]"
											: "text-text-sub-600 hover:text-[var(--color-primary-base)] dark:text-neutral-400 dark:hover:text-[var(--color-primary-base)]",
									)}
								>
									<div className="flex items-center gap-2.5">
										<Icon
											name="robot"
											className={cn(
												"h-3.5 w-3.5 transition-colors",
												folder === "agent"
													? "text-[var(--color-primary-base)]"
													: "text-text-sub-600 opacity-70 group-hover:text-[var(--color-primary-base)] group-hover:opacity-100",
											)}
										/>
										<span>Handled by agent</span>
									</div>
									{agentCount > 0 && (
										<span className="rounded-md bg-bg-weak-100/80 px-1.5 py-0.5 font-medium font-mono text-[10px] text-text-soft-400 dark:bg-neutral-800">
											{agentCount}
										</span>
									)}
								</button>

								<button
									type="button"
									ref={(el) => {
										buttonRefs.current["you"] = el;
									}}
									onPointerEnter={() =>
										setHoveredEl(buttonRefs.current["you"] ?? undefined)
									}
									onPointerLeave={() => setHoveredEl(undefined)}
									onClick={() => handleFolderChange("you")}
									className={cn(
										"group relative z-10 flex items-center justify-between rounded-lg px-3 py-1.5 font-medium text-xs transition-colors",
										folder === "you"
											? "text-[var(--color-primary-base)]"
											: "text-text-sub-600 hover:text-[var(--color-primary-base)] dark:text-neutral-400 dark:hover:text-[var(--color-primary-base)]",
									)}
								>
									<div className="flex items-center gap-2.5">
										<Icon
											name="user"
											className={cn(
												"h-3.5 w-3.5 transition-colors",
												folder === "you"
													? "text-[var(--color-primary-base)]"
													: "text-text-sub-600 opacity-70 group-hover:text-[var(--color-primary-base)] group-hover:opacity-100",
											)}
										/>
										<span>Sent by you</span>
									</div>
									{youCount > 0 && (
										<span className="rounded-md bg-bg-weak-100/80 px-1.5 py-0.5 font-medium font-mono text-[10px] text-text-soft-400 dark:bg-neutral-800">
											{youCount}
										</span>
									)}
								</button>

								<button
									type="button"
									ref={(el) => {
										buttonRefs.current["needs_approval"] = el;
									}}
									onPointerEnter={() =>
										setHoveredEl(
											buttonRefs.current["needs_approval"] ?? undefined,
										)
									}
									onPointerLeave={() => setHoveredEl(undefined)}
									onClick={() => handleFolderChange("needs_approval")}
									className={cn(
										"group relative z-10 flex items-center justify-between rounded-lg px-3 py-1.5 font-medium text-xs transition-colors",
										folder === "needs_approval"
											? "text-[var(--color-primary-base)]"
											: "text-text-sub-600 hover:text-[var(--color-primary-base)] dark:text-neutral-400 dark:hover:text-[var(--color-primary-base)]",
									)}
								>
									<div className="flex items-center gap-2.5">
										<Icon
											name="alert-triangle"
											className={cn(
												"h-3.5 w-3.5 transition-colors",
												folder === "needs_approval"
													? "text-[var(--color-primary-base)]"
													: "text-amber-500 opacity-90 group-hover:text-[var(--color-primary-base)] group-hover:opacity-100",
											)}
										/>
										<span>Needs your okay</span>
									</div>
									{needsApprovalCount > 0 && (
										<span className="rounded-md bg-amber-50 px-1.5 py-0.5 font-bold font-mono text-[10px] text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
											{needsApprovalCount}
										</span>
									)}
								</button>
							</div>
						</div>
					</div>

					{/* Bottom back to dashboard — static highlight, always visible */}
					<button
						type="button"
						onClick={() => router.push("/agent-inbox")}
						className="flex w-full items-center gap-2 rounded-lg bg-[var(--color-primary-base)]/10 px-3 py-2 font-semibold text-[var(--color-primary-base)] text-xs transition-colors hover:bg-[var(--color-primary-base)]/15 dark:bg-[var(--color-primary-base)]/15"
					>
						<Icon name="arrow-left" className="h-3.5 w-3.5" />
						<span>Back to dashboard</span>
					</button>

					{/* Shared animated hover/active background */}
					<AnimatedHoverBackground
						rect={rect}
						tabElement={currentEl}
						className="!bg-[var(--color-primary-base)]/10"
					/>
				</aside>

				{/* Render page specific child layouts */}
				{children}
			</div>

			<ComposeModal
				isOpen={isComposeOpen}
				onClose={() => setIsComposeOpen(false)}
				mailbox={mailbox}
			/>
		</div>
	);
};
