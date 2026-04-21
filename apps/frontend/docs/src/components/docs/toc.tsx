"use client";

import { cn } from "@reloop/fe-docs/lib/cn";
import type { TOCItem } from "@reloop/fe-docs/lib/types";
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
		<div className="hidden text-sm xl:block">
			<div className="-mt-10 sticky top-16 pt-4">
				<div className="mb-4 font-semibold text-foreground text-sm uppercase tracking-wider">
					On This Page
				</div>
				<ul className="m-0 flex list-none flex-col gap-2">
					{items.map((item) => (
						<li
							key={item.url}
							className={cn("transition-colors", item.depth > 2 && "ml-4")}
						>
							<a
								href={item.url}
								className={cn(
									"inline-block no-underline",
									activeId === item.url.slice(1)
										? "font-medium text-primary"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								{item.title}
							</a>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
