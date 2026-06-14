"use client";

import { cn } from "@reloop/fe-docs/lib/cn";
import type { TOCItem } from "@reloop/fe-docs/lib/types";
import { Icon } from "@reloop/ui/icon";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

interface TOCProps {
	items: TOCItem[];
}

export function TableOfContents({ items }: TOCProps) {
	const [activeId, setActiveId] = useState<string | null>(null);

	const activeIds = useMemo(() => {
		const ids = new Set<string>();
		if (!activeId) return ids;

		const activeIndex = items.findIndex(
			(item) => item.url.slice(1) === activeId,
		);
		if (activeIndex !== -1) {
			ids.add(activeId);
			const activeItem = items[activeIndex];
			if (activeItem && activeItem.depth > 2) {
				for (let i = activeIndex - 1; i >= 0; i--) {
					const item = items[i];
					if (item && item.depth === 2) {
						ids.add(item.url.slice(1));
						break;
					}
				}
			}
		}
		return ids;
	}, [activeId, items]);

	useEffect(() => {
		const handleScroll = () => {
			const headingElements = items
				.map((item) => document.getElementById(item.url.slice(1)))
				.filter(Boolean) as HTMLElement[];

			if (headingElements.length === 0) return;

			const pageEl = document.getElementById("nd-page");
			if (pageEl) {
				const isAtBottom =
					pageEl.scrollHeight - pageEl.scrollTop <= pageEl.clientHeight + 10;
				if (isAtBottom && headingElements.length > 0) {
					const lastElement = headingElements[headingElements.length - 1];
					if (lastElement) {
						setActiveId(lastElement.id);
						return;
					}
				}
			}

			let currentActive = headingElements[0]?.id || null;
			for (const el of headingElements) {
				if (el.getBoundingClientRect().top <= 120) {
					currentActive = el.id;
				}
			}

			if (currentActive) setActiveId(currentActive);
		};

		const pageEl = document.getElementById("nd-page");
		if (pageEl) {
			pageEl.addEventListener("scroll", handleScroll, { passive: true });
			// Give the DOM a tiny bit to render first
			setTimeout(handleScroll, 100);
		}

		return () => {
			if (pageEl) {
				pageEl.removeEventListener("scroll", handleScroll);
			}
		};
	}, [items]);

	if (items.length === 0) return null;

	return (
		<div
			id="docs-toc"
			className="ml-auto hidden w-fit max-w-[240px] text-sm xl:block"
		>
			<div className="sticky top-0">
				<div
					id="docs-toc-title"
					className="mb-3 flex items-center gap-1.5 font-medium text-[12px] text-text-sub-600 uppercase tracking-wider"
				>
					<Icon name="menu-2" className="h-4 w-4 opacity-70" />
					On this page
				</div>

				<ul className="m-0 flex list-none flex-col gap-0.5 border-stroke-soft-100 border-l pl-0">
					{items.map((item) => {
						const isPrimaryActive = item.url.slice(1) === activeId;
						const isActive = activeIds.has(item.url.slice(1));
						const isSubItem = item.depth > 2;
						return (
							<li key={item.url} className="relative transition-colors">
								{isActive && (
									<motion.div
										layoutId={
											isPrimaryActive ? "toc-active-indicator" : undefined
										}
										className="absolute top-0 bottom-0 left-[-1px] w-0.5 bg-[#171717] dark:bg-white"
										transition={{ type: "spring", stiffness: 350, damping: 30 }}
									/>
								)}
								<a
									href={item.url}
									className={cn(
										"block truncate py-1 font-medium text-[13px] no-underline transition-colors",
										isSubItem ? "pl-6" : "pl-3",
										isActive
											? "text-[#171717] dark:text-white"
											: "text-text-sub-600 hover:text-[#171717] dark:hover:text-white",
									)}
								>
									{item.title}
								</a>
							</li>
						);
					})}
				</ul>
			</div>
		</div>
	);
}
