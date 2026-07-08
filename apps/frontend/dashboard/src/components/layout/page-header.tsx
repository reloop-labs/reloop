"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { useUIStore } from "@fe/dashboard/store/use-ui-store";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { OrganizationSwitcher } from "./organization-switcher";
import { UserDropdown } from "./user-dropdown";

export const PageHeader = () => {
	const {
		isAiPanelOpen,
		setIsAiPanelOpen,
		aiPanelActiveTab,
		setAiPanelActiveTab,
	} = useUIStore();
	const { organizations, activeOrganization, onOrganizationChange } =
		useUserOrganization();

	return (
		<div className="sticky top-0 z-10 flex h-11 shrink-0 items-center justify-between border-stroke-soft-100 border-b pr-3 pl-3 dark:border-stroke-soft-100/40">
			{/* Left Side: Organization Switcher */}
			<div className="flex items-center gap-1">
				<OrganizationSwitcher
					organizations={organizations}
					activeOrganization={activeOrganization}
					onOrganizationChange={onOrganizationChange}
					side="bottom"
				/>
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
