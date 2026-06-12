"use client";

import * as Popover from "@radix-ui/react-popover";
import { navigationTabs } from "@reloop/fe-docs/lib/navigation";
import type { FolderNode, PageTreeItem } from "@reloop/fe-docs/lib/types";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { AnimatePresence, motion } from "framer-motion";
import {
	Check,
	ChevronDown,
	ChevronRight,
	Search,
	Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
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
import { isActive as checkIsActive } from "../../lib/is-active";
import { AnimatedHoverBackground } from "./animated-hover-background";
import { SearchDialog } from "./search-dialog";

interface SidebarContextType {
	hoveredEl: HTMLElement | null;
	setHoveredEl: (el: HTMLElement | null) => void;
	activeEl: HTMLElement | null;
	setActiveEl: (el: HTMLElement | null) => void;
	openFolders: Set<string>;
	toggleFolder: (url: string) => void;
	pathname: string;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

function useSidebarContext() {
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
	pathname?: string;
}

export function Sidebar({
	tree,
	isMobile,
	onLinkClick,
	pathname: propPathname,
}: SidebarProps) {
	const clientPathname = usePathname();
	const pathname = propPathname || clientPathname || "";
	const activeTab = navigationTabs.find((tab) =>
		tab.url === "/" ? pathname === "/" : pathname.startsWith(tab.url),
	) ||
		navigationTabs[0] || {
			title: "Documentation",
			url: "/",
			iconName: "file-text",
		};

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

		return tree.filter((node) => {
			if (node.type !== "folder") return true;
			const nodeUrl = (node.url || "").toLowerCase();
			return !allSectionUrls.some(
				(url) => nodeUrl === url || nodeUrl.startsWith(`${url}/`),
			);
		});
	}, [tree, activeTab]);

	const [hoveredEl, setHoveredEl] = useState<HTMLElement | null>(null);
	const [activeEl, setActiveEl] = useState<HTMLElement | null>(null);
	const [rect, setRect] = useState<{
		width: number;
		height: number;
		top: number;
		left: number;
	} | null>(null);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
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

	// Folder open state lives here — only ever grows, never shrinks automatically
	const [openFolders, setOpenFolders] = useState<Set<string>>(() => {
		const activeUrls = getActiveFolderUrls(filteredTree);
		if (typeof window !== "undefined") {
			try {
				const saved = sessionStorage.getItem("reloop-sidebar-open");
				if (saved) {
					const parsed = JSON.parse(saved);
					return new Set([...parsed, ...activeUrls]);
				}
			} catch (e) {
				// Ignore parse errors
			}
		}
		return new Set(activeUrls);
	});

	// Persist to sessionStorage
	useEffect(() => {
		if (typeof window !== "undefined") {
			sessionStorage.setItem(
				"reloop-sidebar-open",
				JSON.stringify(Array.from(openFolders)),
			);
		}
	}, [openFolders]);

	// Restore scroll position on mount
	useLayoutEffect(() => {
		if (!navRef.current) return;
		if (typeof window !== "undefined") {
			const savedScroll = sessionStorage.getItem("reloop-sidebar-scroll");
			if (savedScroll) {
				navRef.current.scrollTop = Number.parseInt(savedScroll, 10);
			}
		}
	}, []);

	// On navigation: add newly-active folders but never remove any
	useEffect(() => {
		const urls = getActiveFolderUrls(filteredTree);
		if (urls.length === 0) return;
		setOpenFolders((prev) => {
			if (urls.every((u) => prev.has(u))) return prev;
			return new Set([...prev, ...urls]);
		});
	}, [pathname, filteredTree, getActiveFolderUrls]);

	const toggleFolder = useCallback((url: string) => {
		setOpenFolders((prev) => {
			const next = new Set(prev);
			if (next.has(url)) next.delete(url);
			else next.add(url);
			return next;
		});
	}, []);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				setIsSearchOpen(true);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	// Find the active element by DOM query after each navigation
	useLayoutEffect(() => {
		if (!navRef.current) return;
		const el = navRef.current.querySelector<HTMLElement>(
			'[data-sidebar-active="true"]',
		);
		setActiveEl(el ?? null);
	}, [pathname, filteredTree]);

	// Compute rect from hovered element, falling back to active element
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

	return (
		<aside
			className={cn(
				"z-30 flex h-full w-full flex-col overflow-hidden bg-transparent py-2 pr-2 pl-4",
				isMobile && "bg-bg-weak-50/[0.15]",
			)}
		>
			<div className="border-stroke-soft-100 border-b px-3 py-3 pb-1 lg:hidden">
				<ProductSwitcher pathname={pathname} />
			</div>

			{/* Search button area */}
			<div className="flex items-center gap-2 px-3 py-2">
				<button
					type="button"
					onClick={() => setIsSearchOpen(true)}
					className="flex h-8.5 flex-1 items-center gap-2 rounded-lg border border-stroke-soft-100 bg-bg-white-0 px-2.5 text-text-sub-600 text-xs transition-all hover:border-black/10 dark:hover:border-white/10"
				>
					<Search className="h-3.5 w-3.5" />
					<span className="flex-1 text-left">Search...</span>
					<kbd className="pointer-events-none hidden h-5 select-none items-center gap-0.5 rounded border border-stroke-soft-100 bg-bg-weak-50 px-1.5 font-medium font-mono text-[10px] sm:inline-flex">
						<span className="text-xs">⌘</span>K
					</kbd>
				</button>
				<button
					type="button"
					className="flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-stroke-soft-100 bg-bg-white-0 text-text-sub-600 transition-all hover:border-black/10 hover:text-[#171717] dark:hover:border-white/10 dark:hover:text-white"
				>
					<Sparkles className="h-3.5 w-3.5" />
				</button>
			</div>

			{/* Navigation tree */}
			<nav
				ref={navRef}
				className="relative flex-1 overflow-y-auto p-2 pt-1"
				onPointerLeave={() => setHoveredEl(null)}
				onScroll={() => {
					if (navRef.current && typeof window !== "undefined") {
						sessionStorage.setItem(
							"reloop-sidebar-scroll",
							navRef.current.scrollTop.toString(),
						);
					}
				}}
			>
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
					<AnimatedHoverBackground rect={rect} />

					<div className="z-10 flex flex-col gap-px">
						{filteredTree.map((node, index) => (
							<SidebarSection
								key={index}
								node={node}
								onLinkClick={onLinkClick}
							/>
						))}
					</div>
				</SidebarContext.Provider>
			</nav>

			{/* Footer area with Theme Toggle */}
			<div className="p-3">
				<ThemeToggle />
			</div>

			<SearchDialog
				open={isSearchOpen}
				onOpenChange={setIsSearchOpen}
				tree={filteredTree}
			/>
		</aside>
	);
}

function ProductSwitcher({ pathname: propPathname }: { pathname?: string }) {
	const clientPathname = usePathname();
	const pathname = propPathname || clientPathname || "";
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

function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	if (!mounted)
		return (
			<div className="h-7 w-20 animate-pulse rounded-full bg-bg-white-0/50" />
		);

	const themes = [
		{ value: "system", icon: "monitor", label: "System theme" },
		{ value: "light", icon: "sun", label: "Light theme" },
		{ value: "dark", icon: "moon", label: "Dark theme" },
	];

	return (
		<div className="flex w-fit items-center rounded-full border border-stroke-soft-100 bg-bg-white-0 p-0.5">
			{themes.map((themeOption) => {
				const isSelected = theme === themeOption.value;
				return (
					<motion.button
						key={themeOption.value}
						onClick={() => setTheme(themeOption.value)}
						className={cn(
							"flex h-6 w-6 items-center justify-center rounded-full text-text-sub-600 transition-all duration-200 hover:text-[#171717] dark:hover:text-white",
							isSelected &&
								"border border-stroke-soft-100 bg-bg-weak-50 text-[#171717] dark:text-white",
						)}
						title={themeOption.label}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						<Icon name={themeOption.icon} className="h-3.5 w-3.5" />
					</motion.button>
				);
			})}
		</div>
	);
}

function SidebarSection({
	node,
	onLinkClick,
}: {
	node: PageTreeItem;
	onLinkClick?: () => void;
}) {
	if (node.type === "separator") {
		return (
			<div className="mt-4 mb-1.5 px-2">
				<h4 className="font-semibold text-[10px] text-text-sub-600 uppercase tracking-[0.05em] opacity-60">
					{node.name as string}
				</h4>
			</div>
		);
	}

	if (node.type === "folder") {
		return <SidebarFolder node={node} onLinkClick={onLinkClick} />;
	}

	return <SidebarLink node={node} onLinkClick={onLinkClick} />;
}

function findFirstPage(node: PageTreeItem): string | null {
	if (node.type === "page") return node.url;
	if (node.type === "folder") {
		if (node.index) return node.index.url;
		for (const child of node.children) {
			const url = findFirstPage(child);
			if (url) return url;
		}
	}
	return null;
}

function SidebarFolder({
	node,
	onLinkClick,
}: {
	node: FolderNode;
	onLinkClick?: () => void;
}) {
	const ref = useRef<HTMLButtonElement>(null);
	const { setHoveredEl, pathname, openFolders, toggleFolder } =
		useSidebarContext();

	const isChildActive = (item: PageTreeItem): boolean => {
		if (item.type === "page") return checkIsActive(item.url, pathname, false);
		if (item.type === "folder") {
			return (
				checkIsActive(item.url, pathname, false) ||
				item.children.some(isChildActive)
			);
		}
		return false;
	};

	const isDirectlyActive = checkIsActive(node.url, pathname, false);
	const isParentActive = node.children.some(isChildActive);
	const isActive = isDirectlyActive || isParentActive;

	// Open state comes from parent Sidebar — never auto-closes
	const isOpen = openFolders.has(node.url);
	const handleToggle = () => toggleFolder(node.url);

	return (
		<div className="space-y-px">
			<button
				ref={ref}
				type="button"
				onClick={handleToggle}
				onPointerEnter={() => {
					if (ref.current) {
						setHoveredEl(ref.current);
					}
				}}
				data-sidebar-active={isDirectlyActive || undefined}
				className={cn(
					"group relative z-10 flex h-9 w-full items-center justify-between rounded-lg px-2 font-medium text-sm transition-all",
					isDirectlyActive
						? "text-[#171717] dark:text-white"
						: isParentActive
							? "text-[#171717] dark:text-white"
							: "text-text-sub-600 hover:text-[#171717] dark:hover:text-white",
				)}
			>
				<div className="relative z-10 flex w-full items-center gap-2 text-left">
					{node.icon && (
						<span
							className={cn(
								"flex h-4 w-4 shrink-0 items-center justify-center transition-colors",
								isActive
									? "text-[#171717] dark:text-white"
									: "text-text-sub-600 opacity-70",
							)}
						>
							{node.icon}
						</span>
					)}
					<span className="truncate">{node.name as string}</span>
				</div>
				<ChevronRight
					className={cn(
						"relative z-10 h-3.5 w-3.5 transition-transform duration-200",
						isActive
							? "text-[#171717] dark:text-white"
							: "text-text-sub-600 opacity-50 group-hover:text-[#171717] dark:group-hover:text-white",
						isOpen && "rotate-90",
					)}
				/>
			</button>

			<AnimatePresence initial={false}>
				{isOpen && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
						style={{ overflow: "hidden" }}
					>
						<div className="mt-px ml-2.5 flex flex-col space-y-px border-stroke-soft-100/40 border-l pb-0.5 pl-2">
							{node.children.map((child: PageTreeItem, index: number) => (
								<SidebarLink
									key={index}
									node={child}
									onLinkClick={onLinkClick}
								/>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

function SidebarLink({
	node,
	onLinkClick,
}: {
	node: PageTreeItem;
	onLinkClick?: () => void;
}) {
	const ref = useRef<HTMLAnchorElement>(null);
	const { setHoveredEl, pathname } = useSidebarContext();

	if (node.type === "separator") return null;
	if (node.type === "folder") {
		return <SidebarFolder node={node} onLinkClick={onLinkClick} />;
	}

	const linkId = node.url;
	const isActive = checkIsActive(linkId, pathname, false);

	return (
		<Link
			ref={ref}
			href={linkId}
			onClick={onLinkClick}
			onPointerEnter={() => {
				if (ref.current) {
					setHoveredEl(ref.current);
				}
			}}
			data-sidebar-active={isActive || undefined}
			className={cn(
				"group relative z-10 flex h-7 items-center gap-2 rounded-lg px-2 text-[13px] transition-colors",
				isActive
					? "text-[#171717] dark:text-white"
					: "text-text-sub-600 hover:text-[#171717] dark:hover:text-white",
			)}
		>
			<div className="relative z-10 grid w-full grid-cols-[40px_1fr] items-center gap-2 text-left">
				{node.method ? (
					<p
						className={cn(
							"inline-flex w-fit shrink-0 items-center justify-self-center rounded-[4px] px-1.5 py-[1.5px] font-semibold text-[10px] uppercase leading-tight tracking-wide",
							node.method === "GET" &&
								"bg-green-500/15 text-green-600 dark:bg-green-500/20 dark:text-green-400",
							node.method === "POST" &&
								"bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
							node.method === "DELETE" &&
								"bg-red-500/15 text-red-500 dark:bg-red-500/20 dark:text-red-400",
							node.method === "PATCH" &&
								"bg-orange-500/15 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
							node.method === "PUT" &&
								"bg-purple-500/15 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
						)}
					>
						{node.method === "DELETE" ? "DEL" : node.method}
					</p>
				) : node.icon ? (
					<span
						className={cn(
							"flex h-3.5 w-3.5 shrink-0 items-center justify-center justify-self-center transition-colors",
							isActive
								? "text-[#171717] dark:text-white"
								: "text-text-sub-600 opacity-70",
						)}
					>
						{node.icon}
					</span>
				) : (
					<div />
				)}
				<span className="truncate font-medium">{node.name as string}</span>
			</div>
		</Link>
	);
}
