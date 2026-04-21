"use client";

import { ScrollArea } from "@reloop/fe-docs/components/ui/scroll-area";
import { cn } from "@reloop/fe-docs/lib/cn";
import type { PageNode, PageTreeItem } from "@reloop/fe-docs/lib/types";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface SidebarProps {
	tree: PageTreeItem[];
}

export function Sidebar({ tree }: SidebarProps) {
	return (
		<aside className="-ml-2 fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
			<ScrollArea className="h-full py-6 pr-6 lg:py-8">
				<div className="flex flex-col gap-4">
					{tree.map((node, index) => (
						<SidebarNode key={index} node={node} level={0} />
					))}
				</div>
			</ScrollArea>
		</aside>
	);
}

function SidebarNode({ node, level }: { node: PageTreeItem; level: number }) {
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(true);

	if (node.type === "separator") {
		return (
			<div className="mt-4 first:mt-0">
				<h4 className="mb-1 rounded-md px-2 py-1 font-semibold text-muted-foreground/70 text-sm uppercase tracking-wider">
					{node.name}
				</h4>
			</div>
		);
	}

	if (node.type === "folder") {
		return (
			<div className="flex flex-col gap-1">
				<button
					onClick={() => setIsOpen(!isOpen)}
					className="flex w-full items-center justify-between rounded-md px-2 py-1.5 font-medium text-sm hover:bg-accent hover:text-accent-foreground"
				>
					<span className="flex items-center gap-2">
						{node.icon && <span className="text-primary">{node.icon}</span>}
						{node.name}
					</span>
					<ChevronRight
						className={cn(
							"h-4 w-4 transition-transform",
							isOpen && "rotate-90",
						)}
					/>
				</button>
				{isOpen && (
					<div className="ml-4 flex flex-col gap-1 border-l pl-2">
						{node.children.map((child: PageTreeItem, index: number) => (
							<SidebarNode key={index} node={child} level={level + 1} />
						))}
					</div>
				)}
			</div>
		);
	}

	if (node.type === "page") {
		const isActive = pathname === node.url;
		return (
			<Link
				href={node.url}
				className={cn(
					"flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
					isActive
						? "bg-primary/10 font-semibold text-primary"
						: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
				)}
			>
				{node.icon && <span className="opacity-80">{node.icon}</span>}
				{node.name}
			</Link>
		);
	}

	return null;
}
