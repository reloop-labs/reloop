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
}: {
	items: BlogTocItem[];
	className?: string;
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
					.sort(
						(a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
					);

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
		<nav
			aria-label="Table of contents"
			className={cn("w-max", className)}
		>
			<ul className="m-0 flex list-none flex-col gap-3 p-0">
				{items.map((item) => {
					const id = getHeadingId(item.url);
					const isActive = activeId === id;

					return (
						<li key={id}>
							<a
								href={item.url}
								onClick={(e) => handleScrollTo(e, id, setActiveId)}
								className={cn(
									"group flex min-w-0 items-center gap-3 no-underline transition-colors",
									isActive
										? "text-primary-base"
										: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/45 dark:hover:text-white",
								)}
							>
								<span
									className={cn(
										"h-px w-4 shrink-0 transition-colors",
										isActive
											? "bg-primary-base"
											: "bg-text-sub-600/40 dark:bg-white/25",
									)}
									aria-hidden="true"
								/>
								<span
									className={cn(
										"text-[13px] leading-none whitespace-nowrap",
										isActive && "font-medium",
									)}
									title={item.title}
								>
									{item.title}
								</span>
							</a>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
