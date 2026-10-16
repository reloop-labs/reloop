import { cn } from "@reloop/ui/cn";
import * as Tooltip from "@reloop/ui/tooltip";
import { LifeBuoy } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSupportUnread } from "#/features/dashboard/hooks/use-support-unread";
import { AnimatedSidebarToggleIcon } from "#/features/dashboard/sidebar/animated-sidebar-toggle-icon";
import { usePlayAnimationOnHover } from "#/features/dashboard/sidebar/use-play-animation-on-hover";
import { useSidebarCollapse } from "#/features/dashboard/sidebar/use-sidebar-collapse";
import { useUIStore } from "#/store/use-ui-store";
import {
	OrganizationSwitcher,
	OrganizationSwitcherSkeleton,
} from "./organization-switcher";
import { useActiveOrganization } from "./use-active-organization";
import { UserDropdown, UserDropdownSkeleton } from "./user-dropdown";

function HamburgerIcon({ open }: { open: boolean }) {
	return (
		<svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-4 w-4">
			<path
				d="M2.5 4h11"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				className={cn(
					"origin-center transition-transform duration-200",
					open && "translate-y-[4px] rotate-45",
				)}
			/>
			<path
				d="M2.5 8h11"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				className={cn(
					"origin-center transition-opacity duration-200",
					open && "opacity-0",
				)}
			/>
			<path
				d="M2.5 12h11"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				className={cn(
					"origin-center transition-transform duration-200",
					open && "-translate-y-[4px] -rotate-45",
				)}
			/>
		</svg>
	);
}

/**
 * `collapsedFromDom`: take the arrow direction from `<html data-sidebar-collapsed>`
 * instead of store state, so SSR'd loading chrome hydrates without a mismatch.
 */
function SidebarToggleButton({
	collapsedFromDom = false,
}: {
	collapsedFromDom?: boolean;
}) {
	const { isCollapsed, toggle } = useSidebarCollapse();
	const isMobileNavOpen = useUIStore((s) => s.isMobileNavOpen);
	const toggleMobileNav = useUIStore((s) => s.toggleMobileNav);
	const {
		isAnimating,
		onPointerEnter,
		onPointerLeave,
		onAnimationStart,
		onAnimationEnd,
	} = usePlayAnimationOnHover(500);

	const btnClass = cn(
		"group flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-sub-600 transition-colors",
		"hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/5",
	);

	return (
		<>
			<button
				type="button"
				onClick={toggleMobileNav}
				title="Open menu"
				aria-label={isMobileNavOpen ? "Close menu" : "Open menu"}
				aria-expanded={isMobileNavOpen}
				className={cn(btnClass, "lg:hidden")}
			>
				<HamburgerIcon open={isMobileNavOpen} />
			</button>
			<Tooltip.Root delayDuration={300}>
				<Tooltip.Trigger asChild>
					<button
						aria-label="Toggle sidebar"
						type="button"
						onClick={toggle}
						data-animating={isAnimating || undefined}
						onPointerEnter={onPointerEnter}
						onPointerLeave={onPointerLeave}
						onAnimationStart={onAnimationStart}
						onAnimationEnd={onAnimationEnd}
						className={cn(btnClass, "hidden lg:flex")}
					>
						<AnimatedSidebarToggleIcon
							className={cn(
								"h-4 w-4",
								collapsedFromDom
									? "sidebar-collapsed:rotate-180"
									: isCollapsed && "rotate-180",
							)}
						/>
					</button>
				</Tooltip.Trigger>
				<Tooltip.Content
					side="bottom"
					align="start"
					variant="light"
					size="small"
					showArrow={false}
					shortcut={["mod", "B"]}
				>
					Toggle sidebar
				</Tooltip.Content>
			</Tooltip.Root>
		</>
	);
}

function HelpLink({ unreadCount = 0 }: { unreadCount?: number }) {
	const pathname = usePathname() ?? "/";
	const pathWithoutSlug = pathname.replace(/^\/dashboard/, "") || "/";
	const isHelpActive = pathWithoutSlug === "/help";
	const hasUnread = unreadCount > 0 && !isHelpActive;
	const unreadLabel = unreadCount > 9 ? "9+" : String(unreadCount);

	return (
		<Link
			href="/help"
			title={
				hasUnread ? `Help & support (${unreadCount} unread)` : "Help & support"
			}
			aria-label={
				hasUnread
					? `Go to Help & support, ${unreadCount} unread ${unreadCount === 1 ? "message" : "messages"}`
					: "Go to Help & support"
			}
			aria-current={isHelpActive ? "page" : undefined}
			className={cn(
				"flex h-7 items-center gap-1.5 rounded-full px-2.5 font-medium text-[12px] text-text-sub-600 transition-colors",
				"hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/5 dark:hover:text-white",
				isHelpActive &&
					"bg-bg-weak-50 text-text-strong-950 dark:bg-white/5 dark:text-white",
				hasUnread &&
					"bg-bg-weak-50 text-text-strong-950 dark:bg-white/5 dark:text-white",
			)}
		>
			<span className="relative flex">
				<LifeBuoy className="h-4 w-4" />
				{hasUnread ? (
					<span
						aria-hidden
						className="absolute -top-0.5 -right-0.5 flex h-2 w-2"
					>
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error-base opacity-75" />
						<span className="relative inline-flex h-2 w-2 rounded-full bg-error-base ring-2 ring-bg-white-0 dark:ring-black" />
					</span>
				) : null}
			</span>
			<span className="hidden sm:inline">Help</span>
			{hasUnread ? (
				<span
					aria-hidden
					className="flex h-4 min-w-4 items-center justify-center rounded-full bg-error-base px-1 font-semibold text-[10px] text-white tabular-nums"
				>
					{unreadLabel}
				</span>
			) : null}
		</Link>
	);
}

const HEADER_CLASS =
	"sticky top-0 z-20 flex h-11 shrink-0 items-center justify-between border-stroke-soft-100 border-b bg-bg-white-0 pr-3 pl-3 dark:border-stroke-soft-100/40 dark:bg-black";

/**
 * Header for loading chrome: same frame and controls as `PageHeader`, with
 * skeletons where session / org data goes. Uses no suspending hooks.
 */
export function PageHeaderSkeleton() {
	return (
		<div className={HEADER_CLASS}>
			<div className="flex items-center gap-1">
				<SidebarToggleButton collapsedFromDom />
				<OrganizationSwitcherSkeleton />
			</div>
			<div className="flex items-center gap-1.5">
				<HelpLink />
				<UserDropdownSkeleton />
			</div>
		</div>
	);
}

/**
 * Top bar for the main content panel: workspace switcher + global actions.
 * Matches the Next dashboard PageHeader chrome (without settings gear).
 */
export function PageHeader() {
	const { user, organizations, activeOrganization, onOrganizationChange } =
		useActiveOrganization();
	const { unreadCount } = useSupportUnread();

	return (
		<div className={HEADER_CLASS}>
			<div className="flex items-center gap-1">
				<SidebarToggleButton />
				<OrganizationSwitcher
					organizations={organizations}
					activeOrganization={activeOrganization}
					onOrganizationChange={onOrganizationChange}
					side="bottom"
				/>
			</div>

			<div className="flex items-center gap-1.5">
				<HelpLink unreadCount={unreadCount} />
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
