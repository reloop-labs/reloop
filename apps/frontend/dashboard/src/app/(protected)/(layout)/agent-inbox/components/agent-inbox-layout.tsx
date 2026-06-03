"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { AgentMailbox } from "../mock-data";
import {
	countThreadsForFilter,
	type InboxFilter,
	inboundThreads,
	threadMatchesFilter,
} from "../mock-data";
import { AddAgentAddressModal } from "./add-agent-address-modal";
import { InboxFilterTabs } from "./inbox-filter-tabs";
import { SetupWebhookModal } from "./setup-webhook-modal";
import { ThreadDetail } from "./thread-detail";
import { ThreadDrawer } from "./thread-drawer";
import { ThreadList } from "./thread-list";

const useMediaQuery = (query: string) => {
	const [matches, setMatches] = useState(false);

	useEffect(() => {
		const media = window.matchMedia(query);
		setMatches(media.matches);
		const listener = () => setMatches(media.matches);
		media.addEventListener("change", listener);
		return () => media.removeEventListener("change", listener);
	}, [query]);

	return matches;
};

export const AgentInboxLayout = ({ mailbox }: { mailbox: AgentMailbox }) => {
	const mailboxId = mailbox.id;
	const [activeFilter, setActiveFilter] = useState<InboxFilter>("all");
	const [selectedThreadId, setSelectedThreadId] = useQueryState(
		"thread",
		parseAsString.withDefault(""),
	);
	const [setupOpen, setSetupOpen] = useState(false);
	const [addOpen, setAddOpen] = useState(false);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const isDesktop = useMediaQuery("(min-width: 1024px)");

	const mailboxThreads = useMemo(
		() => inboundThreads.filter((t) => t.mailboxId === mailboxId),
		[mailboxId],
	);

	const filteredThreads = useMemo(() => {
		return mailboxThreads.filter((t) => threadMatchesFilter(t, activeFilter));
	}, [mailboxThreads, activeFilter]);

	const filterCounts = useMemo(() => {
		const filters: InboxFilter[] = [
			"all",
			"needs_approval",
			"processing",
			"blocked",
			"handled",
		];
		return Object.fromEntries(
			filters.map((f) => [
				f,
				countThreadsForFilter(inboundThreads, f, mailboxId),
			]),
		) as Record<InboxFilter, number>;
	}, [mailboxId]);

	const selectedThread = useMemo(
		() =>
			filteredThreads.find((t) => t.id === selectedThreadId) ??
			mailboxThreads.find((t) => t.id === selectedThreadId) ??
			null,
		[filteredThreads, mailboxThreads, selectedThreadId],
	);

	useEffect(() => {
		if (!isDesktop && selectedThreadId) {
			setDrawerOpen(true);
		}
	}, [isDesktop, selectedThreadId]);

	useEffect(() => {
		if (!isDesktop || filteredThreads.length === 0) return;

		const selectedVisible = filteredThreads.some(
			(t) => t.id === selectedThreadId,
		);
		if (!selectedThreadId || !selectedVisible) {
			setSelectedThreadId(filteredThreads[0]?.id ?? "");
		}
	}, [filteredThreads, selectedThreadId, setSelectedThreadId, isDesktop]);

	const handleSelectThread = (id: string) => {
		setSelectedThreadId(id);
		if (!isDesktop) {
			setDrawerOpen(true);
		}
	};

	const handleRefresh = () => {
		toast.success("Inbox refreshed");
	};

	const emptyMessage =
		mailboxThreads.length === 0
			? "No inbound messages yet. Set up a webhook to receive email."
			: activeFilter === "needs_approval"
				? "No messages waiting for approval"
				: "No messages in this filter";

	return (
		<div className="flex min-h-0 flex-col pb-8">
			<div className="flex flex-wrap items-center justify-between gap-4 pt-6 pb-2 sm:px-2">
				<div className="flex min-w-0 items-center gap-3">
					<Link
						href="/agent-inbox"
						className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/5"
						aria-label="Back to agent addresses"
					>
						<Icon name="arrow-left" className="h-4 w-4" />
					</Link>
					<div className="min-w-0">
						<h1 className="truncate font-medium text-2xl text-text-strong-950">
							{mailbox.label}
						</h1>
						<p className="truncate text-label-sm text-text-sub-600">
							{mailbox.email}
						</p>
					</div>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Button.Root
						variant="neutral"
						size="xsmall"
						onClick={() => setAddOpen(true)}
						className="gap-1.5"
					>
						<Icon name="plus" className="h-4 w-4" />
						Add address
					</Button.Root>
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={() => setSetupOpen(true)}
					>
						<Icon name="webhook" className="h-4 w-4" />
						Setup webhook
					</Button.Root>
					<Button.Root
						variant="neutral"
						mode="ghost"
						size="xsmall"
						onClick={handleRefresh}
						title="Refresh"
					>
						<Icon name="refresh-cw" className="h-4 w-4" />
					</Button.Root>
				</div>
			</div>

			<div className="mt-3 flex min-h-0 flex-1 flex-col gap-4 sm:px-2 lg:flex-row lg:items-stretch">
				<aside className="hidden w-[176px] shrink-0 border-stroke-soft-100 border-r pr-3 lg:block dark:border-stroke-soft-100/40">
					<InboxFilterTabs
						orientation="vertical"
						activeFilter={activeFilter}
						onFilterChange={setActiveFilter}
						counts={filterCounts}
						className="sticky top-4"
					/>
				</aside>

				<div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
					<div className="lg:hidden">
						<InboxFilterTabs
							orientation="horizontal"
							activeFilter={activeFilter}
							onFilterChange={setActiveFilter}
							counts={filterCounts}
							className="py-0"
						/>
					</div>

					<div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:items-start">
						<div
							className={cn(
								"w-full text-paragraph-sm lg:w-[360px] lg:shrink-0 lg:self-start",
								isDesktop && "lg:sticky lg:top-4",
							)}
						>
							<ThreadList
								threads={filteredThreads}
								selectedId={selectedThreadId || null}
								onSelect={handleSelectThread}
								emptyMessage={emptyMessage}
								hasFilters={activeFilter !== "all"}
								onClearFilters={() => setActiveFilter("all")}
							/>
						</div>

						{isDesktop && (
							<div className="min-w-0 flex-1 rounded-3xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5">
								<ThreadDetail thread={selectedThread} mailbox={mailbox} />
							</div>
						)}
					</div>
				</div>
			</div>

			<ThreadDrawer
				thread={selectedThread}
				mailbox={mailbox}
				isOpen={!isDesktop && drawerOpen}
				onOpenChange={(open) => {
					setDrawerOpen(open);
					if (!open) setSelectedThreadId("");
				}}
			/>

			<SetupWebhookModal open={setupOpen} onOpenChange={setSetupOpen} />
			<AddAgentAddressModal open={addOpen} onOpenChange={setAddOpen} />
		</div>
	);
};
