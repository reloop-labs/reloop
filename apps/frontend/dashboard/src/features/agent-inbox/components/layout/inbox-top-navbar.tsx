"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AddAgentAddressModal } from "#/features/agent-inbox/components/add-agent-address-modal";
import { useAgentInbox } from "#/features/agent-inbox/components/agent-inbox-provider";
import { InboxNavUser } from "#/features/agent-inbox/components/sidebar/inbox-nav-user";
import type { AgentMailbox } from "#/features/agent-inbox/types";
import { useSupportUnread } from "#/features/dashboard/hooks/use-support-unread";
import { useUIStore } from "#/store/use-ui-store";

/**
 * Top chrome for the fullscreen inbox:
 * left = dashboard logo lockup, center = search, right = support + mailbox.
 */
export function InboxTopNavbar({ mailbox }: { mailbox: AgentMailbox }) {
	const router = useRouter();
	const { getMailbox, isLoadingMailboxes, mailboxesError, retryMailboxes } =
		useAgentInbox();
	const mailboxReady = !!getMailbox(mailbox.id) && !!mailbox.email;
	const [isAddMailboxOpen, setIsAddMailboxOpen] = useState(false);

	const {
		isAiPanelOpen,
		setIsAiPanelOpen,
		aiPanelActiveTab,
		setAiPanelActiveTab,
	} = useUIStore();
	const { unreadCount } = useSupportUnread();
	const supportOpen = isAiPanelOpen && aiPanelActiveTab === "support";

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
			<header className="flex h-14 shrink-0 items-center gap-3 border-mail-border/60 border-b bg-sidebar px-2 sm:px-3">
				{/* Left: same logo lockup as the main dashboard sidebar */}
				<Link
					href="/"
					className="flex h-12 min-w-0 shrink-0 items-center justify-start pr-3 transition-opacity hover:opacity-90"
					title="Back to dashboard"
				>
					<div className="flex items-center gap-2">
						<Logo className="-ml-1 w-10 shrink-0" />
						<p className="-ml-2 font-semibold text-mail-foreground">Reloop</p>
						<span className="inline-flex items-center rounded-full bg-[var(--inbox-control)] px-2 py-0.5 font-bold text-[8px] text-mail-muted uppercase tracking-wide dark:bg-white/[0.06]">
							Beta
						</span>
					</div>
				</Link>

				{/* Center: search */}
				<div className="flex min-w-0 flex-1 justify-center px-1 sm:px-4">
					<button
						type="button"
						onClick={openSearch}
						className={cn(
							"flex h-11 w-full max-w-[720px] items-center gap-3 rounded-full px-4 text-left",
							"bg-[var(--inbox-control)] text-mail-muted",
							"transition-colors hover:bg-[var(--inbox-control-hover)]",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zero-blue/30",
						)}
					>
						<Search
							className="h-4 w-4 shrink-0 opacity-70"
							strokeWidth={1.75}
						/>
						<span className="min-w-0 flex-1 truncate text-[15px]">
							Search mail
						</span>
						<span className="hidden shrink-0 items-center gap-0.5 sm:flex">
							<kbd className="rounded border border-mail-border/50 bg-panel-light px-1.5 py-0.5 font-sans text-[10px] text-mail-muted dark:bg-panel-dark">
								⌘
							</kbd>
							<kbd className="rounded border border-mail-border/50 bg-panel-light px-1.5 py-0.5 font-sans text-[10px] text-mail-muted dark:bg-panel-dark">
								K
							</kbd>
						</span>
					</button>
				</div>

				{/* Right: support + mailbox switcher */}
				<div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
					<button
						type="button"
						onClick={toggleSupport}
						title="Support"
						aria-label="Support"
						aria-pressed={supportOpen}
						className={cn(
							"relative flex h-9 items-center gap-1.5 rounded-full px-2.5 text-mail-muted transition-colors",
							"hover:bg-[var(--inbox-row-hover)] hover:text-mail-foreground",
							supportOpen && "bg-[var(--inbox-selected)] text-mail-foreground",
						)}
					>
						<Icon name="question" className="h-4 w-4" />
						<span className="hidden font-medium text-[13px] sm:inline">
							Support
						</span>
						{unreadCount > 0 ? (
							<span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 font-semibold text-[10px] text-white tabular-nums">
								{unreadCount > 99 ? "99+" : unreadCount}
							</span>
						) : null}
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
