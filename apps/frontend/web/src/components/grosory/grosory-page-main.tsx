"use client";

import * as Input from "@reloop/ui/input";
import { grosoryContentClass } from "@reloop/web/components/grosory/grosory-page-header";
import type { GrosorySection } from "@reloop/web/lib/grosory-sections";
import { getSectionSlug } from "@reloop/web/lib/grosory-sections";
import Link from "next/link";
import { useMemo, useState } from "react";

export function GrosoryPageMain({ sections }: { sections: GrosorySection[] }) {
	const [query, setQuery] = useState("");
	const normalizedQuery = query.trim().toLowerCase();

	const filteredSections = useMemo(() => {
		if (!normalizedQuery) return sections;

		return sections
			.map((section) => ({
				...section,
				links: section.links.filter((link) =>
					`${link.title} ${link.href}`.toLowerCase().includes(normalizedQuery),
				),
			}))
			.filter((section) => section.links.length > 0);
	}, [sections, normalizedQuery]);

	const hasResults = filteredSections.length > 0;

	return (
		<>
			<div className={`${grosoryContentClass} mt-6`}>
				<label htmlFor="grosory-search" className="sr-only">
					Search links
				</label>
				<Input.Root size="medium">
					<Input.Wrapper>
						<Input.Input
							id="grosory-search"
							type="search"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Search for a page or resource (e.g. 'pricing', 'SMTP', 'glossary')"
							autoComplete="off"
						/>
					</Input.Wrapper>
				</Input.Root>

				<nav
					aria-label="Jump to section"
					className="mt-6 rounded-[10px] border border-stroke-soft-200 bg-bg-white-0 p-4 pr-5 dark:border-white/10 dark:bg-[#0a0a0a]"
				>
					<h2 className="mb-2.5 font-medium text-[0.85rem] text-text-sub-600 uppercase tracking-[0.08em] dark:text-white/40">
						Jump to
					</h2>
					<ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-2 p-0">
						{sections.map((section) => (
							<li key={section.title}>
								<a
									href={`#${getSectionSlug(section.title)}`}
									className="text-[0.92rem] text-primary-base no-underline hover:underline"
								>
									{section.title}
								</a>
							</li>
						))}
					</ul>
				</nav>

				{!hasResults && (
					<p className="mt-6 py-2 text-text-sub-600 italic dark:text-white/50">
						No links match your search. Try a different word.
					</p>
				)}
			</div>

			{filteredSections.map((section) => {
				const slug = getSectionSlug(section.title);
				const originalIndex = sections.findIndex((s) => s.title === section.title);

				return (
					<section
						key={section.title}
						className={
							originalIndex % 2 === 1
								? "bg-[#f8f8f8] text-text-strong-950 dark:bg-black dark:text-white"
								: undefined
						}
					>
						<div className={`${grosoryContentClass} py-12 sm:py-14`}>
							<div
								id={slug}
								className="scroll-mt-32 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
							>
								<h2 className="font-serif text-[2.25rem] text-text-strong-950 leading-tight tracking-tight sm:text-[2.75rem] lg:text-[3rem] dark:text-white">
									{section.title}
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
							<ul className="mt-6 columns-1 gap-x-10 sm:columns-2 lg:columns-3">
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
		</>
	);
}
