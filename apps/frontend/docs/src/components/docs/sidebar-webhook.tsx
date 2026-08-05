"use client";

import type { FolderNode, PageTreeItem } from "@reloop/fe-docs/lib/types";
import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { isActive as checkIsActive } from "../../lib/is-active";
import { useSidebarContext } from "./sidebar";

/** Event-style titles look like `email.delivered` (dotted resource names). */
function isEventName(name: string): boolean {
	return name.includes(".");
}

export function WebhookSidebarFolder({
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
					depth === 0 ? "h-8 text-[14px]" : "h-7 text-[14px]",
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
									: "text-text-sub-600 opacity-70 group-hover:text-[#171717] group-hover:opacity-100 dark:group-hover:text-white",
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
								<WebhookSidebarSection
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

export function WebhookSidebarLink({
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
			<WebhookSidebarFolder
				node={node}
				onLinkClick={onLinkClick}
				depth={depth}
			/>
		);
	}

	const linkId = node.url;
	const isActive = checkIsActive(linkId, pathname, false);
	const name = String(node.name ?? "");
	const showDot = isEventName(name);

	// Match API Reference link row: same height, weight, and active colors.
	// Event rows get a green status dot (like a GET method chip, simplified).
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
				depth === 0 ? "h-8 text-[14px]" : "h-7 text-[14px]",
				showDot
					? isActive
						? "text-green-700 dark:text-green-300"
						: "text-text-sub-600"
					: isActive
						? "text-[#171717] dark:text-white"
						: "text-text-sub-600 hover:text-[#171717] dark:hover:text-white",
			)}
		>
			<div className="relative z-10 flex w-full min-w-0 items-center gap-1.5 text-left">
				{showDot ? (
					<span
						className={cn(
							"size-1.5 shrink-0 rounded-full transition-all",
							isActive
								? "bg-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.18)]"
								: "bg-green-500/70 group-hover:bg-green-500 group-hover:shadow-[0_0_0_3px_rgba(34,197,94,0.12)]",
						)}
						aria-hidden
					/>
				) : node.icon ? (
					<span
						className={cn(
							"flex h-3.5 w-3.5 shrink-0 items-center justify-center transition-colors",
							isActive
								? "text-[#171717] dark:text-white"
								: "text-text-sub-600 opacity-70 group-hover:text-[#171717] group-hover:opacity-100 dark:group-hover:text-white",
						)}
					>
						{node.icon}
					</span>
				) : null}
				<span
					className={cn(
						"min-w-0 truncate font-medium transition-colors",
						showDot &&
							(isActive
								? "text-green-700 dark:text-green-300"
								: "group-hover:text-green-700 dark:group-hover:text-green-300"),
					)}
				>
					{name}
				</span>
			</div>
		</Link>
	);
}

export function WebhookSidebarSection({
	node,
	onLinkClick,
	depth = 0,
}: {
	node: PageTreeItem;
	onLinkClick?: () => void;
	depth?: number;
}) {
	// Section titles match API resource folders (e.g. "API KEY") — text-sm uppercase
	if (node.type === "separator") {
		const name = node.name as string;
		const id = name.toLowerCase().replace(/\s+/g, "-");
		return (
			<div id={id} className="mt-4 mb-1.5 scroll-mt-8 px-2">
				<h4 className="font-semibold text-sm uppercase">{name}</h4>
			</div>
		);
	}

	if (node.type === "folder") {
		// Flat like API: section label + children
		const hasDirectPages = node.children.some(
			(child) => child.type !== "folder",
		);
		const name = node.name as string;
		const id = name.toLowerCase().replace(/\s+/g, "-");
		return (
			<>
				{hasDirectPages && (
					<div id={id} className="mt-4 mb-1.5 scroll-mt-8 px-2">
						<h4 className="font-semibold text-sm uppercase">{name}</h4>
					</div>
				)}
				{node.children.map((child: PageTreeItem, index: number) => (
					<WebhookSidebarSection
						key={index}
						node={child}
						onLinkClick={onLinkClick}
						depth={0}
					/>
				))}
			</>
		);
	}

	return (
		<WebhookSidebarLink node={node} onLinkClick={onLinkClick} depth={depth} />
	);
}
