"use client";

import { cn } from "@reloop/fe-docs/lib/cn";
import type { TOCItem } from "@reloop/fe-docs/lib/types";
import { List } from "lucide-react";
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
		<div id="nd-toc" className="hidden text-sm xl:block">
			<div className="sticky top-20 pt-4">
				<div
					id="toc-title"
					className="mb-3 flex items-center gap-1.5 font-medium text-[13px] text-fd-foreground/60"
				>
					<List className="h-3.5 w-3.5" />
					On this page
				</div>

				<ul className="m-0 flex list-none flex-col gap-0.5 border-fd-border border-l pl-0">
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
											? "border-fd-primary font-medium text-fd-foreground"
											: "border-transparent text-fd-muted-foreground hover:border-fd-foreground/30 hover:text-fd-foreground",
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
