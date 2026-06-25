"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import {
	getAvatarGradient,
	getAvatarInitial,
} from "@fe/dashboard/utils/avatar";
import * as Avatar from "@reloop/ui/avatar";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { Logo } from "@reloop/ui/logo";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { AgentMailbox } from "../types";
import { useAgentInbox } from "./agent-inbox-provider";
import { ComposeModal } from "./compose-modal";
import { ThreadDetail } from "./thread-detail";
import { ThreadList } from "./thread-list";

export const AgentInboxLayout = ({ mailbox }: { mailbox: AgentMailbox }) => {
	const router = useRouter();
	const mailboxId = mailbox.id;
	const [isComposeOpen, setIsComposeOpen] = useState(false);

	const [folder, setFolder] = useQueryState(
		"folder",
		parseAsString.withDefault("inbox"),
	);
	const [searchQuery, setSearchQuery] = useQueryState(
		"q",
		parseAsString.withDefault(""),
	);
	const [selectedThreadId, setSelectedThreadId] = useQueryState(
		"thread",
		parseAsString.withDefault(""),
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

	const { threads, markMessageRead, markMessageSpam, deleteMessage } =
		useAgentInbox();

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

	const filteredThreads = useMemo(() => {
		let result = mailboxThreads;

		// Apply folder / rail filters
		if (folder === "inbox") {
			result = result.filter(
				(t) => t.direction === "inbound" && t.status !== "blocked",
			);
		} else if (folder === "sent") {
			result = result.filter((t) => t.direction === "outbound");
		} else if (folder === "drafts") {
			result = result.filter(
				(t) =>
					t.direction === "inbound" &&
					(t.status === "needs_approval" || t.status === "parsing"),
			);
		} else if (folder === "spam") {
			result = result.filter(
				(t) => t.direction === "inbound" && t.status === "blocked",
			);
		} else if (folder === "trash") {
			result = [];
		} else if (folder === "agent") {
			result = result.filter(
				(t) => t.direction === "inbound" && t.status === "handled",
			);
		} else if (folder === "you") {
			result = result.filter((t) => t.direction === "outbound");
		} else if (folder === "needs_approval") {
			result = result.filter(
				(t) => t.direction === "inbound" && t.status === "needs_approval",
			);
		}

		// Apply search
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			result = result.filter(
				(t) =>
					t.subject.toLowerCase().includes(q) ||
					t.preview.toLowerCase().includes(q) ||
					t.from.email.toLowerCase().includes(q) ||
					t.from.name?.toLowerCase().includes(q),
			);
		}
		return result;
	}, [mailboxThreads, folder, searchQuery]);

	const selectedThread = useMemo(
		() =>
			filteredThreads.find((t) => t.id === selectedThreadId) ??
			mailboxThreads.find((t) => t.id === selectedThreadId) ??
			null,
		[filteredThreads, mailboxThreads, selectedThreadId],
	);

	const threadsForNavigation = useMemo(() => {
		return filteredThreads.length > 0 ? filteredThreads : mailboxThreads;
	}, [filteredThreads, mailboxThreads]);

	const { currentIndex, hasNavigation } = useMemo(() => {
		if (!selectedThread) return { currentIndex: -1, hasNavigation: false };
		const idx = threadsForNavigation.findIndex(
			(t) => t.id === selectedThread.id,
		);
		return { currentIndex: idx, hasNavigation: idx !== -1 };
	}, [selectedThread, threadsForNavigation]);

	const handleNavigateAfterAction = (currentId: string) => {
		const idx = threadsForNavigation.findIndex((t) => t.id === currentId);
		if (idx !== -1 && threadsForNavigation.length > 1) {
			if (idx < threadsForNavigation.length - 1) {
				setSelectedThreadId(threadsForNavigation[idx + 1]?.id ?? "");
			} else {
				setSelectedThreadId(threadsForNavigation[idx - 1]?.id ?? "");
			}
		} else {
			setSelectedThreadId("");
		}
	};

	const handleToggleRead = async (id: string, currentUnread: boolean) => {
		try {
			await markMessageRead(id, currentUnread);
			toast.success(
				currentUnread
					? "Message marked as handled"
					: "Message marked as active",
			);
		} catch (err: any) {
			toast.error(err.message || "Failed to update status");
		}
	};

	const handleMarkSpam = async (id: string) => {
		try {
			await markMessageSpam(id, true);
			toast.success("Message marked as spam");
			handleNavigateAfterAction(id);
		} catch (err: any) {
			toast.error(err.message || "Failed to update status");
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this message?")) return;
		try {
			await deleteMessage(id);
			toast.success("Message deleted");
			handleNavigateAfterAction(id);
		} catch (err: any) {
			toast.error(err.message || "Failed to delete message");
		}
	};

	const handleSelectThread = (id: string) => {
		setSelectedThreadId(id || null);
	};

	const emptyMessage =
		mailboxThreads.length === 0
			? "No inbound messages yet. Set up a webhook to receive email."
			: folder === "spam"
				? "No spam messages"
				: "No messages in this folder";

	return (
		<div className="flex h-screen w-screen flex-col overflow-hidden bg-bg-weak-50 font-sans text-text-strong-950 dark:bg-[#09090b] dark:text-neutral-50">
			{/* Mockup Premium Topbar */}
			<header className="flex h-14 shrink-0 items-center justify-between border-stroke-soft-100 border-b bg-bg-white-0 px-4 dark:border-stroke-soft-100/40 dark:bg-neutral-900">
				<div className="flex items-center gap-3">
					{/* Logo brand mark */}
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

			{/* Column Wrapper */}
			<div className="flex min-h-0 flex-1">
				{/* Left Folder Rail */}
				<aside className="relative flex w-60 shrink-0 flex-col justify-between border-stroke-soft-100 border-r bg-bg-white-0 p-4 dark:border-stroke-soft-100/40 dark:bg-neutral-900">
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
								onClick={() => setFolder("inbox")}
								className={cn(
									"group relative z-10 flex items-center justify-between rounded-lg px-3 py-2 font-medium text-xs transition-colors",
									folder === "inbox"
										? "text-primary-base"
										: "text-text-sub-600 hover:text-primary-base dark:text-neutral-400 dark:hover:text-primary-base",
								)}
							>
								<div className="flex items-center gap-2.5">
									<Icon
										name="inbox"
										className={cn(
											"h-3.5 w-3.5 transition-colors",
											folder === "inbox"
												? "text-primary-base"
												: "text-text-sub-600 opacity-70 group-hover:text-primary-base group-hover:opacity-100",
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
								onClick={() => setFolder("sent")}
								className={cn(
									"group relative z-10 flex items-center justify-between rounded-lg px-3 py-2 font-medium text-xs transition-colors",
									folder === "sent"
										? "text-primary-base"
										: "text-text-sub-600 hover:text-primary-base dark:text-neutral-400 dark:hover:text-primary-base",
								)}
							>
								<div className="flex items-center gap-2.5">
									<Icon
										name="send-1"
										className={cn(
											"h-3.5 w-3.5 transition-colors",
											folder === "sent"
												? "text-primary-base"
												: "text-text-sub-600 opacity-70 group-hover:text-primary-base group-hover:opacity-100",
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
								onClick={() => setFolder("drafts")}
								className={cn(
									"group relative z-10 flex items-center justify-between rounded-lg px-3 py-2 font-medium text-xs transition-colors",
									folder === "drafts"
										? "text-primary-base"
										: "text-text-sub-600 hover:text-primary-base dark:text-neutral-400 dark:hover:text-primary-base",
								)}
							>
								<div className="flex items-center gap-2.5">
									<Icon
										name="file"
										className={cn(
											"h-3.5 w-3.5 transition-colors",
											folder === "drafts"
												? "text-primary-base"
												: "text-text-sub-600 opacity-70 group-hover:text-primary-base group-hover:opacity-100",
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
								onClick={() => setFolder("spam")}
								className={cn(
									"group relative z-10 flex items-center justify-between rounded-lg px-3 py-2 font-medium text-xs transition-colors",
									folder === "spam"
										? "text-primary-base"
										: "text-text-sub-600 hover:text-primary-base dark:text-neutral-400 dark:hover:text-primary-base",
								)}
							>
								<div className="flex items-center gap-2.5">
									<Icon
										name="alert-triangle"
										className={cn(
											"h-3.5 w-3.5 transition-colors",
											folder === "spam"
												? "text-primary-base"
												: "text-text-sub-600 opacity-70 group-hover:text-primary-base group-hover:opacity-100",
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
								onClick={() => setFolder("trash")}
								className={cn(
									"group relative z-10 flex items-center justify-between rounded-lg px-3 py-2 font-medium text-xs transition-colors",
									folder === "trash"
										? "text-primary-base"
										: "text-text-sub-600 hover:text-primary-base dark:text-neutral-400 dark:hover:text-primary-base",
								)}
							>
								<div className="flex items-center gap-2.5">
									<Icon
										name="trash"
										className={cn(
											"h-3.5 w-3.5 transition-colors",
											folder === "trash"
												? "text-primary-base"
												: "text-text-sub-600 opacity-70 group-hover:text-primary-base group-hover:opacity-100",
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
									onClick={() => setFolder("agent")}
									className={cn(
										"group relative z-10 flex items-center justify-between rounded-lg px-3 py-1.5 font-medium text-xs transition-colors",
										folder === "agent"
											? "text-primary-base"
											: "text-text-sub-600 hover:text-primary-base dark:text-neutral-400 dark:hover:text-primary-base",
									)}
								>
									<div className="flex items-center gap-2.5">
										<Icon
											name="monitor"
											className={cn(
												"h-3.5 w-3.5 transition-colors",
												folder === "agent"
													? "text-primary-base"
													: "text-text-sub-600 opacity-70 group-hover:text-primary-base group-hover:opacity-100",
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
									onClick={() => setFolder("you")}
									className={cn(
										"group relative z-10 flex items-center justify-between rounded-lg px-3 py-1.5 font-medium text-xs transition-colors",
										folder === "you"
											? "text-primary-base"
											: "text-text-sub-600 hover:text-primary-base dark:text-neutral-400 dark:hover:text-primary-base",
									)}
								>
									<div className="flex items-center gap-2.5">
										<Icon
											name="user"
											className={cn(
												"h-3.5 w-3.5 transition-colors",
												folder === "you"
													? "text-primary-base"
													: "text-text-sub-600 opacity-70 group-hover:text-primary-base group-hover:opacity-100",
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
									onClick={() => setFolder("needs_approval")}
									className={cn(
										"group relative z-10 flex items-center justify-between rounded-lg px-3 py-1.5 font-medium text-xs transition-colors",
										folder === "needs_approval"
											? "text-primary-base"
											: "text-text-sub-600 hover:text-primary-base dark:text-neutral-400 dark:hover:text-primary-base",
									)}
								>
									<div className="flex items-center gap-2.5">
										<Icon
											name="alert-triangle"
											className={cn(
												"h-3.5 w-3.5 transition-colors",
												folder === "needs_approval"
													? "text-primary-base"
													: "text-amber-500 opacity-90 group-hover:text-primary-base group-hover:opacity-100",
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

					{/* Bottom back to dashboard */}
					<button
						type="button"
						ref={(el) => {
							buttonRefs.current["exit"] = el;
						}}
						onPointerEnter={() =>
							setHoveredEl(buttonRefs.current["exit"] ?? undefined)
						}
						onPointerLeave={() => setHoveredEl(undefined)}
						onClick={() => router.push("/agent-inbox")}
						className="group relative z-10 flex w-full items-center gap-2 rounded-lg px-3 py-2 font-medium text-text-sub-600 transition-colors hover:text-primary-base text-xs dark:text-neutral-400 dark:hover:text-primary-base"
					>
						<Icon
							name="arrow-left"
							className="h-3.5 w-3.5 text-text-sub-600 opacity-70 transition-colors group-hover:text-primary-base group-hover:opacity-100"
						/>
						<span>Exit to dashboard</span>
					</button>

					{/* Shared animated hover/active background */}
					<AnimatedHoverBackground
						rect={rect}
						tabElement={currentEl}
						className="!bg-primary-base/10"
					/>
				</aside>

				{/* Middle Column: Thread List Pane */}
				<section className="flex min-h-0 w-[360px] shrink-0 flex-col border-stroke-soft-100 border-r bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-neutral-950">
					{/* Search & Meta */}
					<div className="flex flex-col gap-3 border-stroke-soft-100/50 border-b p-4 dark:border-stroke-soft-100/10">
						<div className="flex items-center justify-between">
							<span className="font-mono font-semibold text-text-soft-400 text-xs uppercase tracking-wider">
								{folder.replace("_", " ")}
							</span>
							<span className="font-medium text-[11px] text-text-sub-600 dark:text-neutral-400">
								{filteredThreads.length} threads · {needsApprovalCount} waiting
							</span>
						</div>

						<Input.Root size="xsmall" className="rounded-lg shadow-sm">
							<Input.Wrapper>
								<Input.Icon
									as={Icon}
									name="search"
									size="xsmall"
									className="text-text-soft-400"
								/>
								<Input.Input
									placeholder="Search thread or sender..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="text-xs"
								/>
								{searchQuery && (
									<button
										type="button"
										onClick={() => setSearchQuery("")}
										className="mr-1 rounded p-0.5 text-text-soft-400 transition-colors hover:bg-neutral-alpha-10 hover:text-text-strong-950"
									>
										<Icon name="cross" className="h-3 w-3" />
									</button>
								)}
							</Input.Wrapper>
						</Input.Root>
					</div>

					{/* List scroll */}
					<div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">
						<ThreadList
							threads={filteredThreads}
							selectedId={selectedThreadId}
							onSelect={handleSelectThread}
							emptyMessage={emptyMessage}
							hasFilters={searchQuery !== ""}
							onClearFilters={() => {
								setSearchQuery("");
							}}
						/>
					</div>
				</section>

				{/* Right Column: Reading Pane */}
				<main className="flex min-w-0 flex-1 flex-col bg-bg-white-0 dark:bg-neutral-950">
					{selectedThread ? (
						<div className="flex min-h-0 flex-1 flex-col">
							{/* Reading pane actions header */}
							<div className="flex shrink-0 items-center justify-between border-stroke-soft-100/60 border-b px-6 py-3.5 dark:border-stroke-soft-100/20">
								<div className="flex items-center gap-2">
									<button
										type="button"
										title={
											selectedThread.unread
												? "Mark as Handled"
												: "Mark as Active"
										}
										onClick={() =>
											handleToggleRead(selectedThread.id, selectedThread.unread)
										}
										className="flex h-8 w-8 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-neutral-400 dark:hover:bg-neutral-800"
									>
										<Icon name="check-circle" className="h-4 w-4" />
									</button>
									<button
										type="button"
										title="Mark as Spam"
										onClick={() => handleMarkSpam(selectedThread.id)}
										className="flex h-8 w-8 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-error-base dark:text-neutral-400 dark:hover:bg-neutral-800"
									>
										<Icon name="cross-circle" className="h-4 w-4" />
									</button>
									<button
										type="button"
										title="Delete Message"
										onClick={() => handleDelete(selectedThread.id)}
										className="flex h-8 w-8 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-error-base dark:text-neutral-400 dark:hover:bg-neutral-800"
									>
										<Icon name="trash" className="h-4 w-4" />
									</button>
								</div>

								{/* Navigation */}
								{hasNavigation && (
									<div className="flex items-center gap-3 text-label-xs text-text-soft-400 tabular-nums">
										<span>
											{currentIndex + 1} of {threadsForNavigation.length}
										</span>
										<div className="flex items-center gap-0.5">
											<button
												type="button"
												disabled={currentIndex === 0}
												onClick={() =>
													setSelectedThreadId(
														threadsForNavigation[currentIndex - 1]?.id ?? "",
													)
												}
												className="flex h-8 w-8 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 disabled:pointer-events-none disabled:opacity-30 dark:text-neutral-400 dark:hover:bg-neutral-800"
												title="Newer"
											>
												<Icon name="chevron-left" className="h-4 w-4" />
											</button>
											<button
												type="button"
												disabled={
													currentIndex === threadsForNavigation.length - 1
												}
												onClick={() =>
													setSelectedThreadId(
														threadsForNavigation[currentIndex + 1]?.id ?? "",
													)
												}
												className="flex h-8 w-8 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 disabled:pointer-events-none disabled:opacity-30 dark:text-neutral-400 dark:hover:bg-neutral-800"
												title="Older"
											>
												<Icon name="chevron-right" className="h-4 w-4" />
											</button>
										</div>
									</div>
								)}
							</div>

							<div className="min-h-0 flex-1">
								<ThreadDetail thread={selectedThread} mailbox={mailbox} />
							</div>
						</div>
					) : (
						<div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-bg-weak-50/20 p-8 text-center dark:bg-transparent">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-stroke-soft-100 bg-bg-white-0 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
								<Icon
									name="inbox"
									className="h-5 w-5 text-text-sub-600 dark:text-neutral-400"
								/>
							</div>
							<h3 className="font-semibold text-base text-text-strong-950 dark:text-white">
								Select a thread to read
							</h3>
							<p className="mx-auto mt-1 max-w-sm text-text-sub-600 text-xs dark:text-neutral-400">
								Choose a conversation from the list to review detailed events,
								raw parsed data, and approval actions.
							</p>
						</div>
					)}
				</main>
			</div>

			<ComposeModal
				isOpen={isComposeOpen}
				onClose={() => setIsComposeOpen(false)}
				mailbox={mailbox}
			/>
		</div>
	);
};
