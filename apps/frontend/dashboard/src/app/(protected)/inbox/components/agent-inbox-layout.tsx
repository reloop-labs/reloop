"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";
import { toast } from "sonner";
import type { AgentMailbox } from "../mock-data";
import { useAgentInbox } from "./agent-inbox-provider";
import { ThreadDetail } from "./thread-detail";
import { ThreadList } from "./thread-list";

export const AgentInboxLayout = ({ mailbox }: { mailbox: AgentMailbox }) => {
	const router = useRouter();
	const mailboxId = mailbox.id;

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

	const { mailboxes, threads, refresh, markMessageRead, markMessageSpam, deleteMessage } =
		useAgentInbox();

	const mailboxThreads = useMemo(
		() => threads.filter((t) => t.mailboxId === mailboxId),
		[mailboxId, threads],
	);

	// Dynamic folder counts
	const inboxCount = useMemo(
		() => mailboxThreads.filter((t) => t.status !== "blocked").length,
		[mailboxThreads],
	);
	const sentCount = useMemo(
		() => mailboxThreads.filter((t) => t.status === "handled").length,
		[mailboxThreads],
	);
	const draftsCount = useMemo(
		() => mailboxThreads.filter((t) => t.status === "needs_approval" || t.status === "parsing").length,
		[mailboxThreads],
	);
	const spamCount = useMemo(
		() => mailboxThreads.filter((t) => t.status === "blocked").length,
		[mailboxThreads],
	);
	const agentCount = useMemo(
		() => mailboxThreads.filter((t) => t.status === "handled").length,
		[mailboxThreads],
	);
	const youCount = useMemo(
		() => Math.max(0, mailboxThreads.filter((t) => t.status === "handled").length - 1),
		[mailboxThreads],
	);
	const needsApprovalCount = useMemo(
		() => mailboxThreads.filter((t) => t.status === "needs_approval").length,
		[mailboxThreads],
	);

	const filteredThreads = useMemo(() => {
		let result = mailboxThreads;

		// Apply folder / rail filters
		if (folder === "inbox") {
			result = result.filter((t) => t.status !== "blocked");
		} else if (folder === "sent") {
			result = result.filter((t) => t.status === "handled");
		} else if (folder === "drafts") {
			result = result.filter((t) => t.status === "needs_approval" || t.status === "parsing");
		} else if (folder === "spam") {
			result = result.filter((t) => t.status === "blocked");
		} else if (folder === "trash") {
			result = [];
		} else if (folder === "agent") {
			result = result.filter((t) => t.status === "handled");
		} else if (folder === "you") {
			result = result.filter((t) => t.status === "handled");
		} else if (folder === "needs_approval") {
			result = result.filter((t) => t.status === "needs_approval");
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

	const handleRefresh = async () => {
		try {
			await refresh();
			toast.success("Inbox refreshed");
		} catch {
			toast.error("Failed to refresh inbox");
		}
	};

	const emptyMessage =
		mailboxThreads.length === 0
			? "No inbound messages yet. Set up a webhook to receive email."
			: folder === "spam"
				? "No spam messages"
				: "No messages in this folder";

	return (
		<div className="flex h-screen w-screen flex-col overflow-hidden bg-bg-weak-50 text-text-strong-950 dark:bg-[#09090b] dark:text-neutral-50 font-sans">
			{/* Mockup Premium Topbar */}
			<header className="flex h-14 shrink-0 items-center justify-between border-b border-stroke-soft-100 bg-bg-white-0 px-4 dark:border-stroke-soft-100/40 dark:bg-neutral-900">
				<div className="flex items-center gap-3">
					{/* Logo brand mark */}
					<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-text-strong-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm">
						<svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
						</svg>
					</div>
					<span className="font-semibold text-sm tracking-tight">Agent Inbox</span>
					<div className="h-4 w-px bg-stroke-strong-200 dark:bg-neutral-800" />
					<div className="flex items-center gap-1.5">
						<span className="relative flex h-2 w-2">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
							<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
						</span>
						<span className="font-mono text-[11px] text-text-soft-400">agent.connected · last sync 12s ago</span>
					</div>

					{/* Mailbox Selector */}
					<select
						value={mailbox.id}
						onChange={(e) => router.push(`/inbox/${e.target.value}`)}
						className="ml-2 cursor-pointer rounded-lg border border-stroke-soft-100 bg-bg-white-0 px-2.5 py-1 text-xs font-medium text-text-strong-950 shadow-sm outline-none transition-colors hover:bg-bg-weak-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
					>
						{mailboxes.map((mb) => (
							<option key={mb.id} value={mb.id}>
								{mb.email}
							</option>
						))}
					</select>
				</div>

				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={handleRefresh}
						title="Refresh"
						className="flex h-8 w-8 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-neutral-400 dark:hover:bg-neutral-800"
					>
						<Icon name="refresh-cw" className="h-4 w-4" />
					</button>
					<button
						type="button"
						title="Settings"
						onClick={() => toast.info("Settings — prototype only")}
						className="flex h-8 w-8 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-neutral-400 dark:hover:bg-neutral-800"
					>
						<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
							<path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
							<path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
					</button>
					<div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white font-semibold text-xs shadow-sm">
						PV
					</div>
				</div>
			</header>

			{/* Column Wrapper */}
			<div className="flex flex-1 min-h-0">
				{/* Left Folder Rail */}
				<aside className="w-56 shrink-0 border-r border-stroke-soft-100 bg-bg-white-0 p-4 flex flex-col justify-between dark:border-stroke-soft-100/40 dark:bg-neutral-900">
					<div className="flex flex-col gap-5">
						<button
							type="button"
							onClick={() => toast.info("New email — prototype only")}
							className="w-full flex items-center justify-center gap-2 rounded-xl bg-text-strong-950 text-white py-2.5 px-4 font-semibold text-sm transition-colors hover:opacity-90 dark:bg-white dark:text-neutral-950"
						>
							<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
								<path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
							</svg>
							<span>Compose</span>
						</button>

						{/* Folders List */}
						<div className="flex flex-col gap-0.5">
							<button
								onClick={() => setFolder("inbox")}
								className={cn(
									"flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors",
									folder === "inbox"
										? "bg-bg-weak-100 text-text-strong-950 dark:bg-neutral-800 dark:text-white"
										: "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-neutral-400 dark:hover:bg-neutral-800/40"
								)}
							>
								<div className="flex items-center gap-2.5">
									<Icon name="inbox" className="h-3.5 w-3.5" />
									<span>Inbox</span>
								</div>
								{inboxCount > 0 && (
									<span className="text-[10px] font-mono font-medium text-text-soft-400 bg-bg-weak-100/80 px-1.5 py-0.5 rounded-md dark:bg-neutral-800">
										{inboxCount}
									</span>
								)}
							</button>

							<button
								onClick={() => setFolder("sent")}
								className={cn(
									"flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors",
									folder === "sent"
										? "bg-bg-weak-100 text-text-strong-950 dark:bg-neutral-800 dark:text-white"
										: "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-neutral-400 dark:hover:bg-neutral-800/40"
								)}
							>
								<div className="flex items-center gap-2.5">
									<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
										<path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
									</svg>
									<span>Sent</span>
								</div>
								{sentCount > 0 && (
									<span className="text-[10px] font-mono font-medium text-text-soft-400 bg-bg-weak-100/80 px-1.5 py-0.5 rounded-md dark:bg-neutral-800">
										{sentCount}
									</span>
								)}
							</button>

							<button
								onClick={() => setFolder("drafts")}
								className={cn(
									"flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors",
									folder === "drafts"
										? "bg-bg-weak-100 text-text-strong-950 dark:bg-neutral-800 dark:text-white"
										: "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-neutral-400 dark:hover:bg-neutral-800/40"
								)}
							>
								<div className="flex items-center gap-2.5">
									<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
										<path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
									</svg>
									<span>Drafts</span>
								</div>
								{draftsCount > 0 && (
									<span className="text-[10px] font-mono font-medium text-text-soft-400 bg-bg-weak-100/80 px-1.5 py-0.5 rounded-md dark:bg-neutral-800">
										{draftsCount}
									</span>
								)}
							</button>

							<button
								onClick={() => setFolder("spam")}
								className={cn(
									"flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors",
									folder === "spam"
										? "bg-bg-weak-100 text-text-strong-950 dark:bg-neutral-800 dark:text-white"
										: "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-neutral-400 dark:hover:bg-neutral-800/40"
								)}
							>
								<div className="flex items-center gap-2.5">
									<Icon name="alert-triangle" className="h-3.5 w-3.5" />
									<span>Spam</span>
								</div>
								{spamCount > 0 && (
									<span className="text-[10px] font-mono font-medium text-text-soft-400 bg-bg-weak-100/80 px-1.5 py-0.5 rounded-md dark:bg-neutral-800">
										{spamCount}
									</span>
								)}
							</button>

							<button
								onClick={() => setFolder("trash")}
								className={cn(
									"flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors",
									folder === "trash"
										? "bg-bg-weak-100 text-text-strong-950 dark:bg-neutral-800 dark:text-white"
										: "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-neutral-400 dark:hover:bg-neutral-800/40"
								)}
							>
								<div className="flex items-center gap-2.5">
									<Icon name="trash" className="h-3.5 w-3.5" />
									<span>Trash</span>
								</div>
							</button>
						</div>

						{/* Filter by Actor Section */}
						<div className="flex flex-col gap-1.5">
							<div className="px-3 text-[10px] font-mono font-bold tracking-wider text-text-soft-400 uppercase">
								Filter by actor
							</div>
							<div className="flex flex-col gap-0.5">
								<button
									onClick={() => setFolder("agent")}
									className={cn(
										"flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
										folder === "agent"
											? "bg-bg-weak-100 text-text-strong-950 dark:bg-neutral-800 dark:text-white"
											: "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-neutral-400 dark:hover:bg-neutral-800/40"
									)}
								>
									<div className="flex items-center gap-2.5">
										<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
											<path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
										</svg>
										<span>Handled by agent</span>
									</div>
									{agentCount > 0 && (
										<span className="text-[10px] font-mono font-medium text-text-soft-400 bg-bg-weak-100/80 px-1.5 py-0.5 rounded-md dark:bg-neutral-800">
											{agentCount}
										</span>
									)}
								</button>

								<button
									onClick={() => setFolder("you")}
									className={cn(
										"flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
										folder === "you"
											? "bg-bg-weak-100 text-text-strong-950 dark:bg-neutral-800 dark:text-white"
											: "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-neutral-400 dark:hover:bg-neutral-800/40"
									)}
								>
									<div className="flex items-center gap-2.5">
										<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
											<path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
										</svg>
										<span>Sent by you</span>
									</div>
									{youCount > 0 && (
										<span className="text-[10px] font-mono font-medium text-text-soft-400 bg-bg-weak-100/80 px-1.5 py-0.5 rounded-md dark:bg-neutral-800">
											{youCount}
										</span>
									)}
								</button>

								<button
									onClick={() => setFolder("needs_approval")}
									className={cn(
										"flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
										folder === "needs_approval"
											? "bg-bg-weak-100 text-text-strong-950 dark:bg-neutral-800 dark:text-white"
											: "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-neutral-400 dark:hover:bg-neutral-800/40"
									)}
								>
									<div className="flex items-center gap-2.5">
										<svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
											<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
										</svg>
										<span>Needs your okay</span>
									</div>
									{needsApprovalCount > 0 && (
										<span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md dark:bg-amber-950/30 dark:text-amber-400">
											{needsApprovalCount}
										</span>
									)}
								</button>
							</div>
						</div>
					</div>

					{/* Bottom back to dashboard */}
					<button
						onClick={() => router.push("/agent-inbox")}
						className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 transition-colors dark:text-neutral-400 dark:hover:bg-neutral-800"
					>
						<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
							<path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
						</svg>
						<span>Exit to dashboard</span>
					</button>
				</aside>

				{/* Middle Column: Thread List Pane */}
				<section className="w-[360px] shrink-0 border-r border-stroke-soft-100 bg-bg-white-0 flex flex-col min-h-0 dark:border-stroke-soft-100/40 dark:bg-neutral-950">
					{/* Search & Meta */}
					<div className="p-4 border-b border-stroke-soft-100/50 flex flex-col gap-3 dark:border-stroke-soft-100/10">
						<div className="flex items-center justify-between">
							<span className="text-xs font-semibold uppercase font-mono tracking-wider text-text-soft-400">
								{folder.replace("_", " ")}
							</span>
							<span className="text-[11px] font-medium text-text-sub-600 dark:text-neutral-400">
								{filteredThreads.length} threads · {needsApprovalCount} waiting
							</span>
						</div>

						<Input.Root size="xsmall" className="rounded-lg shadow-sm">
							<Input.Wrapper>
								<Input.Icon as={Icon} name="search" size="xsmall" className="text-text-soft-400" />
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
					<div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide">
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
				<main className="flex-1 min-w-0 bg-bg-white-0 flex flex-col dark:bg-neutral-950">
					{selectedThread ? (
						<div className="flex min-h-0 flex-1 flex-col">
							{/* Reading pane actions header */}
							<div className="flex shrink-0 items-center justify-between border-b border-stroke-soft-100/60 px-6 py-3.5 dark:border-stroke-soft-100/20">
								<div className="flex items-center gap-2">
									<button
										type="button"
										title={selectedThread.unread ? "Mark as Handled" : "Mark as Active"}
										onClick={() => handleToggleRead(selectedThread.id, selectedThread.unread)}
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
												disabled={currentIndex === threadsForNavigation.length - 1}
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

							<div className="flex-1 min-h-0">
								<ThreadDetail thread={selectedThread} mailbox={mailbox} />
							</div>
						</div>
					) : (
						<div className="flex min-h-0 flex-1 flex-col justify-center items-center p-8 text-center bg-bg-weak-50/20 dark:bg-transparent">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-stroke-soft-100 bg-bg-white-0 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
								<Icon name="inbox" className="h-5 w-5 text-text-sub-600 dark:text-neutral-400" />
							</div>
							<h3 className="font-semibold text-base text-text-strong-950 dark:text-white">
								Select a thread to read
							</h3>
							<p className="mx-auto max-w-sm mt-1 text-xs text-text-sub-600 dark:text-neutral-400">
								Choose a conversation from the list to review detailed events, raw parsed data, and approval actions.
							</p>
						</div>
					)}
				</main>
			</div>
		</div>
	);
};
