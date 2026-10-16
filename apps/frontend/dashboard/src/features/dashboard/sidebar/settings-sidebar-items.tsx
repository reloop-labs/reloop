import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ShortcutHint } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { useOrgPermissions } from "#/features/settings/use-org-permissions";
import { filterSettingsNavigation, settingsNavigation } from "../navigation";
import {
	readSettingsNavPerms,
	writeSettingsNavPerms,
} from "./settings-nav-cache";
import { SidebarNavIcon } from "./sidebar-nav-icon";
import { SidebarNavButton, SidebarNavLink } from "./sidebar-nav-link";
import { SidebarSectionHeader } from "./sidebar-section-header";
import { useSidebarHoverBox } from "./use-sidebar-hover-box";

export function SettingsSidebarItems({
	isCollapsed = false,
	onCloseSettings,
}: {
	isCollapsed?: boolean;
	onCloseSettings?: () => void;
}) {
	const [hoveredEl, setHoveredEl] = useState<HTMLElement | undefined>(
		undefined,
	);
	const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);

	const backNavRef = useRef<HTMLButtonElement>(null);
	const itemRefs = useRef<HTMLAnchorElement[]>([]);

	const pathname = usePathname();
	const pathWithoutSlug = pathname.replace(/^\/dashboard/, "") || "/";

	const { isSettled, isOrgAdmin, canManageTeam, canManageBilling } =
		useOrgPermissions();
	// Until role + billing resolve, reuse the last-known flags so admin rows
	// don't pop in (and shift everything below) after the sidebar paints.
	const [cachedPerms] = useState(readSettingsNavPerms);
	const perms =
		!isSettled && cachedPerms
			? cachedPerms
			: { isOrgAdmin, canManageTeam, canManageBilling };

	useEffect(() => {
		if (isSettled) {
			writeSettingsNavPerms({ isOrgAdmin, canManageTeam, canManageBilling });
		}
	}, [isSettled, isOrgAdmin, canManageTeam, canManageBilling]);

	// Members: hide Usage, Billing, Teams, Workspace (profile menu uses the same filter).
	const filteredSettingsNavigation = useMemo(
		() =>
			filterSettingsNavigation(settingsNavigation, {
				isOrgAdmin: perms.isOrgAdmin,
				canManageTeam: perms.canManageTeam,
				canManageBilling: perms.canManageBilling,
			}),
		[perms.isOrgAdmin, perms.canManageTeam, perms.canManageBilling],
	);
	const flatItems = useMemo(() => {
		const items: (typeof settingsNavigation)[number]["items"][number][] = [];
		for (const section of filteredSettingsNavigation) {
			items.push(...section.items);
		}
		return items;
	}, [filteredSettingsNavigation]);

	const activeIndex = flatItems.findIndex((item) => {
		if (item.path === "/settings") return pathWithoutSlug === "/settings";
		return pathWithoutSlug.startsWith(item.path);
	});

	const activeEl =
		activeIndex !== -1 ? itemRefs.current[activeIndex] : undefined;
	const currentEl = hoveredEl ?? activeEl;
	const hoverBox = useSidebarHoverBox(currentEl, containerEl, isCollapsed);

	let globalIndex = 0;

	return (
		<div
			ref={setContainerEl}
			className={cn(
				"relative flex w-full flex-col",
				isCollapsed && "items-start",
			)}
			onPointerLeave={() => setHoveredEl(undefined)}
		>
			{/* Back to main sidebar, does not change the page */}
			<SidebarNavButton
				ref={backNavRef}
				onPointerEnter={() => setHoveredEl(backNavRef.current ?? undefined)}
				onClick={() => onCloseSettings?.()}
				className={cn(
					"relative z-10 mb-4 flex h-8 items-center rounded-lg transition-all duration-150 ease-out",
					isCollapsed
						? "h-8 w-8 justify-start overflow-hidden px-2"
						: "w-full justify-start gap-2.5 px-2.5",
				)}
				title={isCollapsed ? "Back to app" : undefined}
			>
				<span className="flex min-w-0 items-center gap-2.5">
					<Icon
						name="arrow-left"
						className="h-4 w-4 shrink-0 text-text-sub-600 opacity-70 transition-all duration-200 group-hover:-translate-x-0.5 group-hover:text-text-strong-950 group-hover:opacity-100"
					/>
					<span
						aria-hidden={isCollapsed || undefined}
						className={cn(
							"whitespace-nowrap font-medium text-[13px] text-text-sub-600 transition-[color,opacity] duration-150 ease-out group-hover:text-text-strong-950",
							isCollapsed && "opacity-0",
						)}
					>
						Back to app
					</span>
				</span>
			</SidebarNavButton>

			{filteredSettingsNavigation.map((section, sectionIdx) => (
				<div
					key={section.section}
					className={cn(
						"flex flex-col",
						isCollapsed ? "items-start" : "w-full",
					)}
				>
					<SidebarSectionHeader
						label={section.section}
						isCollapsed={isCollapsed}
						isFirst={sectionIdx === 0}
					/>

					{section.items.map((item) => {
						const currentIdx = globalIndex++;
						const isItemActive =
							item.path === "/settings"
								? pathWithoutSlug === "/settings"
								: pathWithoutSlug.startsWith(item.path);

						return (
							<SidebarNavLink
								href={item.path}
								key={item.path}
								ref={(el) => {
									if (el) itemRefs.current[currentIdx] = el;
								}}
								onPointerEnter={() =>
									setHoveredEl(itemRefs.current[currentIdx])
								}
								className={cn(
									"relative z-10 flex h-8 items-center rounded-lg transition-all duration-150 ease-out",
									isCollapsed
										? "h-8 w-8 justify-start overflow-hidden px-2"
										: "w-full justify-start gap-2.5 px-2.5",
								)}
								title={
									isCollapsed
										? item.shortcut
											? `${item.label} (${item.shortcut.label})`
											: item.label
										: undefined
								}
							>
								<span
									className={cn(
										"flex min-w-0 items-center",
										isCollapsed
											? "justify-center"
											: "flex-1 justify-between gap-2.5",
									)}
								>
									<span className="flex min-w-0 items-center gap-2.5">
										<SidebarNavIcon
											name={item.iconName}
											isActive={isItemActive}
										/>
										<span
											aria-hidden={isCollapsed || undefined}
											className={cn(
												"truncate font-medium text-[13px] transition-[color,opacity] duration-150 ease-out",
												isCollapsed && "opacity-0",
												isItemActive
													? "text-text-strong-950"
													: "text-text-sub-600 group-hover:text-text-strong-950",
											)}
										>
											{item.label}
										</span>
									</span>
									{!isCollapsed && item.shortcut && (
										<ShortcutHint>{item.shortcut.label}</ShortcutHint>
									)}
								</span>
							</SidebarNavLink>
						);
					})}
				</div>
			))}

			<AnimatedHoverBackground
				box={hoverBox}
				className="!bg-neutral-alpha-10"
			/>
		</div>
	);
}
