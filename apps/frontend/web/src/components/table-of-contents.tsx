"use client";

import type React from "react";
import { useEffect, useState } from "react";

interface Heading {
	id: string;
	text: string;
}

const slugify = (text: string) => {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)+/g, "");
};

function useHeadings() {
	const [headings, setHeadings] = useState<Heading[]>([]);
	const [activeId, setActiveId] = useState<string>("");

	useEffect(() => {
		const container = document.querySelector(".legal-content");
		if (!container) return;

		const sectionElements = Array.from(container.querySelectorAll("section"));
		const foundHeadings: Heading[] = [];

		for (const section of sectionElements) {
			const h2 = section.querySelector("h2");
			if (h2) {
				const text = h2.textContent || "";
				const slug = slugify(text);

				// Ensure the section has the correct ID and class for scroll margin
				section.id = slug;
				section.classList.add("scroll-mt-28");

				foundHeadings.push({ id: slug, text });
			}
		}

		setHeadings(foundHeadings);

		// Intersection Observer to highlight active heading
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id);
					}
				}
			},
			{
				rootMargin: "-20% 0px -60% 0px",
				threshold: 0,
			},
		);

		for (const section of sectionElements) {
			if (section.id) {
				observer.observe(section);
			}
		}

		// Initial hash checking for deep linking
		const handleHashChange = () => {
			const hash = window.location.hash.replace("#", "");
			if (hash) {
				const el = document.getElementById(hash);
				if (el) {
					const headerOffset = 100;
					const elementPosition = el.getBoundingClientRect().top;
					const offsetPosition =
						elementPosition + window.scrollY - headerOffset;

					window.scrollTo({
						top: offsetPosition,
						behavior: "smooth",
					});
					setActiveId(hash);
				}
			}
		};

		const timer = setTimeout(handleHashChange, 150);
		window.addEventListener("hashchange", handleHashChange);

		return () => {
			observer.disconnect();
			clearTimeout(timer);
			window.removeEventListener("hashchange", handleHashChange);
		};
	}, []);

	return { headings, activeId, setActiveId };
}

const handleScrollTo = (
	e: React.MouseEvent<HTMLAnchorElement>,
	id: string,
	setActiveId: (id: string) => void,
) => {
	e.preventDefault();
	const el = document.getElementById(id);
	if (el) {
		const headerOffset = 100;
		const elementPosition = el.getBoundingClientRect().top;
		const offsetPosition = elementPosition + window.scrollY - headerOffset;

		window.scrollTo({
			top: offsetPosition,
			behavior: "smooth",
		});
		window.history.pushState(null, "", `#${id}`);
		setActiveId(id);
	}
};

export function TableOfContents() {
	const { headings, activeId, setActiveId } = useHeadings();

	if (headings.length === 0) return null;

	return (
		<nav className="hidden w-full lg:block">
			<h2 className="mb-3 font-medium font-mono text-[11px] text-text-sub-600 uppercase tracking-widest dark:text-white/45">
				On this page
			</h2>
			<ul className="relative m-0 flex list-none flex-col gap-2 border-stroke-soft-200 border-l pl-0 dark:border-white/10">
				{headings.map((heading) => {
					const isActive = activeId === heading.id;
					return (
						<li key={heading.id} className="relative">
							{isActive && (
								<div className="absolute top-0 bottom-0 left-[-1px] w-[2px] bg-primary-base transition-all" />
							)}
							<a
								href={`#${heading.id}`}
								onClick={(e) => handleScrollTo(e, heading.id, setActiveId)}
								className={`block py-0.5 pl-3.5 text-xs leading-relaxed no-underline transition-colors ${
									isActive
										? "font-medium text-primary-base"
										: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
								}`}
							>
								{heading.text}
							</a>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}

export function MobileTableOfContents() {
	const { headings, activeId, setActiveId } = useHeadings();

	if (headings.length === 0) return null;

	return (
		<div className="mb-6 lg:hidden">
			<nav
				aria-label="On this page"
				className="rounded-xl border border-stroke-soft-200 bg-bg-soft-50 p-3.5 pr-4 dark:border-white/10 dark:bg-[#0a0a0a]"
			>
				<h2 className="mb-2 font-medium font-mono text-[11px] text-text-sub-600 uppercase tracking-widest dark:text-white/45">
					On this page
				</h2>
				<ul className="m-0 flex list-none flex-wrap gap-x-3.5 gap-y-1.5 p-0">
					{headings.map((heading) => {
						const isActive = activeId === heading.id;
						return (
							<li key={heading.id}>
								<a
									href={`#${heading.id}`}
									onClick={(e) => handleScrollTo(e, heading.id, setActiveId)}
									className={`text-xs no-underline transition-colors hover:underline ${
										isActive
											? "font-medium text-primary-base"
											: "text-text-sub-600 hover:text-primary-base dark:text-white/60"
									}`}
								>
									{heading.text}
								</a>
							</li>
						);
					})}
				</ul>
			</nav>
		</div>
	);
}
