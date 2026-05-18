"use client";

import { cn } from "@reloop/fe-docs/lib/cn";
import type { TOCItem } from "@reloop/fe-docs/lib/types";
import { Icon } from "@reloop/ui/icon";
import { useEffect, useState } from "react";

interface TOCProps {
	items: TOCItem[];
}

export function TableOfContents({ items }: TOCProps) {
	const [activeId, setActiveId] = useState<string | null>(null);

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
		<div id="docs-toc" className="hidden text-sm xl:block">
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
						const isActive = activeId === item.url.slice(1);
						return (
							<li
								key={item.url}
								className={cn("transition-colors", item.depth > 2 && "ml-3")}
							>
								<a
									href={item.url}
									className={cn(
										"-ml-px inline-block border-l-2 py-1 pl-3 text-[13px] no-underline transition-colors",
										isActive
											? "border-[#171717] dark:border-white font-medium text-[#171717] dark:text-white"
											: "border-transparent text-text-sub-600 hover:border-black/30 dark:hover:border-white/30 hover:text-[#171717] dark:hover:text-white",
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
