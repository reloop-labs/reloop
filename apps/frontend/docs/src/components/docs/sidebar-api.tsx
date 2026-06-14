"use client";

import type { FolderNode, PageTreeItem } from "@reloop/fe-docs/lib/types";
import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useRef } from "react";
import { isActive as checkIsActive } from "../../lib/is-active";
import { useSidebarContext } from "./sidebar";

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
									: "text-text-sub-600 opacity-70 group-hover:text-[#171717] dark:group-hover:text-white group-hover:opacity-100",
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
						<div className="mt-px ml-4 flex flex-col space-y-px border-stroke-soft-100/30 border-l pb-0.5 pl-4">
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
		return (
			<ApiSidebarFolder node={node} onLinkClick={onLinkClick} depth={depth} />
		);
	}

	const linkId = node.url;
	const isActive = checkIsActive(linkId, pathname, false);

	// Derive per-method color classes so the entire row (badge + label) glows
	// in the method's semantic color when hovered or active.
	const methodTextActive: Record<string, string> = {
		GET: "text-green-700 dark:text-green-300",
		POST: "text-blue-700 dark:text-blue-300",
		DELETE: "text-red-600 dark:text-red-400",
		PATCH: "text-orange-700 dark:text-orange-300",
		PUT: "text-purple-700 dark:text-purple-300",
	};
	const methodTextHover: Record<string, string> = {
		GET: "group-hover:text-green-700 dark:group-hover:text-green-300",
		POST: "group-hover:text-blue-700 dark:group-hover:text-blue-300",
		DELETE: "group-hover:text-red-600 dark:group-hover:text-red-400",
		PATCH: "group-hover:text-orange-700 dark:group-hover:text-orange-300",
		PUT: "group-hover:text-purple-700 dark:group-hover:text-purple-300",
	};

	return (
		<Link
			ref={ref}
			href={linkId}
			onClick={onLinkClick}
			data-method={node.method ?? undefined}
			onPointerEnter={() => {
				if (ref.current) {
					setHoveredEl(ref.current);
				}
			}}
			data-sidebar-active={isActive || undefined}
			className={cn(
				"group relative z-10 flex items-center gap-2 rounded-lg px-2 transition-colors",
				depth === 0 ? "h-9 text-[15px]" : "h-8 text-[14px]",
				// Row-level text color: method-tinted when active, muted otherwise
				node.method
					? isActive
						? methodTextActive[node.method]
						: "text-text-sub-600"
					: isActive
						? "text-[#171717] dark:text-white"
						: "text-text-sub-600 hover:text-[#171717] dark:hover:text-white",
			)}
		>
			<div
				className={cn(
					"relative z-10 w-full items-center text-left",
					node.method || node.icon
						? "grid grid-cols-[40px_1fr] gap-4"
						: "flex gap-2",
				)}
			>
				{node.method ? (
					<p
						className={cn(
							"inline-flex w-fit shrink-0 items-center justify-self-start rounded-lg px-1.5 py-[3.5px] font-semibold text-[10px] uppercase leading-tight tracking-wide transition-all",
							node.method === "GET" &&
								(isActive
									? "bg-green-500 text-white dark:bg-green-500 dark:text-white"
									: "bg-green-500/15 text-green-600 opacity-90 group-hover:bg-green-500 group-hover:text-white group-hover:opacity-100 dark:bg-green-500/20 dark:text-green-400 dark:group-hover:bg-green-500 dark:group-hover:text-white"),
							node.method === "POST" &&
								(isActive
									? "bg-blue-500 text-white dark:bg-blue-500 dark:text-white"
									: "bg-blue-500/15 text-blue-600 opacity-90 group-hover:bg-blue-500 group-hover:text-white group-hover:opacity-100 dark:bg-blue-500/20 dark:text-blue-400 dark:group-hover:bg-blue-500 dark:group-hover:text-white"),
							node.method === "DELETE" &&
								(isActive
									? "bg-red-500 text-white dark:bg-red-500 dark:text-white"
									: "bg-red-500/15 text-red-500 opacity-90 group-hover:bg-red-500 group-hover:text-white group-hover:opacity-100 dark:bg-red-500/20 dark:text-red-400 dark:group-hover:bg-red-500 dark:group-hover:text-white"),
							node.method === "PATCH" &&
								(isActive
									? "bg-orange-500 text-white dark:bg-orange-500 dark:text-white"
									: "bg-orange-500/15 text-orange-600 opacity-90 group-hover:bg-orange-500 group-hover:text-white group-hover:opacity-100 dark:bg-orange-500/20 dark:text-orange-400 dark:group-hover:bg-orange-500 dark:group-hover:text-white"),
							node.method === "PUT" &&
								(isActive
									? "bg-purple-500 text-white dark:bg-purple-500 dark:text-white"
									: "bg-purple-500/15 text-purple-600 opacity-90 group-hover:bg-purple-500 group-hover:text-white group-hover:opacity-100 dark:bg-purple-500/20 dark:text-purple-400 dark:group-hover:bg-purple-500 dark:group-hover:text-white"),
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
								: "text-text-sub-600 opacity-70 group-hover:text-[#171717] dark:group-hover:text-white group-hover:opacity-100",
						)}
					>
						{node.icon}
					</span>
				) : null}
				<span
					className={cn(
						"truncate font-medium transition-colors",
						node.method
							? isActive
								? methodTextActive[node.method]
								: methodTextHover[node.method]
							: "",
					)}
				>
					{node.name as string}
				</span>
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
				<h4 className="font-semibold text-sm uppercase">
					{node.name as string}
				</h4>
			</div>
		);
	}

	if (node.type === "folder") {
		// Render all folders flat: a label followed by direct children, no collapsible nesting.
		const hasDirectPages = node.children.some(
			(child) => child.type !== "folder",
		);
		return (
			<>
				{hasDirectPages && (
					<div className="mt-4 mb-1.5 px-2">
						<h4 className="font-semibold text-sm uppercase">
							{node.name as string}
						</h4>
					</div>
				)}
				{node.children.map((child: PageTreeItem, index: number) => (
					<ApiSidebarSection
						key={index}
						node={child}
						onLinkClick={onLinkClick}
						depth={0}
					/>
				))}
			</>
		);
	}

	return <ApiSidebarLink node={node} onLinkClick={onLinkClick} depth={depth} />;
}
