"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/cn";
import type { PageTreeItem } from "../../lib/types";

interface SidebarProps {
	tree: PageTreeItem[];
}

export function Sidebar({ tree }: SidebarProps) {
	return (
		<aside className="z-30 hidden h-full w-60 shrink-0 flex-col border-[#f5f5f5] border-r bg-[#fafafa]/30 md:flex">
			{/* Search button area - matches dashboard top section padding */}
			<div className="flex h-12 items-center border-[#f5f5f5] border-b px-3">
				<button
					type="button"
					className="flex h-8 w-full items-center gap-2 rounded-lg border border-[#ebebeb] bg-white px-2.5 text-[#5c5c5c] text-xs transition-all hover:border-[#d1d1d1] hover:shadow-sm"
				>
					<Search className="h-3.5 w-3.5" />
					<span className="flex-1 text-left">Search...</span>
					<kbd className="pointer-events-none hidden h-5 select-none items-center gap-0.5 rounded border border-[#ebebeb] bg-[#f5f5f5] px-1.5 font-medium font-mono text-[10px] sm:inline-flex">
						<span className="text-xs">⌘</span>K
					</kbd>
				</button>
			</div>

			{/* Navigation tree - matches dashboard sidebar-items area */}
			<nav className="flex-1 overflow-y-auto p-2">
				<div className="flex flex-col gap-4">
					{tree.map((node, index) => (
						<SidebarSection key={index} node={node} />
					))}
				</div>
			</nav>
		</aside>
	);
}

function SidebarSection({ node }: { node: PageTreeItem }) {
	if (node.type === "separator") {
		return (
			<div className="space-y-0.5">
				<h4 className="px-2 py-1 font-semibold text-[#a3a3a3] text-[11px] uppercase tracking-wider">
					{node.name}
				</h4>
			</div>
		);
	}

	if (node.type === "folder") {
		return (
			<div className="space-y-0.5">
				<h4 className="px-2 py-1 font-semibold text-[#a3a3a3] text-[11px] uppercase tracking-wider">
					{node.name}
				</h4>
				<div className="space-y-px">
					{node.children.map((child: PageTreeItem, index: number) => (
						<SidebarLink key={index} node={child} />
					))}
				</div>
			</div>
		);
	}

	return <SidebarLink node={node} />;
}

function SidebarLink({ node }: { node: PageTreeItem }) {
	const pathname = usePathname();

	if (node.type === "separator") return null;
	if (node.type === "folder") {
		return (
			<div className="mt-3 space-y-0.5">
				<h4 className="px-2 py-1 font-semibold text-[#a3a3a3] text-[11px] uppercase tracking-wider">
					{node.name}
				</h4>
				<div className="space-y-px">
					{node.children.map((child: PageTreeItem, index: number) => (
						<SidebarLink key={index} node={child} />
					))}
				</div>
			</div>
		);
	}

	const isActive = pathname === node.url;

	return (
		<Link
			href={node.url}
			className={cn(
				"group flex h-8 items-center gap-2 rounded-lg px-2 font-medium text-sm transition-colors",
				isActive
					? "bg-[#a3a3a31a] text-[#171717]"
					: "text-[#5c5c5c] hover:bg-[#a3a3a30d] hover:text-[#171717]",
			)}
		>
			{node.icon && (
				<span
					className={cn(
						"flex h-3.5 w-3.5 shrink-0 items-center justify-center transition-colors",
						isActive
							? "text-[#171717]"
							: "text-[#5c5c5c] opacity-90 group-hover:text-[#171717]",
					)}
				>
					{node.icon}
				</span>
			)}
			<span className="truncate">{node.name}</span>
		</Link>
	);
}
