"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { AddAgentAddressModal } from "#/features/agent-inbox/components/add-agent-address-modal";
import { useAgentInbox } from "#/features/agent-inbox/components/agent-inbox-provider";
import { useAiSidebar } from "#/features/agent-inbox/components/ai-sidebar";
import { InboxNavUser } from "#/features/agent-inbox/components/sidebar/inbox-nav-user";
import { useInboxSidebar } from "#/features/agent-inbox/components/sidebar/inbox-sidebar-context";
import { InboxSidebarToggle } from "#/features/agent-inbox/components/sidebar/inbox-sidebar-toggle";
import type { AgentMailbox } from "#/features/agent-inbox/types";
import { useSupportUnread } from "#/features/dashboard/hooks/use-support-unread";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { useUIStore } from "#/store/use-ui-store";

/**
 * Top chrome for the fullscreen inbox:
 * logo sits over the sidebar column; search aligns with the mail content pane.
 */
export function InboxTopNavbar({ mailbox }: { mailbox: AgentMailbox }) {
	const router = useRouter();
	const { collapsed, toggleSidebar } = useInboxSidebar();
	const { getMailbox, isLoadingMailboxes, mailboxesError, retryMailboxes } =
		useAgentInbox();
	const mailboxReady = !!getMailbox(mailbox.id) && !!mailbox.email;
	const [isAddMailboxOpen, setIsAddMailboxOpen] = useState(false);
	const [searchQuery] = useQueryState("q", parseAsString.withDefault(""));
	const activeSearch = searchQuery.trim();

	const {
		isAiPanelOpen,
		setIsAiPanelOpen,
		aiPanelActiveTab,
		setAiPanelActiveTab,
	} = useUIStore();
	const { unreadCount } = useSupportUnread();
	const supportOpen = isAiPanelOpen && aiPanelActiveTab === "support";
	const { open: aiOpen, toggle: toggleAi } = useAiSidebar({
		defaultOpen: true,
	});

	const openSearch = () => {
		window.dispatchEvent(new CustomEvent("inbox:open-search"));
	};

	const toggleSupport = () => {
		if (!isAiPanelOpen) {
			setAiPanelActiveTab("support");
			setIsAiPanelOpen(true);
		} else if (aiPanelActiveTab === "support") {
			setIsAiPanelOpen(false);
		} else {
			setAiPanelActiveTab("support");
			setIsAiPanelOpen(true);
		}
	};

	return (
		<>
			<header className="flex h-11 shrink-0 items-center border-mail-border/60 border-b">
				{/* Logo column — same width as sidebar so search lines up with content */}
				<div
					className={cn(
						"flex h-full shrink-0 items-center border-mail-border border-r bg-sidebar transition-[width] duration-200 ease-in-out",
						collapsed ? "w-14 justify-center px-0" : "w-60 px-3",
					)}
				>
					<Link
						href="/"
						className={cn(
							"flex min-w-0 items-center transition-opacity hover:opacity-90",
							collapsed ? "justify-center" : "gap-2 pl-1",
						)}
						title="Back to dashboard"
					>
						{collapsed ? (
							<Logo className="h-8 w-8 shrink-0" />
						) : (
							<div className="flex min-w-0 items-center gap-2">
								<Logo className="-ml-1 w-10 shrink-0" />
								<p className="-ml-2 font-semibold text-mail-foreground">
									Reloop
								</p>
								<span className="inline-flex items-center rounded-full bg-[var(--inbox-control)] px-2 py-0.5 font-bold text-[8px] text-mail-muted uppercase tracking-wide dark:bg-white/[0.06]">
									Beta
								</span>
							</div>
						)}
					</Link>
				</div>

				{/* Content column: compact search + actions, padded like the dashboard header */}
				<div className="flex h-full min-w-0 flex-1 items-center gap-2 bg-panel-light px-3 dark:bg-panel-dark">
					<InboxSidebarToggle onClick={toggleSidebar} collapsed={collapsed} />
					<button
						type="button"
						onClick={openSearch}
						className={cn(
							"flex h-8 w-full min-w-0 max-w-[220px] items-center gap-2 rounded-lg px-2.5 text-left",
							"bg-bg-weak-50 text-mail-muted",
							"ring-1 ring-stroke-soft-100",
							"transition-colors hover:bg-bg-soft-200/70 hover:ring-stroke-soft-200",
							"dark:bg-white/[0.06] dark:ring-white/10 dark:hover:bg-white/[0.1]",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zero-blue/35",
						)}
					>
						<Search
							className="h-3.5 w-3.5 shrink-0 opacity-70"
							strokeWidth={1.75}
						/>
						<span
							className={cn(
								"min-w-0 flex-1 truncate text-[13px]",
								activeSearch && "text-mail-foreground",
							)}
						>
							{activeSearch || "Search mail"}
						</span>
						<span className="hidden shrink-0 items-center gap-0.5 sm:inline-flex">
							<ActionKbd className="w-auto min-w-4 px-1">⌘</ActionKbd>
							<ActionKbd>K</ActionKbd>
						</span>
					</button>

					{/* Support + agent bot + mailbox — right side of content column */}
					<div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
						<button
							type="button"
							onClick={toggleSupport}
							title="Support"
							aria-label="Support"
							aria-pressed={supportOpen}
							className={cn(
								"relative flex h-7 items-center gap-1.5 rounded-lg px-2 text-mail-muted transition-colors",
								"hover:bg-[var(--inbox-row-hover)] hover:text-mail-foreground",
								supportOpen &&
									"bg-[var(--inbox-selected)] text-mail-foreground",
							)}
						>
							<Icon name="question" className="h-3.5 w-3.5" />
							<span className="hidden font-medium text-[13px] sm:inline">
								Support
							</span>
							{unreadCount > 0 ? (
								<span className="-top-0.5 -right-0.5 absolute flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 font-semibold text-[10px] text-white tabular-nums">
									{unreadCount > 99 ? "99+" : unreadCount}
								</span>
							) : null}
						</button>

						<button
							type="button"
							onClick={toggleAi}
							title="Agent chat"
							aria-label="Agent chat"
							aria-pressed={aiOpen}
							className={cn(
								"flex size-7 items-center justify-center rounded-lg transition-colors",
								"text-mail-muted hover:bg-[var(--inbox-row-hover)] hover:text-mail-foreground",
								aiOpen &&
									"bg-[var(--inbox-selected)] text-mail-foreground ring-1 ring-zero-blue/30",
							)}
						>
							<Icon name="agent" className="h-4 w-4" />
						</button>

						<div className="min-w-0">
							{mailboxesError && !mailboxReady ? (
								<button
									type="button"
									onClick={() => void retryMailboxes()}
									className="rounded-lg px-2 py-1.5 text-[12px] text-mail-muted hover:bg-[var(--inbox-row-hover)]"
								>
									Retry mailbox
								</button>
							) : (
								<InboxNavUser
									mailbox={mailbox}
									collapsed={false}
									loading={!mailboxReady || isLoadingMailboxes}
									compact
									onAddMailbox={() => setIsAddMailboxOpen(true)}
								/>
							)}
						</div>
					</div>
				</div>
			</header>

			<AddAgentAddressModal
				isOpen={isAddMailboxOpen}
				onClose={() => setIsAddMailboxOpen(false)}
				onCreated={(created) => {
					toast.success("Mailbox added");
					router.push(`/inbox/${created.id}`);
				}}
			/>
		</>
	);
}
