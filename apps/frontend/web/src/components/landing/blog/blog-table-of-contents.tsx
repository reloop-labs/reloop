"use client";

import { cn } from "@reloop/ui/cn";
import type { BlogTocItem } from "@reloop/web/lib/landing/types";
import type React from "react";
import { useEffect, useState } from "react";

function getHeadingId(url: string) {
	return url.replace(/^#/, "");
}

function handleScrollTo(
	e: React.MouseEvent<HTMLAnchorElement>,
	id: string,
	setActiveId: (id: string) => void,
) {
	e.preventDefault();
	const el = document.getElementById(id);
	if (!el) return;

	const headerOffset = 96;
	const offsetPosition =
		el.getBoundingClientRect().top + window.scrollY - headerOffset;

	window.scrollTo({
		top: offsetPosition,
		behavior: "smooth",
	});
	window.history.pushState(null, "", `#${id}`);
	setActiveId(id);
}

export function BlogTableOfContents({
	items,
	className,
	showHeader = true,
}: {
	items: BlogTocItem[];
	className?: string;
	showHeader?: boolean;
}) {
	const [activeId, setActiveId] = useState("");

	useEffect(() => {
		if (items.length === 0) return;

		const ids = items.map((item) => getHeadingId(item.url));
		const elements = ids
			.map((id) => document.getElementById(id))
			.filter((el): el is HTMLElement => el !== null);

		if (elements.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

				if (visible[0]) {
					setActiveId(visible[0].target.id);
				}
			},
			{
				rootMargin: "-20% 0px -60% 0px",
				threshold: 0,
			},
		);

		for (const element of elements) {
			observer.observe(element);
		}

		const hash = window.location.hash.replace("#", "");
		if (hash && ids.includes(hash)) {
			setActiveId(hash);
		}

		return () => observer.disconnect();
	}, [items]);

	if (items.length === 0) return null;

	return (
		<nav aria-label="Table of contents" className={cn("w-full", className)}>
			{showHeader ? (
				<h2 className="mb-3 font-mono text-[11px] text-text-sub-600 dark:text-white/45 tracking-widest uppercase font-medium">
					On this page
				</h2>
			) : null}
			<ul className="m-0 flex list-none flex-col gap-2.5 p-0">
				{items.map((item) => {
					const id = getHeadingId(item.url);
					const isActive = activeId === id;

					return (
						<li key={id}>
							<a
								href={item.url}
								onClick={(e) => handleScrollTo(e, id, setActiveId)}
								className={cn(
									"block border-l-2 py-0.5 pl-3.5 text-[13px] leading-snug transition-colors",
									isActive
										? "border-text-strong-950 text-text-strong-950 font-medium dark:border-white dark:text-white"
										: "border-transparent text-text-sub-600 hover:text-text-strong-950 dark:text-white/45 dark:hover:text-white",
								)}
								title={item.title}
							>
								{item.title}
							</a>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
