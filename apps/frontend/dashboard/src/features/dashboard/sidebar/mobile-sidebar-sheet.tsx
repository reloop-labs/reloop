"use client";

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
import { ThemeToggle } from "#/features/dashboard/page-header/theme-toggle";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { UserAvatar } from "#/features/dashboard/page-header/user-avatar";
import { OnboardingBanner } from "#/features/setup-banner/onboarding-banner";
import { SettingsSidebarItems } from "./settings-sidebar-items";
import { SidebarItems } from "./sidebar-items";

const DRAWER_TRANSITION = { duration: 0.28, ease: [0.32, 0.72, 0, 1] } as const;

/**
 * Mobile navigation: a full-screen panel that slides in from the right, next
 * to the hamburger. Renders the desktop sidebar's own items, header and footer
 * so rows, icons and spacing match desktop exactly.
 */
export function MobileSidebarSheet({
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	onClose: () => void;
}) {
	const pathname = usePathname();
	const pathWithoutSlug = pathname.replace(/^\/dashboard/, "") || "/";
	const isSettingsRoute = pathWithoutSlug.startsWith("/settings");
	const shouldReduceMotion = useReducedMotion();
	const { user } = useActiveOrganization();

	// Same main ↔ settings swap as the desktop sidebar.
	const [settingsPeek, setSettingsPeek] = React.useState(false);
	const [settingsNavDismissed, setSettingsNavDismissed] = React.useState(false);
	const showSettingsNav = settingsNavDismissed
		? false
		: settingsPeek || isSettingsRoute;

	React.useEffect(() => {
		if (!isOpen) {
			setSettingsPeek(false);
			setSettingsNavDismissed(false);
		}
	}, [isOpen]);

	// Prevent background scroll when the menu is open
	React.useEffect(() => {
		if (!isOpen) return;
		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = originalOverflow;
		};
	}, [isOpen]);

	React.useEffect(() => {
		if (!isOpen) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [isOpen, onClose]);

	// Route changes close the menu (dashboard shell); this also covers tapping
	// the page you're already on. Expand chevrons stop propagation, so they don't.
	const handleNavClick = (e: React.MouseEvent) => {
		if ((e.target as HTMLElement).closest("a")) onClose();
	};

	// Swipe right to dismiss: past a quarter of the screen, or a quick flick.
	const handleDragEnd = (
		_event: MouseEvent | TouchEvent | PointerEvent,
		info: PanInfo,
	) => {
		if (info.offset.x > window.innerWidth * 0.25 || info.velocity.x > 500) {
			onClose();
		}
	};

	const slide = (from: string) => ({
		initial: {
			transform: shouldReduceMotion ? "translateX(0%)" : `translateX(${from})`,
			opacity: 0,
		},
		animate: { transform: "translateX(0%)", opacity: 1 },
		exit: {
			transform: shouldReduceMotion ? "translateX(0%)" : `translateX(${from})`,
			opacity: 0,
		},
		transition: DRAWER_TRANSITION,
	});

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					key="mobile-nav"
					role="dialog"
					aria-modal="true"
					aria-label="Mobile Navigation Menu"
					// Follows the finger to the right only; vertical swipes still scroll the list
					drag="x"
					dragDirectionLock
					dragConstraints={{ left: 0, right: 0 }}
					dragElastic={{ left: 0, right: 1 }}
					dragSnapToOrigin
					onDragEnd={handleDragEnd}
					initial={shouldReduceMotion ? { opacity: 0 } : { x: "100%" }}
					animate={shouldReduceMotion ? { opacity: 1 } : { x: 0 }}
					exit={shouldReduceMotion ? { opacity: 0 } : { x: "100%" }}
					transition={
						shouldReduceMotion ? { duration: 0.15 } : DRAWER_TRANSITION
					}
					className="fixed inset-0 z-[100] flex select-none flex-col bg-bg-white-0 lg:hidden dark:bg-black"
				>
					{/* Header: desktop sidebar brand row + close where the hamburger was */}
					<div className="flex h-12 shrink-0 items-center justify-between border-stroke-soft-100 border-b px-3 dark:border-stroke-soft-100/40">
						<a
							href="/home"
							aria-label="Reloop home"
							className="flex items-center gap-2"
						>
							<Logo className="-ml-1 h-8 w-8 shrink-0" />
							<p className="font-semibold text-text-strong-950">Reloop</p>
							<span className="inline-flex items-center rounded-full bg-bg-weak-50 px-2 py-0.5 font-bold text-[8px] text-text-sub-600 uppercase tracking-wide dark:bg-white/[0.06]">
								Beta
							</span>
						</a>
						<button
							type="button"
							onClick={onClose}
							aria-label="Close menu"
							className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-strong-950 transition-colors hover:bg-bg-weak-50 dark:hover:bg-white/5"
						>
							<Icon name="cross" className="h-4 w-4" />
						</button>
					</div>

					<div
						className="relative flex-1 overflow-hidden"
						onClick={handleNavClick}
					>
						<AnimatePresence mode="popLayout" initial={false}>
							{showSettingsNav ? (
								<motion.div
									key="settings"
									{...slide("20%")}
									className="absolute inset-0 overflow-y-auto overflow-x-hidden overscroll-contain px-2 py-2"
								>
									<SettingsSidebarItems
										isCollapsed={false}
										onCloseSettings={() => {
											setSettingsPeek(false);
											setSettingsNavDismissed(true);
										}}
									/>
								</motion.div>
							) : (
								<motion.div
									key="main"
									{...slide("-20%")}
									className="absolute inset-0 overflow-y-auto overflow-x-hidden overscroll-contain px-2 py-2"
								>
									<SidebarItems
										isCollapsed={false}
										onOpenSettings={() => {
											setSettingsNavDismissed(false);
											setSettingsPeek(true);
										}}
									/>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					{/* Footer: desktop sidebar footer (setup card + theme toggle), then who's signed in */}
					<div className="flex shrink-0 flex-col gap-2 px-2 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
						<OnboardingBanner isCollapsed={false} />
						<div className="px-1">
							<ThemeToggle />
						</div>
						{user ? (
							<Link
								href="/settings/profile"
								onClick={onClose}
								className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-bg-weak-50 dark:hover:bg-white/5"
							>
								<UserAvatar
									name={user.name}
									email={user.email}
									image={user.image}
									size="32"
									initialsClassName="text-[11px]"
								/>
								<div className="min-w-0 flex-1">
									<p className="truncate font-medium text-[13px] text-text-strong-950">
										{user.name || "User"}
									</p>
									<p className="truncate text-[12px] text-text-sub-600">
										{user.email}
									</p>
								</div>
							</Link>
						) : null}
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
