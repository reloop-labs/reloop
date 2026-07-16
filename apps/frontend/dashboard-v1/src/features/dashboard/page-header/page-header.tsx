import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Link, useRouterState } from "@tanstack/react-router";
import { SETTINGS_ADMIN_HOME } from "../navigation";
import { OrganizationSwitcher } from "./organization-switcher";
import { useActiveOrganization } from "./use-active-organization";
import { UserDropdown } from "./user-dropdown";

/**
 * Top bar for the main content panel: workspace switcher + global actions.
 * Matches the Next dashboard PageHeader chrome.
 */
export function PageHeader() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const pathWithoutSlug = pathname.replace(/^\/dashboard/, "") || "/";
	const {
		user,
		organizations,
		activeOrganization,
		onOrganizationChange,
	} = useActiveOrganization();

	// Until org-role permissions land, send everyone to the admin settings home.
	const settingsHome = SETTINGS_ADMIN_HOME;

	return (
		<div className="sticky top-0 z-10 flex h-11 shrink-0 items-center justify-between border-stroke-soft-100 border-b pr-3 pl-3 dark:border-stroke-soft-100/40">
			<div className="flex items-center gap-1">
				<OrganizationSwitcher
					organizations={organizations}
					activeOrganization={activeOrganization}
					onOrganizationChange={onOrganizationChange}
					side="bottom"
				/>
			</div>

			<div className="flex items-center gap-2">
				<Link
					to={settingsHome}
					search={{ from: pathWithoutSlug }}
					title="Settings"
					className="flex h-8 w-8 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/5"
				>
					<Icon name="gear" className="h-4 w-4" />
				</Link>

				<div className="mx-0.5 h-4 w-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />

				{/* AI / Support panels not ported yet — chrome matches Next dashboard. */}
				<Button.Root
					variant="neutral"
					mode="ghost"
					size="xxsmall"
					className={cn("gap-1.5 text-text-sub-600 hover:text-text-strong-950")}
					type="button"
					title="Ask AI (coming soon)"
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
						"relative gap-1.5 text-text-sub-600 hover:text-text-strong-950",
					)}
					type="button"
					title="Support (coming soon)"
				>
					<Icon name="question" className="h-4 w-4 text-text-sub-600" />
					<span>Support</span>
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
