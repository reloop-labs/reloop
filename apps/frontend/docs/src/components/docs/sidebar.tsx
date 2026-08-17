"use client";

import * as Popover from "@radix-ui/react-popover";
import { navigationTabs } from "@reloop/fe-docs/lib/navigation";
import type { PageTreeItem } from "@reloop/fe-docs/lib/types";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { KbdKey } from "@reloop/ui/kbd-key";
import { Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	isActive as checkIsActive,
	normalizeDocsPathname,
} from "../../lib/is-active";
import { AnimatedHoverBackground } from "./animated-hover-background";
import { ApiSidebarSection } from "./sidebar-api";
import { DefaultSidebarSection } from "./sidebar-default";
import { WebhookSidebarSection } from "./sidebar-webhook";

function ActionKbd({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<KbdKey
			className={cn(
				"h-4 min-w-3.5 select-none items-center justify-center rounded-[4px] border border-stroke-soft-200 bg-bg-weak-50 px-1 font-medium font-mono text-[9px] text-text-sub-600 leading-none shadow-[0_1.5px_0_0_var(--color-stroke-soft-200)] dark:border-white/[0.14] dark:bg-white/[0.07] dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.55),0_0_0_0.5px_rgba(255,255,255,0.06),inset_0_0.5px_0_0_rgba(255,255,255,0.08)]",
				className,
			)}
		>
			{children}
		</KbdKey>
	);
}

export interface SidebarContextType {
	hoveredEl: HTMLElement | null;
	setHoveredEl: (el: HTMLElement | null) => void;
	activeEl: HTMLElement | null;
	setActiveEl: (el: HTMLElement | null) => void;
	openFolders: Set<string>;
	toggleFolder: (url: string) => void;
	pathname: string;
}

export const SidebarContext = createContext<SidebarContextType | null>(null);

export function useSidebarContext() {
	const context = useContext(SidebarContext);
	if (!context) {
		throw new Error("useSidebarContext must be used within SidebarProvider");
	}
	return context;
}

interface SidebarProps {
	tree: PageTreeItem[];
	isMobile?: boolean;
	onLinkClick?: () => void;
	onSearchClick?: () => void;
	pathname?: string;
}

export function Sidebar({
	tree,
	isMobile,
	onLinkClick,
	onSearchClick,
	pathname: propPathname,
}: SidebarProps) {
	const clientPathname = usePathname();
	const pathname = normalizeDocsPathname(propPathname || clientPathname || "");
	const gradientFromClass = "from-bg-white-0 dark:from-black to-transparent";
	const activeTab =
		navigationTabs.find((tab) => {
			if (tab.url === "/") {
				return !navigationTabs
					.filter((t) => t.url !== "/")
					.some((t) => pathname.startsWith(t.url));
			}
			return pathname.startsWith(tab.url);
		}) || navigationTabs[0];

	// Filter tree based on active section
	const filteredTree = useMemo(() => {
		if (!tree || !Array.isArray(tree)) return [];

		const currentPath = activeTab?.url?.replace("/", "") || "";

		// 2. If we are in a specialized section (API, Webhooks, etc.)
		if (currentPath) {
			const sectionFolder = tree.find((node) => {
				if (node.type !== "folder") return false;

				// Match by URL instead of name for precision
				const nodeUrl = (node.url || "").toLowerCase();
				const tabUrl = (activeTab?.url || "").toLowerCase();

				return nodeUrl === tabUrl || nodeUrl === `${tabUrl}/`;
			});

			return sectionFolder && sectionFolder.type === "folder"
				? sectionFolder.children
				: [];
		}

		// 3. For the main Documentation ('/'), hide all specialized folders
		const allSectionUrls = navigationTabs
			.filter((tab) => tab.url !== "/")
			.map((tab) => tab.url.toLowerCase());

		const result = tree.filter((node) => {
			if (node.type !== "folder") return true;
			const nodeUrl = (node.url || "").toLowerCase();
			return !allSectionUrls.some(
				(url) => nodeUrl === url || nodeUrl.startsWith(`${url}/`),
			);
		});
		return result;
	}, [tree, activeTab]);

	const [hoveredEl, setHoveredEl] = useState<HTMLElement | null>(null);
	const [activeEl, setActiveEl] = useState<HTMLElement | null>(null);
	const [rect, setRect] = useState<{
		width: number;
		height: number;
		top: number;
		left: number;
	} | null>(null);
	// When true, the hover background snaps instantly (no transition) to the active item.
	// This prevents the glitch where clicking B while hovering B causes the background
	// to slide from the old active A → B again after hover ends.
	const [skipTransition, setSkipTransition] = useState(false);
	const navRef = useRef<HTMLElement>(null);

	// Collect URLs of all folders that contain the active page (at any depth)
	const getActiveFolderUrls = useCallback(
		(nodes: PageTreeItem[]): string[] => {
			const result: string[] = [];
			for (const node of nodes) {
				if (node.type !== "folder") continue;
				const directlyActive = checkIsActive(node.url, pathname, false);
				const childActive = node.children.some((c) =>
					c.type === "page" ? checkIsActive(c.url, pathname, false) : false,
				);
				const deepActive = getActiveFolderUrls(node.children).length > 0;
				if (directlyActive || childActive || deepActive) {
					result.push(node.url);
				}
				result.push(...getActiveFolderUrls(node.children));
			}
			return result;
		},
		[pathname],
	);

	// Collect URLs of all folders in the tree
	const getAllFolderUrls = useCallback((nodes: PageTreeItem[]): string[] => {
		const result: string[] = [];
		for (const node of nodes) {
			if (node.type !== "folder") continue;
			result.push(node.url);
			result.push(...getAllFolderUrls(node.children));
		}
		return result;
	}, []);

	// Folder open state. Active folders auto-open, but a user close is sticky
	// until they leave that folder (or re-open it) so navigation doesn't
	// immediately re-expand a folder they just collapsed.
	// Initialize with only active folders open — must match on server and client to avoid hydration mismatch.
	// sessionStorage restoration happens in the useEffect below, after hydration.
	const [openFolders, setOpenFolders] = useState<Set<string>>(
		() => new Set(getActiveFolderUrls(filteredTree)),
	);
	const userCollapsedRef = useRef<Set<string>>(new Set());

	// Restore persisted open-folder state from sessionStorage after mount (client-only)
	useEffect(() => {
		try {
			const saved = sessionStorage.getItem("reloop-sidebar-open-v2");
			if (saved) {
				const parsed: string[] = JSON.parse(saved);
				setOpenFolders((prev) => new Set([...prev, ...parsed]));
			}
		} catch {
			// Ignore parse errors
		}
	}, []);

	// Persist to sessionStorage
	useEffect(() => {
		sessionStorage.setItem(
			"reloop-sidebar-open-v2",
			JSON.stringify(Array.from(openFolders)),
		);
	}, [openFolders]);

	// Restore scroll position on mount
	useLayoutEffect(() => {
		if (!navRef.current) return;
		if (typeof window !== "undefined" && window.location.hash) return;
		const savedScroll = sessionStorage.getItem("reloop-sidebar-scroll");
		if (savedScroll) {
			navRef.current.scrollTop = Number.parseInt(savedScroll, 10);
		}
	}, []);

	// Scroll to hash element in sidebar on navigation/mount
	useEffect(() => {
		const handleScrollToHash = () => {
			if (typeof window === "undefined" || !navRef.current) return;
			const hash = window.location.hash;
			if (!hash) return;
			const id = hash.replace("#", "");
			if (!id) return;
			const targetEl = navRef.current.querySelector(`#${id}`);
			if (targetEl) {
				targetEl.scrollIntoView({ block: "start" });
			}
		};

		const timeoutId = setTimeout(handleScrollToHash, 100);
		return () => clearTimeout(timeoutId);
	}, [pathname]);

	const prevTabUrl = useRef(activeTab?.url);

	// On tab/section change: open active folders in the new section (fresh section, clear collapse prefs)
	useEffect(() => {
		if (prevTabUrl.current !== activeTab?.url) {
			prevTabUrl.current = activeTab?.url;
			userCollapsedRef.current.clear();
			const urls = getActiveFolderUrls(filteredTree);
			setOpenFolders((prev) => new Set([...prev, ...urls]));
		}
	}, [activeTab?.url, filteredTree, getActiveFolderUrls]);

	// On navigation: auto-open newly-active folders unless the user collapsed them
	useEffect(() => {
		const urls = getActiveFolderUrls(filteredTree);
		const activeSet = new Set(urls);

		// Leaving a folder clears the manual-collapse sticky so the next visit can auto-open
		for (const url of Array.from(userCollapsedRef.current)) {
			if (!activeSet.has(url)) {
				userCollapsedRef.current.delete(url);
			}
		}

		if (urls.length === 0) return;
		setOpenFolders((prev) => {
			const toAdd = urls.filter(
				(u) => !prev.has(u) && !userCollapsedRef.current.has(u),
			);
			if (toAdd.length === 0) return prev;
			return new Set([...prev, ...toAdd]);
		});
	}, [filteredTree, getActiveFolderUrls]);

	const toggleFolder = useCallback(
		(url: string) => {
			const activeUrls = new Set(getActiveFolderUrls(filteredTree));
			setOpenFolders((prev) => {
				const next = new Set(prev);
				if (next.has(url)) {
					next.delete(url);
					// Sticky-collapse only for folders that contain the active page —
					// otherwise auto-open still works the next time you navigate in.
					if (activeUrls.has(url)) {
						userCollapsedRef.current.add(url);
					}
				} else {
					next.add(url);
					userCollapsedRef.current.delete(url);
				}
				return next;
			});
		},
		[filteredTree, getActiveFolderUrls],
	);

	// Find the active element by DOM query after each navigation.
	// Re-runs on pathname changes so activeEl always reflects the current page.
	useLayoutEffect(() => {
		if (!navRef.current) return;
		const el = navRef.current.querySelector<HTMLElement>(
			'[data-sidebar-active="true"]',
		);
		// Snap instantly when the active item changes so there's no slide-from-old-position glitch.
		setSkipTransition(true);
		setActiveEl(el ?? null);
	}, [pathname]);

	// Re-enable the transition on the next frame after a snap so hover animations still work.
	useEffect(() => {
		if (!skipTransition) return;
		const id = requestAnimationFrame(() => setSkipTransition(false));
		return () => cancelAnimationFrame(id);
	}, [skipTransition]);

	// Compute rect and method color from hovered element, falling back to active element
	useLayoutEffect(() => {
		const target = hoveredEl || activeEl;
		if (target && navRef.current) {
			const elRect = target.getBoundingClientRect();
			const navRect = navRef.current.getBoundingClientRect();
			setRect({
				width: target.offsetWidth,
				height: target.offsetHeight,
				top: elRect.top - navRect.top + navRef.current.scrollTop,
				left: elRect.left - navRect.left,
			});
		} else {
			setRect(null);
		}
	}, [hoveredEl, activeEl]);

	// Read the HTTP method from the currently targeted element (set via data-method attribute)
	const currentMethod = (hoveredEl || activeEl)?.dataset?.method ?? null;

	return (
		<aside
			className={cn(
				"z-30 flex h-full w-full flex-col overflow-hidden bg-transparent py-2 pr-0 pl-3",
				isMobile && "bg-bg-weak-50/[0.15]",
			)}
		>
			<div className="border-stroke-soft-100 border-b px-2 py-3 pb-1 lg:hidden">
				<ProductSwitcher pathname={pathname} />
			</div>

			{/* Sticky Search Trigger */}
			{onSearchClick && (
				<div className="pl-1 pr-2 pt-0.5 pb-2">
					<button
						type="button"
						onClick={onSearchClick}
						className={cn(
							"flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-stroke-soft-100 bg-bg-white-0 px-2.5 text-text-sub-600 text-xs transition-all",
							"hover:scale-[1.01] hover:border-black/15 hover:text-[#171717] active:scale-[0.99]",
							"dark:bg-black dark:hover:border-white/15 dark:hover:text-white",
						)}
						title="Search (⌘K)"
					>
						<div className="flex items-center gap-2">
							<Icon name="search" className="h-3.5 w-3.5 shrink-0" />
							<span className="text-xs">Search...</span>
						</div>
						<div className="pointer-events-none flex items-center gap-0.5">
							<ActionKbd>⌘</ActionKbd>
							<ActionKbd>K</ActionKbd>
						</div>
					</button>
				</div>
			)}

			{/* Navigation tree */}
			<nav
				ref={navRef}
				className="scrollbar-thin relative flex-1 overflow-y-auto pl-1 pr-1.5 pt-0 pb-0"
				onPointerLeave={() => setHoveredEl(null)}
				onScroll={() => {
					if (navRef.current) {
						sessionStorage.setItem(
							"reloop-sidebar-scroll",
							navRef.current.scrollTop.toString(),
						);
					}
				}}
			>
				{/* Top Fade Gradient Overlay */}
				<div
					className={cn(
						"-mb-6 pointer-events-none sticky top-0 right-0 left-0 z-20 h-6 bg-gradient-to-b to-transparent",
						gradientFromClass,
					)}
				/>
				<SidebarContext.Provider
					value={{
						hoveredEl,
						setHoveredEl,
						activeEl,
						setActiveEl,
						openFolders,
						toggleFolder,
						pathname,
					}}
				>
					<AnimatedHoverBackground
						rect={rect}
						skipTransition={skipTransition}
						method={currentMethod}
					/>

					<div className="z-10 flex flex-col gap-px pt-3">
						{filteredTree.map((node, index) => {
							if (activeTab?.url === "/api") {
								return (
									<ApiSidebarSection
										key={index}
										node={node}
										onLinkClick={onLinkClick}
									/>
								);
							}
							if (activeTab?.url === "/webhooks") {
								return (
									<WebhookSidebarSection
										key={index}
										node={node}
										onLinkClick={onLinkClick}
									/>
								);
							}
							return (
								<DefaultSidebarSection
									key={index}
									node={node}
									onLinkClick={onLinkClick}
								/>
							);
						})}
					</div>
				</SidebarContext.Provider>
				{/* Bottom Fade Gradient Overlay */}
				<div
					className={cn(
						"pointer-events-none sticky right-0 bottom-0 left-0 z-20 mt-6 h-6 bg-gradient-to-t to-transparent",
						gradientFromClass,
					)}
				/>
			</nav>
		</aside>
	);
}

function ProductSwitcher({ pathname: propPathname }: { pathname?: string }) {
	const clientPathname = usePathname();
	const pathname = normalizeDocsPathname(propPathname || clientPathname || "");
	const activeTab =
		navigationTabs.find((tab) =>
			tab.url === "/" ? pathname === "/" : pathname.startsWith(tab.url),
		) ?? navigationTabs[0];

	return (
		<Popover.Root>
			<Popover.Trigger asChild>
				<button
					type="button"
					className="flex w-full items-center justify-between gap-2 rounded-lg border border-stroke-soft-100 bg-bg-white-0 px-3 py-2 text-[#171717] transition-all hover:bg-black/[0.02] dark:text-white dark:hover:bg-white/[0.02]"
				>
					<div className="flex items-center gap-2.5">
						<Icon
							name={activeTab?.iconName || "file-text"}
							className="h-4 w-4 text-text-sub-600"
						/>
						<span className="font-medium text-[13px]">{activeTab?.title}</span>
					</div>
					<ChevronDown className="h-3.5 w-3.5 text-text-sub-600" />
				</button>
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Content
					sideOffset={0}
					align="start"
					className="fade-in zoom-in-95 z-50 w-[240px] animate-in overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-1 outline-none"
				>
					<div className="flex flex-col gap-0.5">
						{navigationTabs.map((tab) => {
							const isActive = tab.url === activeTab?.url;
							return (
								<Link
									key={tab.title}
									href={tab.url}
									className={cn(
										"flex items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-colors",
										isActive
											? "bg-black/5 text-[#171717] dark:bg-white/5 dark:text-white"
											: "text-text-sub-600 hover:bg-black/[0.03] hover:text-[#171717] dark:hover:bg-white/[0.03] dark:hover:text-white",
									)}
								>
									<div className="flex items-center gap-2.5">
										<Icon
											name={tab.iconName}
											className={cn(
												"h-4 w-4 transition-colors",
												isActive
													? "text-[#171717] dark:text-white"
													: "text-text-sub-600",
											)}
										/>
										<span
											className={cn(
												"font-medium",
												isActive ? "text-[#171717] dark:text-white" : "",
											)}
										>
											{tab.title}
										</span>
									</div>
									{isActive && (
										<Check className="h-3.5 w-3.5 text-[#171717] dark:text-white" />
									)}
								</Link>
							);
						})}
					</div>
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	);
}
