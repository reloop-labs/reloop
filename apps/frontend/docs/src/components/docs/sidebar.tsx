"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/cn";
import type { PageTreeItem } from "../../lib/types";

interface SidebarProps {
	tree: PageTreeItem[];
}

import { useState } from "react";

export function Sidebar({ tree }: SidebarProps) {
	const [hoveredNodeName, setHoveredNodeName] = useState<string | null>(null);

	return (
		<aside className="z-30 hidden h-full w-60 shrink-0 flex-col border-fd-border border-r bg-fd-background/50 md:flex">
			{/* Search button area - matches dashboard top section padding */}
			<div className="flex h-12 items-center border-fd-border border-b px-3">
				<button
					type="button"
					className="flex h-8 w-full items-center gap-2 rounded-lg border border-fd-border bg-fd-background px-2.5 text-fd-muted-foreground text-xs transition-all hover:border-fd-foreground/20 hover:shadow-sm"
				>
					<Search className="h-3.5 w-3.5" />
					<span className="flex-1 text-left">Search...</span>
					<kbd className="pointer-events-none hidden h-5 select-none items-center gap-0.5 rounded border border-fd-border bg-fd-muted px-1.5 font-medium font-mono text-[10px] sm:inline-flex">
						<span className="text-xs">⌘</span>K
					</kbd>
				</button>
			</div>

			{/* Navigation tree - matches dashboard sidebar-items area */}
			<nav
				className="flex-1 overflow-y-auto p-2"
				onPointerLeave={() => setHoveredNodeName(null)}
			>
				<div className="flex flex-col gap-4">
					{tree.map((node, index) => (
						<SidebarSection
							key={index}
							node={node}
							hoveredNodeName={hoveredNodeName}
							setHoveredNodeName={setHoveredNodeName}
						/>
					))}
				</div>
			</nav>
		</aside>
	);
}

function SidebarSection({
	node,
	hoveredNodeName,
	setHoveredNodeName,
}: {
	node: PageTreeItem;
	hoveredNodeName: string | null;
	setHoveredNodeName: (name: string | null) => void;
}) {
	if (node.type === "separator") {
		return (
			<div className="space-y-0.5">
				<h4 className="px-2 py-1 font-semibold text-fd-muted-foreground text-[11px] uppercase tracking-wider">
					{node.name}
				</h4>
			</div>
		);
	}

	if (node.type === "folder") {
		return (
			<SidebarFolder
				node={node}
				hoveredNodeName={hoveredNodeName}
				setHoveredNodeName={setHoveredNodeName}
			/>
		);
	}

	return (
		<SidebarLink
			node={node}
			hoveredNodeName={hoveredNodeName}
			setHoveredNodeName={setHoveredNodeName}
		/>
	);
}

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { FolderNode } from "../../lib/types";

function SidebarFolder({
	node,
	hoveredNodeName,
	setHoveredNodeName,
}: {
	node: FolderNode;
	hoveredNodeName: string | null;
	setHoveredNodeName: (name: string | null) => void;
}) {
	const pathname = usePathname();

	const isChildActive = (item: PageTreeItem): boolean => {
		if (item.type === "page") return item.url === pathname;
		if (item.type === "folder") return item.children.some(isChildActive);
		return false;
	};

	const isActive = node.children.some(isChildActive);
	const [isOpen, setIsOpen] = useState(isActive);

	const isHovered = hoveredNodeName === node.name;

	return (
		<div className="space-y-px">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				onPointerEnter={() => setHoveredNodeName(node.name as string)}
				className={cn(
					"group relative flex h-8 w-full items-center justify-between rounded-lg px-2 font-medium text-[13px] transition-colors",
				)}
			>
				{isHovered && (
					<motion.div
						layoutId="sidebar-hover-bg"
						className="absolute inset-0 z-0 rounded-lg bg-fd-foreground/5"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15, ease: "easeOut" }}
					/>
				)}
				<div className="relative z-10 flex w-full items-center gap-2 text-left">
					{node.icon && (
						<span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center text-fd-muted-foreground opacity-90 transition-colors group-hover:text-fd-foreground">
							{node.icon}
						</span>
					)}
					<span
						className={cn(
							"truncate",
							isHovered ? "text-fd-foreground" : "text-fd-muted-foreground",
						)}
					>
						{node.name}
					</span>
				</div>
				<ChevronRight
					className={cn(
						"relative z-10 h-3.5 w-3.5 text-fd-muted-foreground transition-transform duration-200",
						isOpen && "rotate-90",
					)}
				/>
			</button>

			{isOpen && (
				<div className="mt-[2px] flex flex-col space-y-[2px] pl-3">
					{node.children.map((child: PageTreeItem, index: number) => (
						<SidebarLink
							key={index}
							node={child}
							hoveredNodeName={hoveredNodeName}
							setHoveredNodeName={setHoveredNodeName}
						/>
					))}
				</div>
			)}
		</div>
	);
}

function SidebarLink({
	node,
	hoveredNodeName,
	setHoveredNodeName,
}: {
	node: PageTreeItem;
	hoveredNodeName: string | null;
	setHoveredNodeName: (name: string | null) => void;
}) {
	const pathname = usePathname();

	if (node.type === "separator") return null;
	if (node.type === "folder") {
		return (
			<SidebarFolder
				node={node}
				hoveredNodeName={hoveredNodeName}
				setHoveredNodeName={setHoveredNodeName}
			/>
		);
	}

	const isActive = pathname === node.url;
	const isHovered = hoveredNodeName === node.name;

	return (
		<Link
			href={node.url}
			onPointerEnter={() => setHoveredNodeName(node.name as string)}
			className={cn(
				"group relative flex h-8 items-center gap-2 rounded-lg px-2 font-medium text-[13px] transition-colors",
				isActive ? "bg-fd-foreground/10 text-fd-foreground" : "",
			)}
		>
			{isHovered && !isActive && (
				<motion.div
					layoutId="sidebar-hover-bg"
					className="absolute inset-0 z-0 rounded-lg bg-fd-foreground/5"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.15, ease: "easeOut" }}
				/>
			)}
			<div className="relative z-10 flex w-full items-center gap-2 text-left">
				{node.icon && (
					<span
						className={cn(
							"flex h-3.5 w-3.5 shrink-0 items-center justify-center transition-colors",
							isActive || isHovered
								? "text-fd-foreground"
								: "text-fd-muted-foreground opacity-90",
						)}
					>
						{node.icon}
					</span>
				)}
				<span
					className={cn(
						"truncate",
						isActive || isHovered ? "text-fd-foreground" : "text-fd-muted-foreground",
					)}
				>
					{node.name}
				</span>
			</div>
		</Link>
	);
}
