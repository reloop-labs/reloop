"use client";

import * as React from "react";
import { useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@reloop/ui/cn";
import type { FolderNode, PageTreeItem } from "@reloop/fe-docs/lib/types";
import { useSidebarContext } from "./sidebar";
import { isActive as checkIsActive } from "../../lib/is-active";

export function ApiSidebarFolder({
	node,
	onLinkClick,
	depth = 0,
}: {
	node: FolderNode;
	onLinkClick?: () => void;
	depth?: number;
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
					"group relative z-10 flex w-full items-center justify-between rounded-lg px-2 font-medium transition-all",
					depth === 0 ? "h-9 text-[15px]" : "h-8 text-[14px]",
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
						<div className="mt-px flex flex-col space-y-px pb-0.5 pl-4 border-l border-stroke-soft-100/30 ml-4">
							{node.children.map((child: PageTreeItem, index: number) => (
								<ApiSidebarSection
									key={index}
									node={child}
									onLinkClick={onLinkClick}
									depth={depth + 1}
								/>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export function ApiSidebarLink({
	node,
	onLinkClick,
	depth = 0,
}: {
	node: PageTreeItem;
	onLinkClick?: () => void;
	depth?: number;
}) {
	const ref = useRef<HTMLAnchorElement>(null);
	const { setHoveredEl, pathname } = useSidebarContext();

	if (node.type === "separator") return null;
	if (node.type === "folder") {
		return <ApiSidebarFolder node={node} onLinkClick={onLinkClick} depth={depth} />;
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
				"group relative z-10 flex items-center gap-2 rounded-lg px-2 transition-colors",
				depth === 0 ? "h-9 text-[15px]" : "h-8 text-[14px]",
				isActive
					? "text-[#171717] dark:text-white"
					: "text-text-sub-600 hover:text-[#171717] dark:hover:text-white",
			)}
		>
			<div className="relative z-10 grid grid-cols-[40px_1fr] gap-4 w-full items-center text-left">
				{node.method ? (
					<p
						className={cn(
							"inline-flex w-fit shrink-0 items-center justify-self-start rounded-[4px] px-1.5 py-[1.5px] font-semibold text-[10px] uppercase leading-tight tracking-wide",
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
							"flex h-3.5 w-3.5 shrink-0 items-center justify-center justify-self-start transition-colors",
							isActive
								? "text-[#171717] dark:text-white"
								: "text-text-sub-600 opacity-70",
						)}
					>
						{node.icon}
					</span>
				) : (
					<div className="w-10 shrink-0" />
				)}
				<span className="truncate font-medium">{node.name as string}</span>
			</div>
		</Link>
	);
}

export function ApiSidebarSection({
	node,
	onLinkClick,
	depth = 0,
}: {
	node: PageTreeItem;
	onLinkClick?: () => void;
	depth?: number;
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
		return <ApiSidebarFolder node={node} onLinkClick={onLinkClick} depth={depth} />;
	}

	return <ApiSidebarLink node={node} onLinkClick={onLinkClick} depth={depth} />;
}
