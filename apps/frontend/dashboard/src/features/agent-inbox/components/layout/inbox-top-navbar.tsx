"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Check, Copy, Search } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { useInboxSidebar } from "#/features/agent-inbox/components/sidebar/inbox-sidebar-context";
import { InboxSidebarToggle } from "#/features/agent-inbox/components/sidebar/inbox-sidebar-toggle";
import type { AgentMailbox } from "#/features/agent-inbox/types";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";

export function InboxTopNavbar({ mailbox }: { mailbox: AgentMailbox }) {
	const { collapsed, toggleSidebar } = useInboxSidebar();
	const [searchQuery] = useQueryState("q", parseAsString.withDefault(""));
	const [emailCopied, setEmailCopied] = useState(false);
	const activeSearch = searchQuery.trim();

	const openSearch = () => {
		window.dispatchEvent(new CustomEvent("inbox:open-search"));
	};

	const handleCopyEmail = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!mailbox.email) return;
		try {
			await navigator.clipboard.writeText(mailbox.email);
			setEmailCopied(true);
			toast.success("Email address copied");
			setTimeout(() => setEmailCopied(false), 2000);
		} catch {
			toast.error("Failed to copy email");
		}
	};

	return (
		<header className="flex h-11 shrink-0 items-center border-stroke-soft-100 border-b bg-bg-white-0 dark:border-white/10 dark:bg-black">
			{/* Sidebar header column — matches inbox folder sidebar width */}
			<div
				className={cn(
					"flex h-full shrink-0 items-center border-stroke-soft-100 border-r transition-[width] duration-200 ease-in-out dark:border-white/10",
					collapsed ? "w-[110px] justify-center px-0" : "w-[294px] gap-2 px-3",
				)}
			>
				<InboxSidebarToggle onClick={toggleSidebar} collapsed={collapsed} />
				{!collapsed && (
					<button
						type="button"
						onClick={handleCopyEmail}
						title={`Click to copy ${mailbox.email || "email"}`}
						className="group/copy flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 overflow-hidden rounded-md text-left transition-opacity hover:opacity-80"
					>
						<Icon name="inbox" className="h-4 w-4 shrink-0 text-text-sub-600" />
						<span className="truncate font-semibold text-[13px] text-text-strong-950">
							{mailbox.email || mailbox.label || "Inbox"}
						</span>
						{emailCopied ? (
							<Check className="size-3 shrink-0 text-emerald-500" />
						) : (
							<Copy className="size-3 shrink-0 text-text-sub-600 opacity-0 transition-opacity group-hover/copy:opacity-100" />
						)}
					</button>
				)}
			</div>

			{/* Content column: compact search */}
			<div className="flex h-full min-w-0 flex-1 items-center gap-2 px-3">
				<button
					type="button"
					onClick={openSearch}
					className={cn(
						"flex h-8 w-full min-w-0 max-w-[220px] items-center gap-2 rounded-lg px-2.5 text-left",
						"bg-bg-weak-50 text-text-sub-600",
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
							activeSearch && "text-text-strong-950",
						)}
					>
						{activeSearch || "Search mail"}
					</span>
					<span className="hidden shrink-0 items-center gap-0.5 sm:inline-flex">
						<ActionKbd className="w-auto min-w-4 px-1">⌘</ActionKbd>
						<ActionKbd>K</ActionKbd>
					</span>
				</button>
			</div>
		</header>
	);
}
