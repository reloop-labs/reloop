import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { getSiteUrl, socialProfiles } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { ChangelogGridBody, ChangelogGridHero } from "./changelog-grid";
import { ChangelogTimeline } from "./changelog-timeline";
import { getChangelogReleases } from "./changelog-utils";

// Cache configuration
export const instant = false;

const pageUrl = `${getSiteUrl()}/changelog`;

export const metadata: Metadata = {
	title: "Changelog | Reloop",
	description:
		"What's new in Reloop — product releases from September 2025 onward, organized by planning, design, frontend, backend, and DevOps.",
	keywords: [
		"Reloop changelog",
		"email platform updates",
		"Reloop releases",
		"product updates",
		"open source email changelog",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Changelog | Reloop",
		description:
			"What's new in Reloop — product releases from September 2025 onward.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Changelog | Reloop",
		description:
			"What's new in Reloop — product releases from September 2025 onward.",
	},
};

function RssIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
		>
			<path d="M4 11a9 9 0 0 1 9 9" />
			<path d="M4 4a16 16 0 0 1 16 16" />
			<circle cx="5" cy="19" r="1" fill="currentColor" stroke="none" />
		</svg>
	);
}

type PageProps = {
	searchParams: Promise<{ year?: string }>;
};

const ChangelogPage = async ({ searchParams }: PageProps) => {
	const { year } = await searchParams;

	const allReleases = getChangelogReleases();

	const availableYears = Array.from(
		new Set(
			allReleases
				.map((r) => r.date.match(/\d{4}/)?.[0])
				.filter(Boolean) as string[],
		),
	).sort((a, b) => Number(b) - Number(a));

	const activeYear =
		year && availableYears.includes(year) ? year : availableYears[0] || "2026";

	const filteredReleases = allReleases.filter(
		(r) => (r.date.match(/\d{4}/)?.[0] || "") === activeYear,
	);

	const currentIndex = availableYears.indexOf(activeYear);
	const newerYear = currentIndex > 0 ? availableYears[currentIndex - 1] : null;
	const olderYear =
		currentIndex < availableYears.length - 1
			? availableYears[currentIndex + 1]
			: null;

	return (
		<div>
			<ChangelogGridHero>
				<div>
					<h1 className="max-w-3xl font-semibold text-text-strong-950 text-xl leading-snug tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
						Changelog
					</h1>
					<p className="mt-3 max-w-2xl text-[14px] text-text-sub-600 leading-relaxed sm:text-[14.5px] dark:text-white/60">
						All the latest updates, improvements, and fixes to Reloop
					</p>
				</div>

				<div className="mt-6 flex w-fit items-center gap-2">
					<Button.Root variant="neutral" mode="stroke" size="small" asChild>
						<a
							href={socialProfiles.x}
							target="_blank"
							rel="noopener noreferrer"
						>
							<Icon name="twitter" className="size-3.5" aria-hidden="true" />
							Follow
						</a>
					</Button.Root>

					<Button.Root variant="neutral" mode="stroke" size="small" asChild>
						<a
							href="/changelog/feed.xml"
							aria-label="RSS feed"
							className="px-2.5!"
						>
							<RssIcon className="size-3.5" />
						</a>
					</Button.Root>
				</div>
			</ChangelogGridHero>

			<ChangelogGridBody>
				<ChangelogTimeline releases={filteredReleases} />
			</ChangelogGridBody>

			{/* Full-width Year Navigation Bar with top border touching the whole width */}
			{(newerYear || olderYear) && (
				<section className="relative w-full border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
					<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
						<div className="grid grid-cols-2 divide-x divide-stroke-soft-200 dark:divide-white/10">
							{/* Left half */}
							{newerYear ? (
								<Link
									href={
										newerYear === "2026"
											? "/changelog"
											: `/changelog?year=${newerYear}`
									}
									className="group flex items-center justify-start px-6 py-7 transition-colors hover:bg-bg-weak-50/80 sm:px-10 lg:px-12 dark:hover:bg-white/[0.03]"
								>
									<div className="inline-flex items-center gap-1.5 font-medium text-[13.5px] text-text-strong-950 dark:text-white">
										<svg
											className="group-hover:-translate-x-0.5 size-3.5 transition-transform duration-200"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											strokeWidth="2"
											aria-hidden="true"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M15.75 19.5L8.25 12l7.5-7.5"
											/>
										</svg>
										<span>{newerYear}</span>
									</div>
								</Link>
							) : (
								<div className="px-6 py-7 sm:px-10 lg:px-12" />
							)}

							{/* Right half */}
							{olderYear ? (
								<Link
									href={`/changelog?year=${olderYear}`}
									className="group flex items-center justify-end px-6 py-7 transition-colors hover:bg-bg-weak-50/80 sm:px-10 lg:px-12 dark:hover:bg-white/[0.03]"
								>
									<div className="inline-flex items-center gap-1.5 font-medium text-[13.5px] text-text-strong-950 dark:text-white">
										<span>{olderYear}</span>
										<svg
											className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											strokeWidth="2"
											aria-hidden="true"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M8.25 4.5l7.5 7.5-7.5 7.5"
											/>
										</svg>
									</div>
								</Link>
							) : (
								<div className="px-6 py-7 sm:px-10 lg:px-12" />
							)}
						</div>
					</div>
				</section>
			)}
		</div>
	);
};

export default ChangelogPage;
