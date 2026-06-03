import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import { socialProfiles } from "@reloop/web/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Changelog | Reloop",
	description:
		"Recent updates to the open-source Reloop email platform. Follow full release history on GitHub.",
	openGraph: {
		title: "Changelog | Reloop",
		description:
			"Recent updates to the open-source Reloop email platform.",
		type: "website",
	},
};

const releases = [
	{
		version: "Early access",
		date: "2025 — ongoing",
		title: "Open-source platform",
		summary:
			"Core email infrastructure: sending API, SMTP relay, templates, webhooks, contacts, campaigns, and dashboard—available to self-host.",
		items: [
			"Multi-language SDKs and API reference",
			"Agent inbox primitives and structured email parsing",
			"Self-hosting docs for Docker and Kubernetes",
			"Apache 2.0 license with Reloop Labs use restrictions",
		],
	},
	{
		version: "2024",
		date: "Initial public release",
		title: "Reloop goes open source",
		summary:
			"Reloop Labs published the codebase on GitHub—the start of transparent, self-hostable email infrastructure.",
		items: [
			"Public repository at github.com/reloop-labs/reloop",
			"Transactional email API and basic analytics",
			"Developer documentation and getting-started guides",
		],
	},
];

const roadmap = [
	{
		title: "Self-hosting polish",
		description:
			"Smoother deploy paths, clearer upgrade docs, and hardened defaults for production self-hosters.",
	},
	{
		title: "Deliverability tooling",
		description:
			"More visibility into bounces, complaints, and domain reputation inside your own deployment.",
	},
	{
		title: "Community integrations",
		description:
			"More SDK examples, webhook recipes, and contributions from the GitHub community.",
	},
];

const ChangelogPage = () => {
	return (
		<MarketingPageShell
			titleLines={["Changelog"]}
			description="What's new in Reloop. For every tagged release and commit detail, follow the repository on GitHub."
			primaryCta={{
				label: "GitHub Releases",
				href: `${socialProfiles.github}/releases`,
				external: true,
			}}
			secondaryCta={{
				label: "View on GitHub",
				href: socialProfiles.github,
				external: true,
			}}
			compactHero
		>
			<PageSection narrow flushTop>
				<div className="space-y-10">
					{releases.map((release) => (
						<article
							key={release.version + release.title}
							className="rounded-2xl border border-stroke-soft-200 p-6 sm:p-8 dark:border-white/10"
						>
							<div className="flex flex-wrap items-center gap-3">
								<span className="rounded-lg border border-stroke-soft-200 bg-bg-weak-50 px-3 py-1 font-semibold text-primary-base text-sm dark:border-white/10">
									{release.version}
								</span>
								<span className="text-[14px] text-text-sub-600 dark:text-white/40">
									{release.date}
								</span>
							</div>
							<h2 className="mt-4 font-semibold text-xl text-text-strong-950 dark:text-white">
								{release.title}
							</h2>
							<p className="mt-2 text-[15px] text-text-sub-600 leading-7 dark:text-white/50">
								{release.summary}
							</p>
							<ul className="mt-4 space-y-2 pl-5 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
								{release.items.map((item) => (
									<li key={item} className="list-disc">
										{item}
									</li>
								))}
							</ul>
						</article>
					))}
				</div>
			</PageSection>

			<PageSection>
				<div className="text-center">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
						Roadmap
					</p>
					<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] dark:text-white">
						What's coming
						<br />
						<span className="text-primary-base">next.</span>
					</h2>
					<p className="mx-auto mt-6 max-w-2xl text-[15px] text-text-sub-600 leading-7 dark:text-white/50">
						Priorities shift based on community feedback. Vote and discuss on
						GitHub Discussions.
					</p>
				</div>
				<div className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-3">
					{roadmap.map((item) => (
						<div
							key={item.title}
							className="rounded-2xl border border-stroke-soft-200 p-6 dark:border-white/10"
						>
							<h3 className="font-semibold text-[17px] text-text-strong-950 dark:text-white">
								{item.title}
							</h3>
							<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
								{item.description}
							</p>
						</div>
					))}
				</div>
			</PageSection>

			<FeatureCta
				title="Stay updated"
				titleMuted="Watch the repo."
				description="Star Reloop on GitHub to follow releases, or join Discord for day-to-day updates."
				primary={{
					label: "Star on GitHub",
					href: socialProfiles.github,
					external: true,
				}}
				secondary={{
					label: "Join Discord",
					href: socialProfiles.discord,
					external: true,
				}}
			/>
		</MarketingPageShell>
	);
};

export default ChangelogPage;
