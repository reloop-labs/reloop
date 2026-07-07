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

export function DefaultSidebarFolder({
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

	const isLanguageFolder = node.url.startsWith("/examples/");

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
						? "text-primary-base"
						: isParentActive
							? "text-primary-base"
							: "text-text-sub-600 hover:text-primary-base",
				)}
			>
				<div className="relative z-10 flex w-full items-center gap-2 text-left min-w-0">
					{!isLanguageFolder && node.icon && (
						<span
							className={cn(
								"flex h-4 w-4 shrink-0 items-center justify-center transition-colors",
								isActive
									? "text-primary-base"
									: "text-text-sub-600 opacity-70 group-hover:text-primary-base group-hover:opacity-100",
							)}
						>
							{node.icon}
						</span>
					)}
					<span className="truncate">{node.name as string}</span>
				</div>
				<div className="relative z-10 flex items-center gap-1.5 shrink-0">
					{isLanguageFolder && node.icon && (
						<span
							className={cn(
								"flex h-4 w-4 shrink-0 items-center justify-center transition-colors",
								isActive
									? "text-primary-base"
									: "text-text-sub-600 opacity-70 group-hover:text-primary-base group-hover:opacity-100",
							)}
						>
							{node.icon}
						</span>
					)}
					<ChevronRight
						className={cn(
							"h-3.5 w-3.5 transition-transform duration-200",
							isActive
								? "text-primary-base"
								: "text-text-sub-600 opacity-50 group-hover:text-primary-base",
							isOpen && "rotate-90",
						)}
					/>
				</div>
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
						<div className="mt-px flex flex-col space-y-px border-stroke-soft-100/30 border-l pb-0.5 pl-3">
							{node.children.map((child: PageTreeItem, index: number) => (
								<DefaultSidebarSection
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

export function DefaultSidebarLink({
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
			<DefaultSidebarFolder
				node={node}
				onLinkClick={onLinkClick}
				depth={depth}
			/>
		);
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
					? "text-primary-base"
					: "text-text-sub-600 hover:text-primary-base",
			)}
		>
			<div className="relative z-10 flex w-full items-center gap-2 text-left">
				{node.icon && (
					<span
						className={cn(
							"flex h-3.5 w-3.5 shrink-0 items-center justify-center transition-colors",
							isActive
								? "text-primary-base"
								: "text-text-sub-600 opacity-70 group-hover:text-primary-base group-hover:opacity-100",
						)}
					>
						{node.icon}
					</span>
				)}
				<span className="truncate font-medium">{node.name as string}</span>
			</div>
		</Link>
	);
}

export function DefaultSidebarSection({
	node,
	onLinkClick,
	depth = 0,
}: {
	node: PageTreeItem;
	onLinkClick?: () => void;
	depth?: number;
}) {
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
		if (depth === 0) {
			const name = node.name as string;
			const id = name.toLowerCase().replace(/\s+/g, "-");
			return (
				<div className="space-y-px">
					<div id={id} className="mt-4 mb-1.5 scroll-mt-8 px-2">
						<h4 className="font-semibold text-sm uppercase">{name}</h4>
					</div>
					<div className="mt-px flex flex-col space-y-px border-stroke-soft-100/30 pb-0.5">
						{node.children.map((child: PageTreeItem, index: number) => (
							<DefaultSidebarSection
								key={index}
								node={child}
								onLinkClick={onLinkClick}
								depth={depth + 1}
							/>
						))}
					</div>
				</div>
			);
		}

		return (
			<DefaultSidebarFolder
				node={node}
				onLinkClick={onLinkClick}
				depth={depth}
			/>
		);
	}

	return (
		<DefaultSidebarLink node={node} onLinkClick={onLinkClick} depth={depth} />
	);
}
