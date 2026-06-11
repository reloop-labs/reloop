"use client";

import { FeedbackPopover } from "@fe/dashboard/components/feedback-popover";
import { mainNavigation, userNavigation } from "@fe/dashboard/constants";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserDropdown } from "./user-dropdown";

export const PageHeader = () => {
	const pathname = usePathname();

	const activeItem = [...mainNavigation, ...userNavigation].find((item) => {
		if (item.path === "/") return pathname === "/";
		return pathname.startsWith(item.path);
	});

	const displayLabel = activeItem
		? activeItem.label
		: pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") ||
			"Dashboard";

	const displayIcon = activeItem?.iconName || "inbox";

	return (
		<div className="sticky top-0 z-10 flex h-11 shrink-0 items-center justify-between border-stroke-soft-100 border-b pr-3 pl-3 dark:border-stroke-soft-100/40">
			{/* Left Side: Page Title */}
			<div className="flex items-center gap-3">
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

				{/* Settings Button */}
				<Link
					href="/settings"
					title="Settings"
					className="flex h-8 w-8 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/5"
				>
					<Icon name="settings" className="h-4 w-4" />
				</Link>

				<div className="mx-0.5 h-4 w-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />

				<FeedbackPopover />
				<UserDropdown />
			</div>
		</div>
	);
};
