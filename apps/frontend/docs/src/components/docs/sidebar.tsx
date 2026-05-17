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
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { isActive as checkIsActive } from "../../lib/is-active";
import { SearchDialog } from "./search-dialog";
import { AnimatedHoverBackground } from "./animated-hover-background";

interface SidebarContextType {
	hoveredEl: HTMLElement | null;
	setHoveredEl: (el: HTMLElement | null) => void;
	activeEl: HTMLElement | null;
	setActiveEl: (el: HTMLElement | null) => void;
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

	console.log(
		"[Sidebar Debug] propPathname:",
		propPathname,
		"clientPathname:",
		clientPathname,
		"activeTab:",
		activeTab?.title,
	);

	// Filter tree based on active section
	const filteredTree = useMemo(() => {
		if (!tree || !Array.isArray(tree)) return [];

		// 1. Get all specialized section URLs (excluding root)
		const sectionPaths = navigationTabs
			.filter((tab) => tab.url !== "/")
			.map((tab) => tab.url.replace("/", ""));

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
	const [rect, setRect] = useState<{ width: number; height: number } | null>(null);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const navRef = useRef<HTMLElement>(null);

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

	const currentEl = hoveredEl || activeEl;

	// Calculate and sync position rect relative to nav parent container
	useLayoutEffect(() => {
		if (currentEl) {
			setRect({
				width: currentEl.offsetWidth,
				height: currentEl.offsetHeight,
			});
		} else {
			setRect(null);
		}
	}, [currentEl, pathname, tree]);

	return (
		<aside
			className={cn(
				"z-30 h-full flex-col bg-transparent",
				isMobile
					? "flex w-full bg-fd-muted/[0.15]"
					: "hidden w-60 shrink-0 lg:flex",
			)}
		>
			<div className="lg:hidden px-3 py-3 pb-1 border-fd-border border-b">
				<ProductSwitcher pathname={pathname} />
			</div>

			{/* Search button area */}
			<div className="flex items-center gap-2 px-3 py-2">
				<button
					type="button"
					onClick={() => setIsSearchOpen(true)}
					className="flex h-8.5 flex-1 items-center gap-2 rounded-lg border border-fd-border bg-fd-background px-2.5 text-fd-muted-foreground text-xs transition-all hover:border-fd-foreground/10 hover:shadow-sm"
				>
					<Search className="h-3.5 w-3.5" />
					<span className="flex-1 text-left">Search...</span>
					<kbd className="pointer-events-none hidden h-5 select-none items-center gap-0.5 rounded border border-fd-border bg-fd-muted px-1.5 font-medium font-mono text-[10px] sm:inline-flex">
						<span className="text-xs">⌘</span>K
					</kbd>
				</button>
				<button
					type="button"
					className="flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-fd-border bg-fd-background text-fd-muted-foreground transition-all hover:border-fd-foreground/10 hover:text-fd-foreground hover:shadow-sm"
				>
					<Sparkles className="h-3.5 w-3.5" />
				</button>
			</div>

			{/* Navigation tree */}
			<nav
				ref={navRef}
				className="relative flex-1 overflow-y-auto p-2 pt-1"
				onPointerLeave={() => setHoveredEl(null)}
			>
				<SidebarContext.Provider
					value={{
						hoveredEl,
						setHoveredEl,
						activeEl,
						setActiveEl,
						pathname,
					}}
				>


					<AnimatedHoverBackground rect={rect} tabElement={currentEl} />

					<div className="relative z-10 flex flex-col gap-px">
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
					className="flex w-full items-center justify-between gap-2 rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-fd-foreground shadow-sm transition-all hover:bg-fd-foreground/[0.02]"
				>
					<div className="flex items-center gap-2.5">
						<Icon
							name={activeTab?.iconName || "file-text"}
							className="h-4 w-4 text-fd-muted-foreground"
						/>
						<span className="font-medium text-[13px]">{activeTab?.title}</span>
					</div>
					<ChevronDown className="h-3.5 w-3.5 text-fd-muted-foreground/60" />
				</button>
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Content
					sideOffset={0}
					align="start"
					className="fade-in zoom-in-95 z-50 w-[240px] animate-in overflow-hidden rounded-xl border border-fd-border bg-fd-background p-1 shadow-xl outline-none"
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
											? "bg-fd-foreground/5 text-fd-foreground"
											: "text-fd-muted-foreground hover:bg-fd-foreground/[0.03] hover:text-fd-foreground",
									)}
								>
									<div className="flex items-center gap-2.5">
										<Icon
											name={tab.iconName}
											className={cn(
												"h-4 w-4 transition-colors",
												isActive
													? "text-fd-foreground"
													: "text-fd-muted-foreground",
											)}
										/>
										<span
											className={cn(
												"font-medium",
												isActive ? "text-fd-foreground" : "",
											)}
										>
											{tab.title}
										</span>
									</div>
									{isActive && (
										<Check className="h-3.5 w-3.5 text-fd-foreground" />
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
			<div className="h-7 w-20 animate-pulse rounded-full bg-fd-background/50" />
		);

	const themes = [
		{ value: "system", icon: "monitor", label: "System theme" },
		{ value: "light", icon: "sun", label: "Light theme" },
		{ value: "dark", icon: "moon", label: "Dark theme" },
	];

	return (
		<div className="flex w-fit items-center rounded-full border border-stroke-soft-200 bg-fd-background p-0.5 shadow-sm">
			{themes.map((themeOption) => {
				const isSelected = theme === themeOption.value;
				return (
					<motion.button
						key={themeOption.value}
						onClick={() => setTheme(themeOption.value)}
						className={cn(
							"flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200 text-text-sub-600 hover:text-fd-foreground",
							isSelected && "border border-stroke-soft-200 bg-fd-muted text-fd-foreground shadow-sm",
						)}
						title={themeOption.label}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						<Icon name={themeOption.icon} className="w-3.5 h-3.5" />
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
				<h4 className="font-semibold text-[10px] text-text-sub-600 opacity-60 uppercase tracking-[0.05em]">
					{node.name as string}
				</h4>
			</div>
		);
	}

	if (node.type === "folder") {
		return (
			<SidebarFolder node={node} onLinkClick={onLinkClick} />
		);
	}

	return (
		<SidebarLink node={node} onLinkClick={onLinkClick} />
	);
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
	const { activeEl, setActiveEl, setHoveredEl, pathname } = useSidebarContext();

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
	const [isOpen, setIsOpen] = useState(isActive);
	const router = useRouter();

	useEffect(() => {
		if (isActive) {
			setIsOpen(true);
		}
	}, [isActive]);

	useLayoutEffect(() => {
		if (isDirectlyActive && ref.current) {
			setActiveEl(ref.current);
		}
		return () => {
			if (isDirectlyActive) {
				setActiveEl(null);
			}
		};
	}, [isDirectlyActive, setActiveEl]);

	const handleToggle = () => {
		const nextIsOpen = !isOpen;
		setIsOpen(nextIsOpen);

		if (nextIsOpen) {
			const firstPage = findFirstPage(node);
			if (firstPage && firstPage !== pathname) {
				router.push(firstPage);
			}
		}
	};

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
				className={cn(
					"group relative z-10 flex h-9 w-full items-center justify-between rounded-lg px-2 font-medium text-sm transition-all",
					isDirectlyActive
						? "text-fd-foreground"
						: isParentActive
							? "text-fd-foreground"
							: "text-text-sub-600 hover:text-fd-foreground",
				)}
			>
				<div className="relative z-10 flex w-full items-center gap-2 text-left">
					{node.icon && (
						<span
							className={cn(
								"flex h-4 w-4 shrink-0 items-center justify-center transition-colors",
								isActive ? "text-fd-foreground" : "text-text-sub-600 opacity-70",
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
							? "text-fd-foreground"
							: "text-text-sub-600 opacity-50 group-hover:text-fd-foreground",
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
						<div
							className={cn(
								"mt-px flex flex-col space-y-px pb-0.5",
								isDirectlyActive ? "pl-0" : "ml-[14px] border-fd-border/30 border-l pl-3",
							)}
						>
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
	const { activeEl, setActiveEl, setHoveredEl, pathname } = useSidebarContext();

	if (node.type === "separator") return null;
	if (node.type === "folder") {
		return (
			<SidebarFolder node={node} onLinkClick={onLinkClick} />
		);
	}

	const linkId = node.url;
	const isActive = checkIsActive(linkId, pathname, false);

	useLayoutEffect(() => {
		if (isActive && ref.current) {
			setActiveEl(ref.current);
		}
		return () => {
			if (isActive) {
				setActiveEl(null);
			}
		};
	}, [isActive, setActiveEl]);

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
			className={cn(
				"group relative z-10 flex h-8 items-center gap-2 rounded-lg px-2 font-medium text-sm transition-colors",
				isActive
					? "text-fd-foreground"
					: "text-text-sub-600 hover:text-fd-foreground",
			)}
		>
			<div className="relative z-10 flex w-full items-center gap-2 text-left">
				{node.icon && (
					<span
						className={cn(
							"flex h-3.5 w-3.5 shrink-0 items-center justify-center transition-colors",
							isActive ? "text-fd-foreground" : "text-text-sub-600 opacity-70",
						)}
					>
						{node.icon}
					</span>
				)}
				<span className="truncate">{node.name as string}</span>
			</div>
			{node.method && (
				<span
					className={cn(
						"ml-auto rounded px-1.5 py-0.5 font-bold text-[9px] uppercase tracking-wider relative z-10",
						node.method === "GET" &&
							"bg-green-500/10 text-green-600 dark:text-green-400",
						node.method === "POST" &&
							"bg-blue-500/10 text-blue-600 dark:text-blue-400",
						node.method === "DELETE" &&
							"bg-red-500/10 text-red-600 dark:text-red-400",
						node.method === "PATCH" &&
							"bg-orange-500/10 text-orange-600 dark:text-orange-400",
						node.method === "PUT" &&
							"bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
					)}
				>
					{node.method}
				</span>
			)}
		</Link>
	);
}
