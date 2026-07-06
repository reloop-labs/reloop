"use client";

import type { GrosorySection } from "@reloop/web/lib/grosory-sections";
import { getSectionSlug } from "@reloop/web/lib/grosory-sections";
import Link from "next/link";
import { useEffect, useState } from "react";

export function GrosoryPageMain({ sections }: { sections: GrosorySection[] }) {
	const [activeSection, setActiveSection] = useState<string>("");

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActiveSection(entry.target.id);
					}
				}
			},
			{
				rootMargin: "-20% 0px -60% 0px", // Trigger when section is in the upper/middle viewport
				threshold: 0,
			},
		);

		for (const section of sections) {
			const slug = getSectionSlug(section.title);
			const el = document.getElementById(slug);
			if (el) observer.observe(el);
		}

		return () => observer.disconnect();
	}, [sections]);

	useEffect(() => {
		const handleHashChange = () => {
			const hash = window.location.hash.replace("#", "");
			if (hash) {
				const el = document.getElementById(hash);
				if (el) {
					const headerOffset = 100; // Offset for sticky header
					const elementPosition = el.getBoundingClientRect().top;
					const offsetPosition =
						elementPosition + window.scrollY - headerOffset;

					window.scrollTo({
						top: offsetPosition,
						behavior: "smooth",
					});
					setActiveSection(hash);
				}
			}
		};

		// Run on mount with a slight delay so browser layout is fully established
		const timer = setTimeout(handleHashChange, 150);

		window.addEventListener("hashchange", handleHashChange);
		return () => {
			clearTimeout(timer);
			window.removeEventListener("hashchange", handleHashChange);
		};
	}, []);

	const handleScrollTo = (
		e: React.MouseEvent<HTMLAnchorElement>,
		slug: string,
	) => {
		e.preventDefault();
		const el = document.getElementById(slug);
		if (el) {
			const headerOffset = 100; // Offset for sticky header
			const elementPosition = el.getBoundingClientRect().top;
			const offsetPosition = elementPosition + window.scrollY - headerOffset;

			window.scrollTo({
				top: offsetPosition,
				behavior: "smooth",
			});
			// Update URL hash without jumping the page
			window.history.pushState(null, "", `#${slug}`);
			setActiveSection(slug);
		}
	};

	return (
		<div className="mx-auto max-w-[1200px] px-6 py-8 lg:grid lg:grid-cols-[240px_1fr] lg:gap-10">
			{/* Left Column: Sticky Table of Contents (Desktop only) */}
			<aside className="hidden lg:block">
				<nav className="sticky top-28 max-h-[calc(100vh-10rem)] overflow-y-auto pr-4">
					<h2 className="mb-4 font-semibold text-[0.8rem] text-text-sub-600 uppercase tracking-[0.08em] dark:text-white/40">
						Browse by section
					</h2>
					<ul className="relative m-0 flex list-none flex-col gap-2.5 border-stroke-soft-200 border-l pl-0 dark:border-white/10">
						{sections.map((section) => {
							const slug = getSectionSlug(section.title);
							const isActive = activeSection === slug;
							return (
								<li key={section.title} className="relative">
									{isActive && (
										<div className="absolute top-0 bottom-0 left-[-1px] w-[2px] bg-primary-base transition-all" />
									)}
									<a
										href={`#${slug}`}
										onClick={(e) => handleScrollTo(e, slug)}
										className={`block py-0.5 pl-4 text-[0.92rem] leading-relaxed no-underline transition-colors ${
											isActive
												? "font-medium text-primary-base"
												: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
										}`}
									>
										{section.title}
									</a>
								</li>
							);
						})}
					</ul>
				</nav>
			</aside>

			{/* Right Column: Sections content */}
			<div className="space-y-16">
				{/* Mobile/Tablet Browse navigation */}
				<div className="lg:hidden">
					<nav
						aria-label="Browse by section"
						className="rounded-2xl border border-stroke-soft-200 bg-bg-soft-50 p-4 pr-5 dark:border-white/10 dark:bg-[#0a0a0a]"
					>
						<h2 className="mb-2.5 font-medium text-[0.85rem] text-text-sub-600 uppercase tracking-[0.08em] dark:text-white/40">
							Browse by section
						</h2>
						<ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-2 p-0">
							{sections.map((section) => {
								const slug = getSectionSlug(section.title);
								const isActive = activeSection === slug;
								return (
									<li key={section.title}>
										<a
											href={`#${slug}`}
											onClick={(e) => handleScrollTo(e, slug)}
											className={`text-[0.92rem] no-underline transition-colors hover:underline ${
												isActive
													? "font-medium text-primary-base"
													: "text-text-sub-600 hover:text-primary-base dark:text-white/60"
											}`}
										>
											{section.title}
										</a>
									</li>
								);
							})}
						</ul>
					</nav>
				</div>

				{sections.map((section) => {
					const slug = getSectionSlug(section.title);

					return (
						<section key={section.title} id={slug} className="scroll-mt-28">
							<div className="pb-10">
								<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
									<h2 className="font-serif text-[2.25rem] text-text-strong-950 leading-tight tracking-tight sm:text-[2.5rem] dark:text-white">
										<a
											href={`#${slug}`}
											onClick={(e) => handleScrollTo(e, slug)}
											className="no-underline transition-colors duration-200 hover:text-primary-base"
										>
											{section.title}
										</a>
										<span
											aria-hidden
											className="mt-1 block h-[3px] w-9 bg-primary-base"
										/>
									</h2>
									{section.hub && (
										<Link
											href={section.hub.href}
											className="shrink-0 text-primary-base text-sm hover:underline"
										>
											{section.hub.title} →
										</Link>
									)}
								</div>
								<ul className="mt-8 columns-1 gap-x-10 sm:columns-2 lg:columns-3">
									{section.links.map((link) => (
										<li key={link.href} className="mb-3 break-inside-avoid">
											<Link
												href={link.href}
												className="text-[15px] text-text-sub-600 leading-snug transition-colors hover:text-primary-base dark:text-white/60"
											>
												{link.title}
											</Link>
										</li>
									))}
								</ul>
							</div>
						</section>
					);
				})}
			</div>
		</div>
	);
}
