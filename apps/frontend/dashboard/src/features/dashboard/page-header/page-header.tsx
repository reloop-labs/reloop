import { cn } from "@reloop/ui/cn";
import { AnimatedSidebarToggleIcon } from "#/features/dashboard/sidebar/animated-sidebar-toggle-icon";
import { usePlayAnimationOnHover } from "#/features/dashboard/sidebar/use-play-animation-on-hover";
import { useSidebarCollapse } from "#/features/dashboard/sidebar/use-sidebar-collapse";
import { useUIStore } from "#/store/use-ui-store";
import { OrganizationSwitcher } from "./organization-switcher";
import { useActiveOrganization } from "./use-active-organization";
import { UserDropdown } from "./user-dropdown";

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

function SidebarToggleButton() {
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
			<button
				type="button"
				onClick={toggle}
				title="Toggle Sidebar (⌘B)"
				data-animating={isAnimating || undefined}
				onPointerEnter={onPointerEnter}
				onPointerLeave={onPointerLeave}
				onAnimationStart={onAnimationStart}
				onAnimationEnd={onAnimationEnd}
				className={cn(btnClass, "hidden lg:flex")}
			>
				<AnimatedSidebarToggleIcon
					className={cn("h-4 w-4", isCollapsed && "rotate-180")}
				/>
			</button>
		</>
	);
}

/**
 * Top bar for the main content panel: workspace switcher + global actions.
 * Matches the Next dashboard PageHeader chrome (without settings gear).
 */
export function PageHeader() {
	const { user, organizations, activeOrganization, onOrganizationChange } =
		useActiveOrganization();

	return (
		<div className="sticky top-0 flex h-11 shrink-0 items-center justify-between border-stroke-soft-100 border-b bg-bg-white-0 pr-3 pl-3 dark:border-stroke-soft-100/40 dark:bg-black">
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
