"use client";

import { Search, Sparkles, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "../../lib/cn";
import type { PageTreeItem, FolderNode } from "../../lib/types";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

interface SidebarProps {
	tree: PageTreeItem[];
}

export function Sidebar({ tree }: SidebarProps) {
	const pathname = usePathname();
	const [hoveredRect, setHoveredRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
	const [activeRect, setActiveRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
	const navRef = useRef<HTMLElement>(null);

	// Sync active rectangle on path change or tree changes
	useEffect(() => {
		const updateActiveRect = () => {
			if (navRef.current) {
				const activeEl = navRef.current.querySelector('[data-active="true"]') as HTMLElement;
				if (activeEl) {
					const navBox = navRef.current.getBoundingClientRect();
					const activeBox = activeEl.getBoundingClientRect();
					setActiveRect({
						top: activeBox.top - navBox.top + navRef.current.scrollTop,
						left: activeBox.left - navBox.left + navRef.current.scrollLeft,
						width: activeBox.width,
						height: activeBox.height,
					});
				} else {
					setActiveRect(null);
				}
			}
		};

		// Small delay to ensure the DOM has updated
		const timer = setTimeout(updateActiveRect, 0);
		return () => clearTimeout(timer);
	}, [pathname, tree]);

	return (
		<aside className="z-30 hidden h-full w-60 shrink-0 flex-col border-fd-border border-r bg-fd-muted/[0.15] md:flex">
			{/* Search button area */}
			<div className="flex items-center gap-2 px-3 py-2">
				<button
					type="button"
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
				className="relative flex-1 overflow-y-auto p-2"
				onPointerLeave={() => setHoveredRect(null)}
			>
				<AnimatePresence>
					{(hoveredRect || activeRect) && (
						<motion.div
							className={cn(
								"absolute rounded-lg z-0 pointer-events-none",
								hoveredRect ? "bg-fd-foreground/[0.04]" : "bg-fd-foreground/5 shadow-sm"
							)}
							initial={false}
							animate={{
								top: (hoveredRect || activeRect)?.top || 0,
								left: (hoveredRect || activeRect)?.left || 0,
								width: (hoveredRect || activeRect)?.width || 0,
								height: (hoveredRect || activeRect)?.height || 0,
								opacity: 1,
							}}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.14, ease: "easeOut" }}
						/>
					)}
				</AnimatePresence>

				<div className="relative z-10 flex flex-col gap-px">
					{tree.map((node, index) => (
						<SidebarSection
							key={index}
							node={node}
							onHover={(rect) => setHoveredRect(rect)}
						/>
					))}
				</div>
			</nav>

			{/* Footer area with Theme Toggle */}
			<div className="p-3">
				<ThemeToggle />
			</div>
		</aside>
	);
}

function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	if (!mounted) return <div className="h-7 w-14 rounded-full bg-fd-background/50 animate-pulse" />;

	return (
		<div className="flex w-fit items-center gap-0.5 rounded-full border border-fd-border bg-fd-background p-0.5">
			<button
				type="button"
				onClick={() => setTheme("light")}
				className={cn(
					"flex h-6 w-6 items-center justify-center rounded-full transition-colors",
					theme === "light"
						? "bg-fd-muted text-fd-foreground shadow-sm"
						: "text-fd-muted-foreground hover:text-fd-foreground",
				)}
			>
				<Sun className="h-3.5 w-3.5" />
			</button>
			<button
				type="button"
				onClick={() => setTheme("dark")}
				className={cn(
					"flex h-6 w-6 items-center justify-center rounded-full transition-colors",
					theme === "dark"
						? "bg-fd-muted text-fd-foreground shadow-sm"
						: "text-fd-muted-foreground hover:text-fd-foreground",
				)}
			>
				<Moon className="h-3.5 w-3.5" />
			</button>
		</div>
	);
}

function SidebarSection({
	node,
	onHover,
}: {
	node: PageTreeItem;
	onHover: (rect: { top: number; left: number; width: number; height: number } | null) => void;
}) {
	if (node.type === "separator") {
		return (
			<div className="mt-4 mb-1.5 px-2">
				<h4 className="font-semibold text-fd-muted-foreground/60 text-[10px] uppercase tracking-[0.05em]">
					{node.name as string}
				</h4>
			</div>
		);
	}

	if (node.type === "folder") {
		return (
			<SidebarFolder
				node={node}
				onHover={onHover}
			/>
		);
	}

	return (
		<SidebarLink
			node={node}
			onHover={onHover}
		/>
	);
}

import { useRef } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

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
	onHover,
}: {
	node: FolderNode;
	onHover: (rect: { top: number; left: number; width: number; height: number } | null) => void;
}) {
	const pathname = usePathname();
	const ref = useRef<HTMLButtonElement>(null);

	const isChildActive = (item: PageTreeItem): boolean => {
		if (item.type === "page") return item.url === pathname;
		if (item.type === "folder") return item.children.some(isChildActive);
		return false;
	};

	const isActive = node.children.some(isChildActive);
	const [isOpen, setIsOpen] = useState(isActive);
	const router = useRouter();

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
				data-active={isActive}
				onPointerEnter={() => {
					if (ref.current && ref.current.parentElement?.parentElement) {
						const navEl = ref.current.closest('nav');
						if (navEl) {
							const navBox = navEl.getBoundingClientRect();
							const activeBox = ref.current.getBoundingClientRect();
							onHover({
								top: activeBox.top - navBox.top + navEl.scrollTop,
								left: activeBox.left - navBox.left + navEl.scrollLeft,
								width: activeBox.width,
								height: activeBox.height,
							});
						}
					}
				}}
				className={cn(
					"group flex h-9 w-full items-center justify-between rounded-lg px-2 font-medium text-sm transition-all",
					isActive
						? "border-1.5 border-fd-foreground text-fd-foreground shadow-sm"
						: "text-fd-muted-foreground hover:text-fd-foreground",
				)}
			>
				<div className="relative z-10 flex w-full items-center gap-2 text-left">
					{node.icon && (
						<span
							className={cn(
								"flex h-4 w-4 shrink-0 items-center justify-center transition-colors",
								isActive ? "text-fd-foreground" : "text-fd-muted-foreground",
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
						isActive ? "text-fd-foreground" : "text-fd-muted-foreground/40 group-hover:text-fd-foreground",
						isOpen && "rotate-90",
					)}
				/>
			</button>

			{isOpen && (
				<div className={cn(
					"mt-px flex flex-col space-y-px",
					isActive ? "pl-0" : "pl-3 border-l border-fd-border/50 ml-3.5"
				)}>
					{node.children.map((child: PageTreeItem, index: number) => (
						<SidebarLink
							key={index}
							node={child}
							onHover={onHover}
						/>
					))}
				</div>
			)}
		</div>
	);
}

function SidebarLink({
	node,
	onHover,
}: {
	node: PageTreeItem;
	onHover: (rect: { top: number; left: number; width: number; height: number } | null) => void;
}) {
	const pathname = usePathname();
	const ref = useRef<HTMLAnchorElement>(null);

	if (node.type === "separator") return null;
	if (node.type === "folder") {
		return (
			<SidebarFolder
				node={node}
				onHover={onHover}
			/>
		);
	}

	const linkId = node.url;
	const isActive = pathname === linkId || (linkId === "/" && pathname === "");

	return (
		<Link
			ref={ref}
			href={linkId}
			data-active={isActive}
			onPointerEnter={() => {
				if (ref.current) {
					const navEl = ref.current.closest('nav');
					if (navEl) {
						const navBox = navEl.getBoundingClientRect();
						const activeBox = ref.current.getBoundingClientRect();
						onHover({
							top: activeBox.top - navBox.top + navEl.scrollTop,
							left: activeBox.left - navBox.left + navEl.scrollLeft,
							width: activeBox.width,
							height: activeBox.height,
						});
					}
				}
			}}
			className={cn(
				"group flex h-8 items-center gap-2 rounded-lg px-2 font-medium text-sm transition-colors",
				isActive ? "text-fd-foreground" : "text-fd-muted-foreground hover:text-fd-foreground",
			)}
		>
			<div className="relative z-10 flex w-full items-center gap-2 text-left">
				{node.icon && (
					<span
						className={cn(
							"flex h-3.5 w-3.5 shrink-0 items-center justify-center transition-colors",
							isActive ? "text-fd-foreground" : "text-fd-muted-foreground",
						)}
					>
						{node.icon}
					</span>
				)}
				<span className="truncate">{node.name as string}</span>
			</div>
		</Link>
	);
}
