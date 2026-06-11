"use client";

import { FeedbackPopover } from "@fe/dashboard/components/feedback-popover";
import { mainNavigation, userNavigation } from "@fe/dashboard/constants";
import { useUIStore } from "@fe/dashboard/store/use-ui-store";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserDropdown } from "./user-dropdown";

export const PageHeader = () => {
	const pathname = usePathname();
	const { isSidebarCollapsed, toggleSidebarCollapse } = useUIStore();

	const activeItem = [...mainNavigation, ...userNavigation].find((item) => {
		if (item.path === "/") return pathname === "/";
		return pathname.startsWith(item.path);
	});

	const displayLabel = activeItem
		? activeItem.label
		: pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "Dashboard";

	const displayIcon = activeItem?.iconName || "inbox";

	return (
		<div className="sticky top-0 z-10 flex h-11 items-center justify-between border-stroke-soft-100 border-b pr-3 pl-2.5 dark:border-stroke-soft-100/40 shrink-0">
			{/* Left Side: Inline Sidebar Toggle & Page Title */}
			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={toggleSidebarCollapse}
					title="Toggle Sidebar (Cmd+B)"
					className="flex h-7 w-7 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/5"
				>
					<Icon
						name="sidebar-left"
						className="h-4 w-4 transition-transform duration-200"
						style={{
							transform: isSidebarCollapsed ? "rotate(180deg)" : "rotate(0deg)",
						}}
					/>
				</button>

				<div className="flex items-center gap-2">
					<Icon name={displayIcon} className="h-4 w-4 text-text-sub-600" />
					<span className="font-semibold text-[13px] text-text-strong-950 capitalize">
						{displayLabel}
					</span>
				</div>
			</div>

			{/* Right Side: Global Search, Settings Gear & Dropdowns */}
			<div className="flex items-center gap-2">
				{/* Search Input */}
				<div className="relative w-44 sm:w-56 md:w-64">
					<Input.Root size="xsmall" className="rounded-lg bg-bg-weak-50/50 border-none dark:bg-white/5">
						<Input.Wrapper>
							<Input.Icon as={Icon} name="search" size="xsmall" className="text-text-soft-400" />
							<Input.Input
								placeholder="Search..."
								className="bg-transparent border-none placeholder-text-soft-400 text-xs py-0.5"
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>

				{/* Settings Button */}
				<Link
					href="/settings"
					title="Settings"
					className="flex h-8 w-8 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/5"
				>
					<Icon name="settings" className="h-4 w-4" />
				</Link>

				<div className="h-4 w-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40 mx-0.5" />

				<FeedbackPopover />
				<UserDropdown />
			</div>
		</div>
	);
};
