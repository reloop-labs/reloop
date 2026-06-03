import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import { socialProfiles } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { type ChangelogRelease, ChangelogTimeline } from "./changelog-timeline";

export const metadata: Metadata = {
	title: "Changelog | Reloop",
	description: "What's new in Reloop — releases and updates.",
	openGraph: {
		title: "Changelog | Reloop",
		description: "What's new in Reloop — releases and updates.",
		type: "website",
	},
};

const releases: ChangelogRelease[] = [
	{
		date: "July 2026",
		version: "1.0",
		title: "Public launch",
		tags: ["Launch", "Hosted", "Self-host", "Dashboard"],
		items: [
			{
				label: "Hosted service",
				description: "Reloop as a managed email platform from Reloop Labs.",
			},
			{
				label: "Self-hosting",
				description: "Docker and Kubernetes paths for your own infrastructure.",
			},
			{
				label: "Full email stack",
				description: "API, SMTP, templates, webhooks, contacts, and campaigns.",
			},
			{
				label: "Agent inbox",
				description: "Structured parsing and webhooks for AI workflows.",
			},
		],
		code: `import { Reloop } from '@reloop/sdk';

const reloop = new Reloop('rl_live_7x893k02j');

await reloop.emails.send({
  to: 'user@example.com',
  subject: 'Welcome',
  html: '<p>Hello from Reloop.</p>',
});`,
	},
	{
		date: "Sep 2025",
		version: "0.1",
		title: "Open source",
		tags: ["GitHub", "API", "Apache 2.0"],
		items: [
			{
				label: "Public codebase",
				description: "Reloop published on GitHub under Apache 2.0.",
			},
			{
				label: "Transactional API",
				description: "Send email with a developer-first REST API.",
			},
			{
				label: "Documentation",
				description: "Getting started guides and API reference.",
			},
		],
	},
];

const comingNext = ["Deliverability", "SDK polish", "Community integrations"];

const ChangelogPage = () => {
	return (
		<MarketingPageShell titleLines={["Changelog"]} compactHero>
			<PageSection narrow flushTop>
				<ChangelogTimeline releases={releases} />
			</PageSection>

			<PageSection narrow>
				<p className="text-center font-serif text-[1.35rem] text-text-strong-950 leading-snug sm:text-[1.6rem] dark:text-white">
					Coming <span className="text-primary-base">next.</span>
				</p>
				<div className="mx-auto mt-6 flex max-w-xl flex-wrap justify-center gap-2">
					{comingNext.map((item) => (
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
				description="Full release history lives on GitHub."
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
