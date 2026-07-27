import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Link, useRouterState } from "#/lib/navigation";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { settingsNavigation } from "../navigation";
import { SidebarNavIcon } from "./sidebar-nav-icon";

export function SettingsSidebarItems({
	isCollapsed = false,
}: {
	isCollapsed?: boolean;
}) {
	const [hoveredEl, setHoveredEl] = useState<HTMLAnchorElement | undefined>(
		undefined,
	);
	const [rect, setRect] = useState<DOMRect | undefined>(undefined);

	const backNavRef = useRef<HTMLAnchorElement>(null);
	const itemRefs = useRef<HTMLAnchorElement[]>([]);

	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const search = useRouterState({ select: (s) => s.location.search });
	const pathWithoutSlug = pathname.replace(/^\/dashboard/, "") || "/";

	// `from` is preserved when opening settings from the main app.
	const fromParam =
		typeof (search as { from?: unknown }).from === "string"
			? (search as { from: string }).from
			: null;
	const backHref = fromParam || "/";

	// Until org permissions land, show the full settings tree (admin view).
	const filteredSettingsNavigation = useMemo(() => settingsNavigation, []);

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

	useLayoutEffect(() => {
		if (currentEl) {
			setRect(currentEl.getBoundingClientRect());
		} else {
			setRect(undefined);
		}
	}, [currentEl]);

	let globalIndex = 0;

	return (
		<div
			className={cn("relative flex flex-col", isCollapsed && "items-center")}
			onPointerLeave={() => setHoveredEl(undefined)}
		>
			{/* Back to app */}
			<Link
				to={backHref}
				ref={backNavRef}
				onPointerEnter={() => setHoveredEl(backNavRef.current ?? undefined)}
				className={cn(
					"group relative z-10 mb-4 flex h-8 items-center rounded-lg transition-all",
					isCollapsed
						? "h-8 w-8 justify-center px-0"
						: "w-full justify-start gap-2.5 px-2.5",
				)}
				title={isCollapsed ? "Back to app" : undefined}
			>
				<span
					className={cn(
						"flex min-w-0 items-center",
						isCollapsed ? "" : "gap-2.5",
					)}
				>
					<Icon
						name="arrow-left"
						className="h-4 w-4 shrink-0 text-text-sub-600 opacity-70 transition-all duration-200 group-hover:text-text-strong-950 group-hover:opacity-100 group-hover:-translate-x-0.5"
					/>
					{!isCollapsed && (
						<span className="font-medium text-[13px] text-text-sub-600 transition-colors group-hover:text-text-strong-950">
							Back to app
						</span>
					)}
				</span>
			</Link>

			{filteredSettingsNavigation.map((section, sectionIdx) => (
				<div key={section.section} className="flex flex-col">
					{isCollapsed ? (
						sectionIdx > 0 && (
							<div className="my-2 h-[1px] w-6 self-center bg-stroke-soft-200" />
						)
					) : (
						<div
							className={cn(
								"px-2.5 pt-4 pb-1.5 font-semibold text-[10px] text-text-soft-400 uppercase tracking-[0.06em]",
								sectionIdx === 0 && "pt-1.5",
							)}
						>
							{section.section}
						</div>
					)}

					{section.items.map((item) => {
						const currentIdx = globalIndex++;
						const isItemActive =
							item.path === "/settings"
								? pathWithoutSlug === "/settings"
								: pathWithoutSlug.startsWith(item.path);

						return (
							<Link
								key={item.path}
								to={item.path}
								search={fromParam ? { from: fromParam } : undefined}
								ref={(el) => {
									if (el) itemRefs.current[currentIdx] = el;
								}}
								onPointerEnter={() =>
									setHoveredEl(itemRefs.current[currentIdx])
								}
								className={cn(
									"group relative z-10 flex h-8 items-center rounded-lg transition-all",
									isCollapsed
										? "h-8 w-8 justify-center px-0"
										: "w-full justify-start gap-2.5 px-2.5",
								)}
								title={isCollapsed ? item.label : undefined}
							>
								<span
									className={cn(
										"flex min-w-0 items-center",
										isCollapsed ? "" : "gap-2.5",
									)}
								>
									<SidebarNavIcon
										name={item.iconName}
										isActive={isItemActive}
									/>
									{!isCollapsed && (
										<span
											className={cn(
												"font-medium text-[13px] transition-colors",
												isItemActive
													? "text-text-strong-950"
													: "text-text-sub-600 group-hover:text-text-strong-950",
											)}
										>
											{item.label}
										</span>
									)}
								</span>
							</Link>
						);
					})}
				</div>
			))}

			<AnimatedHoverBackground
				rect={rect}
				tabElement={currentEl}
				className="!bg-neutral-alpha-10"
			/>
		</div>
	);
}
