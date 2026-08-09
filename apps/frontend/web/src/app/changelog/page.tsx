import * as Button from "@reloop/ui/button";
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
				<div>
					<h1 className="max-w-3xl font-semibold text-3xl text-text-strong-950 leading-[1.15] tracking-tight sm:text-4xl lg:text-[2.6rem] dark:text-white">
						Changelog
					</h1>
					<p className="mt-4 max-w-2xl text-[15px] text-text-sub-600 leading-relaxed sm:text-[16px] dark:text-white/60">
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
				<ChangelogTimeline releases={changelogReleases} />
			</ChangelogGridBody>
		</div>
	);
};

export default ChangelogPage;
