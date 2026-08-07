"use client";

import { cn } from "@reloop/ui/cn";
import { Logo } from "@reloop/ui/logo";
import { Menu, Search, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AddAgentAddressModal } from "#/features/agent-inbox/components/add-agent-address-modal";
import { useAgentInbox } from "#/features/agent-inbox/components/agent-inbox-provider";
import { InboxNavUser } from "#/features/agent-inbox/components/sidebar/inbox-nav-user";
import { useInboxSidebar } from "#/features/agent-inbox/components/sidebar/inbox-sidebar-context";
import type { AgentMailbox } from "#/features/agent-inbox/types";
import { useSessionQuery } from "#/features/auth/session-query";
import { UserDropdown } from "#/features/dashboard/page-header/user-dropdown";

/**
 * Gmail-style top chrome for the fullscreen inbox:
 * left = menu + logo, center = search, right = settings + profile + mailbox.
 */
export function InboxTopNavbar({ mailbox }: { mailbox: AgentMailbox }) {
	const router = useRouter();
	const { toggleSidebar, collapsed } = useInboxSidebar();
	const { getMailbox, isLoadingMailboxes, mailboxesError, retryMailboxes } =
		useAgentInbox();
	const mailboxReady = !!getMailbox(mailbox.id) && !!mailbox.email;
	const [isAddMailboxOpen, setIsAddMailboxOpen] = useState(false);

	const { data: session } = useSessionQuery();
	const user = session?.user
		? {
				name: session.user.name || session.user.email || "User",
				email: session.user.email || "",
				image: session.user.image,
			}
		: null;

	const openSearch = () => {
		window.dispatchEvent(new CustomEvent("inbox:open-search"));
	};

	return (
		<>
			<header className="flex h-14 shrink-0 items-center gap-3 border-mail-border/60 border-b bg-sidebar px-2 sm:px-3">
				{/* Left: menu + logo */}
				<div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-2">
					<button
						type="button"
						onClick={toggleSidebar}
						title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
						aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
						className="flex size-10 shrink-0 items-center justify-center rounded-full text-mail-muted transition-colors hover:bg-[var(--inbox-row-hover)] hover:text-mail-foreground"
					>
						<Menu className="h-5 w-5" strokeWidth={1.75} />
					</button>
					<Link
						href="/"
						className="flex min-w-0 items-center gap-1.5 rounded-lg pr-2 transition-opacity hover:opacity-90"
						title="Back to dashboard"
					>
						<Logo className="h-8 w-8 shrink-0" />
						<span className="hidden truncate font-normal text-[22px] text-mail-foreground tracking-tight sm:inline">
							Reloop
						</span>
					</Link>
				</div>

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

				{/* Right: settings · user · mailbox switcher (far right) */}
				<div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
					<Link
						href="/settings?from=/inbox"
						title="Settings"
						aria-label="Settings"
						className="flex size-10 items-center justify-center rounded-full text-mail-muted transition-colors hover:bg-[var(--inbox-row-hover)] hover:text-mail-foreground"
					>
						<Settings className="h-5 w-5" strokeWidth={1.6} />
					</Link>
					<div className="flex size-10 items-center justify-center">
						<UserDropdown user={user} />
					</div>
					<div className="ml-0.5 min-w-0 border-mail-border/50 border-l pl-1.5 sm:pl-2">
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
