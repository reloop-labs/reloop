"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import {
	AnimatePresence,
	motion,
	type PanInfo,
	useReducedMotion,
} from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { useSignOut } from "#/features/auth/session-query";
import {
	filterSettingsNavigation,
	mainNavigation,
	settingsNavigation,
} from "#/features/dashboard/navigation";
import { ThemeToggle } from "#/features/dashboard/page-header/theme-toggle";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { UserAvatar } from "#/features/dashboard/page-header/user-avatar";
import { SidebarNavIcon } from "#/features/dashboard/sidebar/sidebar-nav-icon";
import { useOrgPermissions } from "#/features/settings/use-org-permissions";

const SPRING_TRANSITION = {
	type: "spring",
	damping: 30,
	stiffness: 320,
	mass: 0.8,
} as const;

export function MobileSidebarSheet({
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	onClose: () => void;
}) {
	const pathname = usePathname();
	const pathWithoutSlug = pathname.replace(/^\/dashboard/, "") || "/";
	const shouldReduceMotion = useReducedMotion();
	const { user, activeOrganization } = useActiveOrganization();
	const signOut = useSignOut();
	const { isOrgAdmin, canManageTeam } = useOrgPermissions();

	const [expandedSections, setExpandedSections] = React.useState<
		Record<string, boolean>
	>({
		"/contacts": true,
	});
	const [openSettingsGroup, setOpenSettingsGroup] = React.useState(false);

	// Prevent background scroll when mobile sheet is open
	React.useEffect(() => {
		if (isOpen) {
			const originalOverflow = document.body.style.overflow;
			document.body.style.overflow = "hidden";
			return () => {
				document.body.style.overflow = originalOverflow;
			};
		}
	}, [isOpen]);

	const toggleExpand = (path: string) => {
		setExpandedSections((prev) => ({ ...prev, [path]: !prev[path] }));
	};

	const filteredSettings = React.useMemo(
		() =>
			filterSettingsNavigation(settingsNavigation, {
				isOrgAdmin,
				canManageTeam,
			}),
		[isOrgAdmin, canManageTeam],
	);

	const handleDragEnd = (
		_event: MouseEvent | TouchEvent | PointerEvent,
		info: PanInfo,
	) => {
		if (info.offset.y > 100 || info.velocity.y > 400) {
			onClose();
		}
	};

	const handleOpenCommandMenu = () => {
		onClose();
		// Trigger the global command menu via keyboard event
		window.dispatchEvent(
			new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }),
		);
	};

	const handleSignOut = async () => {
		onClose();
		await signOut();
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						key="mobile-sheet-backdrop"
						className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm lg:hidden"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						onClick={onClose}
					/>

					{/* Bottom Sheet Modal */}
					<motion.div
						key="mobile-sheet-content"
						role="dialog"
						aria-modal="true"
						aria-label="Mobile Navigation Menu"
						drag="y"
						dragConstraints={{ top: 0, bottom: 0 }}
						dragElastic={{ top: 0, bottom: 0.6 }}
						onDragEnd={handleDragEnd}
						initial={shouldReduceMotion ? { opacity: 0, y: 0 } : { y: "100%" }}
						animate={shouldReduceMotion ? { opacity: 1, y: 0 } : { y: 0 }}
						exit={shouldReduceMotion ? { opacity: 0, y: 0 } : { y: "100%" }}
						transition={
							shouldReduceMotion ? { duration: 0.15 } : SPRING_TRANSITION
						}
						className={cn(
							"fixed inset-x-0 bottom-0 z-[100] flex max-h-[90dvh] flex-col",
							"rounded-t-[28px] border-stroke-soft-200 border-t bg-bg-white-0",
							"shadow-[0_-12px_48px_rgba(0,0,0,0.2)] lg:hidden",
							"dark:border-white/10 dark:bg-[#121213] dark:shadow-[0_-12px_48px_rgba(0,0,0,0.7)]",
						)}
					>
						{/* Drag handle */}
						<div className="flex w-full cursor-grab items-center justify-center pt-3 pb-1 active:cursor-grabbing">
							<div className="h-1.5 w-12 rounded-full bg-stroke-soft-300 dark:bg-white/20" />
						</div>

						{/* Sheet Header */}
						<div className="flex shrink-0 items-center justify-between border-stroke-soft-100 border-b px-5 py-3 dark:border-white/[0.08]">
							<div className="flex items-center gap-2.5">
								<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-bg-weak-50 dark:bg-white/[0.06]">
									<Logo className="h-6 w-6 shrink-0" />
								</div>
								<div className="flex flex-col">
									<div className="flex items-center gap-1.5">
										<span className="font-semibold text-[15px] text-text-strong-950 dark:text-white">
											Reloop
										</span>
										<span className="inline-flex items-center rounded-full bg-bg-weak-50 px-1.5 py-0.5 font-bold text-[8px] text-text-sub-600 uppercase tracking-wide dark:bg-white/[0.08] dark:text-white/70">
											Beta
										</span>
									</div>
									{activeOrganization && (
										<span className="truncate font-medium text-[11px] text-text-soft-400 dark:text-white/40">
											{activeOrganization.name}
										</span>
									)}
								</div>
							</div>

							<div className="flex items-center gap-2">
								<ThemeToggle />
								<button
									type="button"
									onClick={onClose}
									className="flex h-8 w-8 items-center justify-center rounded-full text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
									aria-label="Close menu"
								>
									<Icon name="cross" className="h-4 w-4" />
								</button>
							</div>
						</div>

						{/* Quick Search Action Bar */}
						<div className="shrink-0 px-4 pt-3 pb-1">
							<button
								type="button"
								onClick={handleOpenCommandMenu}
								className="flex h-11 w-full items-center gap-2.5 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/70 px-3.5 text-left text-[13.5px] text-text-soft-400 transition-colors hover:border-stroke-soft-300 hover:text-text-sub-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/40 dark:hover:text-white/70"
							>
								<Icon
									name="magnifying-glass"
									className="h-4 w-4 shrink-0 opacity-70"
								/>
								<span>Search or jump to...</span>
							</button>
						</div>

						{/* Scrollable Navigation Body */}
						<div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-3">
							{/* Main Navigation Sections */}
							{mainNavigation
								.reduce<{ section: string; items: typeof mainNavigation }[]>(
									(acc, item) => {
										const sectionName = item.section || "General";
										const existing = acc.find((s) => s.section === sectionName);
										if (existing) {
											existing.items.push(item);
										} else {
											acc.push({ section: sectionName, items: [item] });
										}
										return acc;
									},
									[],
								)
								.map((sectionGroup) => {
									// Skip desktop settings in the main flow — rendered distinctly below
									const visibleItems = sectionGroup.items.filter(
										(item) => item.path !== "/settings" && item.path !== "/ai",
									);
									if (visibleItems.length === 0) return null;

									return (
										<div key={sectionGroup.section} className="space-y-1">
											<div className="px-2 pb-1 font-semibold text-[11px] text-text-soft-400 uppercase tracking-wider dark:text-white/40">
												{sectionGroup.section}
											</div>

											<div className="space-y-1">
												{visibleItems.map((item) => {
													const hasSubItems = Boolean(
														item.items && item.items.length > 0,
													);
													const isExpanded =
														expandedSections[item.path] ?? false;

													const isMainActive =
														item.path === "/"
															? pathWithoutSlug === "/" ||
																pathWithoutSlug.startsWith("/receive") ||
																pathWithoutSlug.startsWith("/emails")
															: item.path === "/inbox"
																? pathWithoutSlug === "/inbox"
																: pathWithoutSlug.startsWith(item.path);

													return (
														<div key={item.path} className="flex flex-col">
															<div className="flex items-center gap-1">
																<Link
																	href={item.path}
																	onClick={onClose}
																	className={cn(
																		"flex min-h-[44px] flex-1 items-center gap-3 rounded-xl px-3 py-2 font-medium text-[14px] transition-colors",
																		isMainActive
																			? "bg-bg-weak-100 font-semibold text-text-strong-950 dark:bg-white/10 dark:text-white"
																			: "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-white/70 dark:hover:bg-white/[0.05] dark:hover:text-white",
																	)}
																>
																	<SidebarNavIcon
																		name={item.iconName}
																		isActive={isMainActive}
																		className="h-4 w-4 shrink-0"
																	/>
																	<span>{item.label}</span>
																</Link>

																{hasSubItems && (
																	<button
																		type="button"
																		onClick={() => toggleExpand(item.path)}
																		aria-expanded={isExpanded}
																		aria-label={`Toggle ${item.label} sub-items`}
																		className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
																	>
																		<Icon
																			name="chevron-right"
																			className={cn(
																				"h-4 w-4 transition-transform duration-200",
																				isExpanded && "rotate-90",
																			)}
																		/>
																	</button>
																)}
															</div>

															{/* Sub-items */}
															{hasSubItems && isExpanded && (
																<div className="mt-1 ml-6 space-y-1 border-stroke-soft-200 border-l pl-3 dark:border-white/10">
																	{item.items?.map((subItem) => {
																		const isSubActive =
																			pathWithoutSlug.startsWith(subItem.path);
																		return (
																			<Link
																				key={subItem.path}
																				href={subItem.path}
																				onClick={onClose}
																				className={cn(
																					"flex min-h-[40px] items-center gap-2.5 rounded-lg px-2.5 py-1.5 font-medium text-[13px] transition-colors",
																					isSubActive
																						? "bg-bg-weak-100 font-semibold text-text-strong-950 dark:bg-white/10 dark:text-white"
																						: "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-white/70 dark:hover:bg-white/[0.05] dark:hover:text-white",
																				)}
																			>
																				<SidebarNavIcon
																					name={subItem.iconName}
																					isActive={isSubActive}
																					className="h-3.5 w-3.5 shrink-0"
																				/>
																				<span>{subItem.label}</span>
																			</Link>
																		);
																	})}
																</div>
															)}
														</div>
													);
												})}
											</div>
										</div>
									);
								})}

							{/* Settings & Organization Section */}
							<div className="space-y-1 border-stroke-soft-100 border-t pt-2 dark:border-white/[0.08]">
								<div className="flex items-center justify-between px-2 pb-1">
									<span className="font-semibold text-[11px] text-text-soft-400 uppercase tracking-wider dark:text-white/40">
										Settings & Workspace
									</span>
									<button
										type="button"
										onClick={() => setOpenSettingsGroup((v) => !v)}
										className="font-medium text-[11px] text-text-sub-600 hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
									>
										{openSettingsGroup ? "Collapse" : "View all"}
									</button>
								</div>

								<div className="space-y-1">
									{filteredSettings.flatMap((section) =>
										section.items
											.filter((item) => item.path !== "/settings/shortcuts")
											.map((item) => {
												const isSettingsActive =
													item.path === "/settings"
														? pathWithoutSlug === "/settings"
														: pathWithoutSlug.startsWith(item.path);

												// If not expanded, show only primary settings (Usage / Profile / Billing)
												if (
													!openSettingsGroup &&
													item.path !== "/settings" &&
													item.path !== "/settings/profile" &&
													item.path !== "/settings/billing"
												) {
													return null;
												}

												return (
													<Link
														key={item.path}
														href={item.path}
														onClick={onClose}
														className={cn(
															"flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2 font-medium text-[14px] transition-colors",
															isSettingsActive
																? "bg-bg-weak-100 font-semibold text-text-strong-950 dark:bg-white/10 dark:text-white"
																: "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-white/70 dark:hover:bg-white/[0.05] dark:hover:text-white",
														)}
													>
														<SidebarNavIcon
															name={item.iconName}
															isActive={isSettingsActive}
															className="h-4 w-4 shrink-0"
														/>
														<span>{item.label}</span>
													</Link>
												);
											}),
									)}
								</div>
							</div>
						</div>

						{/* Sheet Footer: User profile + Sign out */}
						<div className="shrink-0 border-stroke-soft-100 border-t bg-bg-weak-50/40 p-4 dark:border-white/[0.08] dark:bg-white/[0.02]">
							{user ? (
								<div className="flex items-center justify-between gap-3">
									<Link
										href="/settings/profile"
										onClick={onClose}
										className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-bg-weak-100/70 dark:hover:bg-white/[0.05]"
									>
										<UserAvatar
											name={user.name}
											email={user.email}
											image={user.image}
											size="32"
											initialsClassName="text-[11px]"
										/>
										<div className="min-w-0 flex-1">
											<p className="truncate font-semibold text-[13.5px] text-text-strong-950 dark:text-white">
												{user.name || "User"}
											</p>
											<p className="truncate font-normal text-[11.5px] text-text-sub-600 dark:text-white/50">
												{user.email}
											</p>
										</div>
									</Link>

									<button
										type="button"
										onClick={() => void handleSignOut()}
										className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-500/20"
										title="Log out"
										aria-label="Log out"
									>
										<Icon name="arrow-right-rec" className="h-4 w-4" />
									</button>
								</div>
							) : null}
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
