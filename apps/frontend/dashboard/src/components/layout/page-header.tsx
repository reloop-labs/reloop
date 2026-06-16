"use client";

import { mainNavigation, userNavigation } from "@fe/dashboard/constants";
import { useUIStore } from "@fe/dashboard/store/use-ui-store";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserDropdown } from "./user-dropdown";

export const PageHeader = () => {
	const pathname = usePathname();
	const {
		isAiPanelOpen,
		setIsAiPanelOpen,
		aiPanelActiveTab,
		setAiPanelActiveTab,
	} = useUIStore();

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

				<Button.Root
					variant="neutral"
					mode="ghost"
					size="xxsmall"
					className={cn(
						"gap-1.5 text-text-sub-600 hover:text-text-strong-950",
						isAiPanelOpen &&
							aiPanelActiveTab === "ai" &&
							"bg-bg-weak-50 text-text-strong-950",
					)}
					onClick={() => {
						if (!isAiPanelOpen) {
							setAiPanelActiveTab("ai");
							setIsAiPanelOpen(true);
						} else if (aiPanelActiveTab === "ai") {
							setIsAiPanelOpen(false);
						} else {
							setAiPanelActiveTab("ai");
						}
					}}
				>
					<Icon
						name="sparkling"
						className="h-4 w-4 text-purple-600 dark:text-purple-400"
					/>
					<span className="bg-gradient-to-r from-[#A855F7] to-[#EC4899] bg-clip-text font-medium text-transparent">
						Ask AI
					</span>
				</Button.Root>

				<Button.Root
					variant="neutral"
					mode="ghost"
					size="xxsmall"
					className={cn(
						"gap-1.5 text-text-sub-600 hover:text-text-strong-950",
						isAiPanelOpen &&
							aiPanelActiveTab === "support" &&
							"bg-bg-weak-50 text-text-strong-950",
					)}
					onClick={() => {
						if (!isAiPanelOpen) {
							setAiPanelActiveTab("support");
							setIsAiPanelOpen(true);
						} else if (aiPanelActiveTab === "support") {
							setIsAiPanelOpen(false);
						} else {
							setAiPanelActiveTab("support");
						}
					}}
				>
					<Icon name="question" className="h-4 w-4 text-text-sub-600" />
					<span>Support</span>
				</Button.Root>

				<UserDropdown />
			</div>
		</div>
	);
};
