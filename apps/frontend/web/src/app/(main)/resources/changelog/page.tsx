import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import { socialProfiles } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { changelogComingNext, changelogReleases } from "./changelog-releases";
import { ChangelogTimeline } from "./changelog-timeline";

export const metadata: Metadata = {
	title: "Changelog | Reloop",
	description:
		"What's new in Reloop — product releases from September 2025 onward, organized by planning, design, frontend, backend, DevOps, and testing.",
	openGraph: {
		title: "Changelog | Reloop",
		description:
			"What's new in Reloop — product releases from September 2025 onward.",
		type: "website",
	},
};

const ChangelogPage = () => {
	return (
		<MarketingPageShell titleLines={["Changelog"]} compactHero>
			<PageSection narrow flushTop>
				<p className="mb-10 text-center text-[14px] text-text-sub-600 leading-relaxed sm:text-[15px] dark:text-white/50">
					Release notes from{" "}
					<span className="font-semibold text-text-strong-950 dark:text-white">
						September 2025
					</span>
					. Each version lists planning, design, frontend, backend, DevOps, and
					testing work in the order teams typically ship it.
				</p>
				<ChangelogTimeline releases={changelogReleases} />
			</PageSection>

			<PageSection narrow>
				<p className="text-center font-serif text-[1.35rem] text-text-strong-950 leading-snug sm:text-[1.6rem] dark:text-white">
					Coming <span className="text-primary-base">next.</span>
				</p>
				<div className="mx-auto mt-6 flex max-w-xl flex-wrap justify-center gap-2">
					{changelogComingNext.map((item) => (
						<span
							key={item}
							className="rounded-full border border-stroke-soft-200 px-4 py-2 font-medium text-[13px] text-text-strong-950 dark:border-white/10 dark:text-white"
						>
							{item}
						</span>
					))}
				</div>
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
