import { Icon } from "@reloop/ui/icon";
import { getSiteUrl, socialProfiles } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { ChangelogGridBody, ChangelogGridHero } from "./changelog-grid";
import { ChangelogTimeline } from "./changelog-timeline";
import { changelogReleases } from "./changelog-utils";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
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

const ChangelogPage = () => {
	return (
		<div className="min-h-screen bg-white dark:bg-black">
			<ChangelogGridHero>
				<div className="flex flex-col gap-8 pt-36 pb-16 sm:pt-44 sm:pb-16">
					<div>
						<h1 className="font-semibold text-[2.5rem] text-text-strong-950 leading-[1.15] tracking-tight sm:text-5xl dark:text-white">
							Changelog
						</h1>
						<p className="mt-5 max-w-xl text-[17px] text-text-sub-600 leading-relaxed sm:text-xl dark:text-white/55">
							Product updates from{" "}
							<span className="font-medium text-text-strong-950 dark:text-white">
								September 2025
							</span>
							. Select a release to read the full notes.
						</p>
					</div>

					<div className="flex w-fit items-center gap-2">
						<a
							href={socialProfiles.x}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 rounded-lg border border-stroke-soft-200 bg-white px-3 py-2 font-medium text-[13px] text-text-strong-950 shadow-sm transition-all hover:border-neutral-400 hover:ring-4 hover:ring-neutral-200 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:border-white/30 dark:hover:ring-white/10"
						>
							<Icon name="twitter" className="size-3.5" aria-hidden="true" />
							Follow
						</a>
						<a
							href="/changelog/feed.xml"
							className="inline-flex items-center justify-center rounded-lg border border-stroke-soft-200 bg-white p-2 text-text-sub-600 shadow-sm transition-all hover:border-neutral-400 hover:ring-4 hover:ring-neutral-200 dark:border-white/15 dark:bg-transparent dark:text-white/55 dark:hover:border-white/30 dark:hover:text-white dark:hover:ring-white/10"
							aria-label="RSS feed"
						>
							<RssIcon className="size-3.5 text-text-strong-950 dark:text-white" />
						</a>
					</div>
				</div>
			</ChangelogGridHero>

			<ChangelogGridBody>
				<ChangelogTimeline releases={changelogReleases} />
			</ChangelogGridBody>
		</div>
	);
};

export default ChangelogPage;
