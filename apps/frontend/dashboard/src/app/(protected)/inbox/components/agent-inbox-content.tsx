"use client";

import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";
import { toast } from "sonner";
import type { AgentMailbox, AgentThread } from "../types";
import { useAgentInbox } from "./agent-inbox-provider";
import { ThreadDetail } from "./thread-detail";
import { ThreadList } from "./thread-list";

export const AgentInboxContent = ({
	mailbox,
	folder,
	threads,
}: {
	mailbox: AgentMailbox;
	folder: string;
	threads: AgentThread[];
}) => {
	const { markMessageRead, markMessageSpam, deleteMessage } = useAgentInbox();

	const [searchQuery, setSearchQuery] = useQueryState(
		"q",
		parseAsString.withDefault(""),
	);
	const [selectedThreadId, setSelectedThreadId] = useQueryState(
		"thread",
		parseAsString.withDefault(""),
	);

	const filteredThreads = useMemo(() => {
		let result = threads;
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
	}, [threads, searchQuery]);

	const selectedThread = useMemo(
		() =>
			filteredThreads.find((t) => t.id === selectedThreadId) ??
			threads.find((t) => t.id === selectedThreadId) ??
			null,
		[filteredThreads, threads, selectedThreadId],
	);

	const threadsForNavigation = useMemo(() => {
		return filteredThreads.length > 0 ? filteredThreads : threads;
	}, [filteredThreads, threads]);

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

	const handleSelectThread = (id: string) => {
		setSelectedThreadId(id || null);
	};

	const emptyMessage =
		threads.length === 0
			? "No inbound messages yet. Set up a webhook to receive email."
			: folder === "spam"
				? "No spam messages"
				: "No messages in this folder";

	const needsApprovalCount = useMemo(
		() =>
			threads.filter(
				(t) => t.direction === "inbound" && t.status === "needs_approval",
			).length,
		[threads],
	);

	return (
		<>
			{/* Middle Column: Thread List Pane */}
			<section className="flex min-h-0 w-[360px] shrink-0 flex-col border-stroke-inbox border-r bg-[#FAF8F4] dark:border-stroke-soft-100/40 dark:bg-neutral-950">
				{/* Search & Meta */}
				<div className="flex flex-col gap-3 border-stroke-inbox/50 border-b p-4 dark:border-stroke-soft-100/10">
					<div className="flex flex-col gap-1">
						<h2 className="font-semibold text-base text-text-strong-950 dark:text-white">
							{folder === "needs_approval"
								? "Needs your okay"
								: folder === "agent"
									? "Handled by agent"
									: folder === "you"
										? "Sent by you"
										: folder.charAt(0).toUpperCase() +
											folder.slice(1).replace("_", " ")}
						</h2>
						<p className="font-medium text-[11px] text-text-soft-400">
							{filteredThreads.length}{" "}
							{filteredThreads.length === 1 ? "message" : "messages"}
							{needsApprovalCount > 0 &&
								` · ${needsApprovalCount} waiting on you`}
						</p>
					</div>

					<Input.Root
						size="xsmall"
						className="rounded-xl shadow-none before:ring-stroke-inbox"
					>
						<Input.Wrapper>
							<Input.Icon
								as={Icon}
								name="search"
								size="xsmall"
								className="text-text-soft-400"
							/>
							<Input.Input
								placeholder="Search mail"
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
			<main className="flex min-w-0 flex-1 flex-col bg-[#FAF8F4] dark:bg-neutral-950">
				{selectedThread ? (
					<div className="flex min-h-0 flex-1 flex-col">
						<div className="min-h-0 flex-1">
							<ThreadDetail thread={selectedThread} mailbox={mailbox} />
						</div>
					</div>
				) : (
					<div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-[#FAF8F4]/20 p-8 text-center dark:bg-transparent">
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-stroke-inbox bg-bg-white-0 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
							<Icon
								name="inbox"
								className="h-5 w-5 text-text-sub-600 dark:text-neutral-400"
							/>
						</div>
						<h3 className="font-semibold text-base text-text-strong-950 dark:text-white">
							Select a thread to read
						</h3>
						<p className="mx-auto mt-1 max-w-sm text-text-sub-600 text-xs dark:text-neutral-400">
							Choose a conversation from the list to review detailed events, raw
							parsed data, and approval actions.
						</p>
					</div>
				)}
			</main>
		</>
	);
};
