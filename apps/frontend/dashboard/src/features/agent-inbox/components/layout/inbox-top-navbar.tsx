"use client";

import { cn } from "@reloop/ui/cn";
import { Search } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useInboxSidebar } from "#/features/agent-inbox/components/sidebar/inbox-sidebar-context";
import type { AgentMailbox } from "#/features/agent-inbox/types";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { AnimatedSidebarToggleIcon } from "#/features/dashboard/sidebar/animated-sidebar-toggle-icon";

export function InboxTopNavbar({
	mailbox: _mailbox,
}: {
	mailbox: AgentMailbox;
}) {
	const { collapsed, toggleSidebar } = useInboxSidebar();
	const [searchQuery] = useQueryState("q", parseAsString.withDefault(""));
	const activeSearch = searchQuery.trim();

	const openSearch = () => {
		window.dispatchEvent(new CustomEvent("inbox:open-search"));
	};

	return (
		<header className="flex h-11 shrink-0 items-center gap-2 border-stroke-soft-100 border-b bg-bg-white-0 px-3 dark:border-stroke-soft-100/40 dark:bg-black">
			<button
				type="button"
				onClick={toggleSidebar}
				title="Toggle sidebar (⌘B)"
				className={cn(
					"group flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-sub-600 transition-colors",
					"hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/5",
				)}
			>
				<AnimatedSidebarToggleIcon
					className={cn("h-4 w-4", collapsed && "rotate-180")}
				/>
			</button>

			<button
				type="button"
				onClick={openSearch}
				className={cn(
					"flex h-8 w-full min-w-0 max-w-[240px] items-center gap-2 rounded-lg px-2.5 text-left",
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
		</header>
	);
}
