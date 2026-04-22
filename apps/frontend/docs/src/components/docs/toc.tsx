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
		const observer = new IntersectionObserver(
			(entries) => {
				const visibleEntry = entries.find((entry) => entry.isIntersecting);
				if (visibleEntry) {
					setActiveId(visibleEntry.target.id);
				}
			},
			{ rootMargin: "0% 0% -80% 0%" },
		);

		for (const item of items) {
			const element = document.getElementById(item.url.slice(1));
			if (element) observer.observe(element);
		}

		return () => observer.disconnect();
	}, [items]);

	if (items.length === 0) return null;

	return (
		<div id="nd-toc" className="hidden text-sm xl:block">
			<div className="sticky top-20 pt-4">
				<div id="toc-title" className="mb-3 flex items-center gap-1.5 text-[13px] font-medium text-fd-foreground/60">
					<List className="h-3.5 w-3.5" />
					On this page
				</div>

				<ul className="m-0 flex list-none flex-col gap-0.5 border-l border-fd-border pl-0">
					{items.map((item) => {
						const isActive = activeId === item.url.slice(1);
						return (
							<li
								key={item.url}
								className={cn(
									"transition-colors",
									item.depth > 2 && "ml-3",
								)}
							>
								<a
									href={item.url}
									className={cn(
										"inline-block py-1 pl-3 text-[13px] no-underline transition-colors border-l-2 -ml-px",
										isActive
											? "border-fd-primary font-medium text-fd-foreground"
											: "border-transparent text-fd-muted-foreground hover:text-fd-foreground hover:border-fd-foreground/30",
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
