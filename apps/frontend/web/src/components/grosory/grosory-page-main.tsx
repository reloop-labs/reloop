import { grosoryContentClass } from "@reloop/web/components/grosory/grosory-page-header";
import type { GrosorySection } from "@reloop/web/lib/grosory-sections";
import { getSectionSlug } from "@reloop/web/lib/grosory-sections";
import Link from "next/link";

export function GrosoryPageMain({ sections }: { sections: GrosorySection[] }) {
	return (
		<>
			<div className={`${grosoryContentClass} mt-6`}>
				<nav
					aria-label="Browse by section"
					className="rounded-[10px] border border-stroke-soft-200 bg-bg-white-0 p-4 pr-5 dark:border-white/10 dark:bg-[#0a0a0a]"
				>
					<h2 className="mb-2.5 font-medium text-[0.85rem] text-text-sub-600 uppercase tracking-[0.08em] dark:text-white/40">
						Browse by section
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
			</div>

			{sections.map((section, index) => {
				const slug = getSectionSlug(section.title);

				return (
					<section
						key={section.title}
						className={
							index % 2 === 1
								? "bg-[#f8f8f8] text-text-strong-950 dark:bg-black dark:text-white"
								: undefined
						}
					>
						<div className={`${grosoryContentClass} py-12 sm:py-14`}>
							<div
								id={slug}
								className="flex scroll-mt-32 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
							>
								<h2 className="font-serif text-[2.25rem] text-text-strong-950 leading-tight tracking-tight sm:text-[2.75rem] lg:text-[3rem] dark:text-white">
									{section.title}
									<span
										aria-hidden
										className="mt-0.5 block h-[3px] w-9 bg-primary-base"
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
