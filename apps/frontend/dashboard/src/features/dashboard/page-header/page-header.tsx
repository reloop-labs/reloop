import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useSupportUnread } from "#/features/dashboard/hooks/use-support-unread";
import { AnimatedSidebarToggleIcon } from "#/features/dashboard/sidebar/animated-sidebar-toggle-icon";
import { usePlayAnimationOnHover } from "#/features/dashboard/sidebar/use-play-animation-on-hover";
import { useSidebarCollapse } from "#/features/dashboard/sidebar/use-sidebar-collapse";
import { useUIStore } from "#/store/use-ui-store";
import { CopyPromptButton } from "./copy-prompt-button";
import { OrganizationSwitcher } from "./organization-switcher";
import { useActiveOrganization } from "./use-active-organization";
import { UserDropdown } from "./user-dropdown";

function SidebarToggleButton() {
	const { isCollapsed, toggle } = useSidebarCollapse();
	const {
		isAnimating,
		onPointerEnter,
		onPointerLeave,
		onAnimationStart,
		onAnimationEnd,
	} = usePlayAnimationOnHover(500);

	return (
		<button
			type="button"
			onClick={toggle}
			title="Toggle Sidebar (⌘B)"
			data-animating={isAnimating || undefined}
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			onAnimationStart={onAnimationStart}
			onAnimationEnd={onAnimationEnd}
			className={cn(
				"group flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-sub-600 transition-colors",
				"hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/5",
			)}
		>
			<AnimatedSidebarToggleIcon
				className={cn("h-4 w-4", isCollapsed && "rotate-180")}
			/>
		</button>
	);
}

/**
 * Top bar for the main content panel: workspace switcher + global actions.
 * Matches the Next dashboard PageHeader chrome (without settings gear).
 *
 * Ask AI entry is hidden until the assistant API is wired up.
 * Copy prompt is always available for Claude / ChatGPT / Cursor / etc.
 */
export function PageHeader() {
	const { user, organizations, activeOrganization, onOrganizationChange } =
		useActiveOrganization();
	const {
		isAiPanelOpen,
		setIsAiPanelOpen,
		aiPanelActiveTab,
		setAiPanelActiveTab,
	} = useUIStore();
	const { unreadCount } = useSupportUnread();

	const supportOpen = isAiPanelOpen && aiPanelActiveTab === "support";

	return (
		<div className="sticky top-0 z-10 flex h-11 shrink-0 items-center justify-between border-stroke-soft-100 border-b pr-3 pl-3 dark:border-stroke-soft-100/40">
			<div className="flex items-center gap-1">
				<SidebarToggleButton />
				<OrganizationSwitcher
					organizations={organizations}
					activeOrganization={activeOrganization}
					onOrganizationChange={onOrganizationChange}
					side="bottom"
				/>
			</div>

			<div className="flex items-center gap-2">
				<CopyPromptButton />

				<Button.Root
					variant="neutral"
					mode="ghost"
					size="xxsmall"
					className={cn(
						"relative gap-1.5 text-text-sub-600 hover:text-text-strong-950",
						supportOpen && "bg-bg-weak-50 text-text-strong-950",
					)}
					type="button"
					title="Support"
					onClick={() => {
						if (!isAiPanelOpen) {
							setAiPanelActiveTab("support");
							setIsAiPanelOpen(true);
						} else if (aiPanelActiveTab === "support") {
							setIsAiPanelOpen(false);
						} else {
							setAiPanelActiveTab("support");
							setIsAiPanelOpen(true);
						}
					}}
				>
					<Icon name="question" className="h-4 w-4 text-text-sub-600" />
					<span>Support</span>
					{unreadCount > 0 ? (
						<span className="-top-0.5 -right-0.5 absolute flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 font-semibold text-[10px] text-white tabular-nums">
							{unreadCount > 99 ? "99+" : unreadCount}
						</span>
					) : null}
				</Button.Root>

				<UserDropdown
					user={
						user
							? {
									name: user.name,
									email: user.email,
									image: user.image,
								}
							: null
					}
				/>
			</div>
		</div>
	);
}
