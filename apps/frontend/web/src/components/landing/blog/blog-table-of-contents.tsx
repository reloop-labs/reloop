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

function useActiveHeading(
	items: BlogTocItem[],
): [string, (id: string) => void] {
	const [activeId, setActiveId] = useState("");

	useEffect(() => {
		if (items.length === 0) return;

		const ids = items.map((item) => getHeadingId(item.url));
		const elements = ids
			.map((id) => document.getElementById(id))
			.filter((el): el is HTMLElement => el !== null);

		if (elements.length === 0) return;

		// The active heading is the last one scrolled above 30% of the viewport,
		// so it stays correct after jumps that skip headings entirely.
		let frame = 0;
		const update = () => {
			frame = 0;
			const line = window.innerHeight * 0.3;
			let current = elements[0]?.id ?? "";
			for (const element of elements) {
				if (element.getBoundingClientRect().top > line) break;
				current = element.id;
			}
			setActiveId(current);
		};
		const onScroll = () => {
			if (!frame) frame = requestAnimationFrame(update);
		};

		const hash = window.location.hash.replace("#", "");
		if (hash && ids.includes(hash)) {
			setActiveId(hash);
		} else {
			update();
		}

		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll);
		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
			cancelAnimationFrame(frame);
		};
	}, [items]);

	return [activeId, setActiveId];
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
	const [activeId, setActiveId] = useActiveHeading(items);

	if (items.length === 0) return null;

	return (
		<nav aria-label="Table of contents" className={cn("w-full", className)}>
			{showHeader ? (
				<h2 className="mb-3 font-medium font-mono text-[11px] text-text-sub-600 uppercase tracking-widest dark:text-white/45">
					On this page
				</h2>
			) : null}
			<ul className="m-0 flex list-none flex-col gap-2 p-0">
				{items.map((item) => {
					const id = getHeadingId(item.url);
					const isActive = activeId === id;

					return (
						<li key={id}>
							<a
								href={item.url}
								onClick={(e) => handleScrollTo(e, id, setActiveId)}
								className={cn(
									"block border-l-2 py-0.5 pl-3 font-normal text-xs leading-relaxed transition-colors",
									isActive
										? "border-text-strong-950 text-text-strong-950 dark:border-white dark:text-white"
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

/**
 * Compact table of contents for the page edge: one short line per heading,
 * expanding into a titled list on hover or keyboard focus.
 */
export function BlogTocRail({
	items,
	className,
}: {
	items: BlogTocItem[];
	className?: string;
}) {
	const [activeId, setActiveId] = useActiveHeading(items);

	if (items.length === 0) return null;

	return (
		<nav
			aria-label="Table of contents"
			className={cn("group/toc relative flex justify-end", className)}
		>
			<ul
				aria-hidden="true"
				className="m-0 flex list-none flex-col items-end gap-[14px] p-3 transition-opacity duration-200 group-focus-within/toc:opacity-0 group-hover/toc:opacity-0"
			>
				{items.map((item) => {
					const id = getHeadingId(item.url);
					const isActive = activeId === id;

					return (
						<li
							key={id}
							className={cn(
								"h-[2px] rounded-full transition-all duration-300",
								isActive
									? "w-5 bg-text-strong-950 dark:bg-white"
									: "w-4 bg-text-soft-400/50 dark:bg-white/25",
							)}
						/>
					);
				})}
			</ul>

			<div className="-translate-y-1/2 pointer-events-none invisible absolute top-1/2 right-0 w-[280px] origin-right scale-95 opacity-0 transition-[opacity,transform,visibility] duration-200 ease-out group-focus-within/toc:pointer-events-auto group-focus-within/toc:visible group-focus-within/toc:scale-100 group-focus-within/toc:opacity-100 group-hover/toc:pointer-events-auto group-hover/toc:visible group-hover/toc:scale-100 group-hover/toc:opacity-100">
				<ul className="m-0 flex max-h-[calc(100dvh-10rem)] list-none flex-col overflow-y-auto rounded-2xl border border-stroke-soft-200 bg-white p-2 dark:border-white/10 dark:bg-bg-weak-50">
					{items.map((item) => {
						const id = getHeadingId(item.url);
						const isActive = activeId === id;

						return (
							<li key={id}>
								<a
									href={item.url}
									onClick={(e) => handleScrollTo(e, id, setActiveId)}
									title={item.title}
									className={cn(
										"flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] leading-snug transition-colors hover:bg-bg-weak-50 dark:hover:bg-white/[0.05]",
										isActive
											? "font-medium text-text-strong-950 dark:text-white"
											: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white",
									)}
								>
									<span
										aria-hidden="true"
										className={cn(
											"size-1 shrink-0 rounded-full",
											isActive
												? "bg-text-strong-950 dark:bg-white"
												: "bg-transparent",
										)}
									/>
									<span className="truncate">{item.title}</span>
								</a>
							</li>
						);
					})}
				</ul>
			</div>
		</nav>
	);
}
