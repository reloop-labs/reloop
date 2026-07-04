import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import { getSiteUrl, socialProfiles } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { ChangelogTimeline } from "./changelog-timeline";
import { changelogReleases } from "./changelog-utils";

const pageUrl = `${getSiteUrl()}/resources/changelog`;

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

const ChangelogPage = () => {
	return (
		<MarketingPageShell titleLines={["Changelog"]} compactHero>
			<PageSection narrow flushTop>
				<p className="mb-10 text-center text-[14px] text-text-sub-600 leading-relaxed sm:text-[15px] dark:text-white/50">
					Product updates from{" "}
					<span className="font-semibold text-text-strong-950 dark:text-white">
						September 2025
					</span>
					. Select a release to read the full notes.
				</p>
				<ChangelogTimeline releases={changelogReleases} />
			</PageSection>

			<FeatureCta
				title="Stay updated"
				titleMuted="Watch the repo."
				description="Full commit history and tagged releases live on GitHub."
				primary={{
					label: "GitHub Releases",
					href: `${socialProfiles.github}/releases`,
					external: true,
				}}
				secondary={{
					label: "Join Discord",
					href: socialProfiles.discord,
					external: true,
				}}
				compact
			/>
		</MarketingPageShell>
	);
};

export default ChangelogPage;
