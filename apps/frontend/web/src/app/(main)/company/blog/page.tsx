import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import { socialProfiles } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Blog | Reloop",
	description:
		"Updates, release notes, and engineering notes from Reloop Labs. Follow development on GitHub and Discord.",
	openGraph: {
		title: "Blog | Reloop",
		description:
			"Updates, release notes, and engineering notes from Reloop Labs.",
		type: "website",
	},
};

const updates = [
	{
		tag: "Release",
		title: "Follow releases on GitHub",
		description:
			"Every tagged release, breaking change, and migration note is published on our GitHub Releases page.",
		href: `${socialProfiles.github}/releases`,
		external: true,
		label: "View releases",
	},
	{
		tag: "Changelog",
		title: "Product changelog",
		description:
			"A curated summary of what's shipped recently—features, fixes, and infrastructure improvements.",
		href: "/resources/changelog",
		label: "Read changelog",
	},
	{
		tag: "Community",
		title: "Discord & GitHub Discussions",
		description:
			"Roadmap threads, RFCs, and day-to-day updates live in our community channels—not on a corporate blog.",
		href: socialProfiles.discord,
		external: true,
		label: "Join Discord",
	},
];

const BlogPage = () => {
	return (
		<MarketingPageShell
			titleLines={["Blog & updates"]}
			description="We're a small open-source team. Long-form posts are coming—until then, follow releases and discussions where we already publish."
			primaryCta={{
				label: "GitHub Releases",
				href: `${socialProfiles.github}/releases`,
				external: true,
			}}
			secondaryCta={{
				label: "Changelog",
				href: "/resources/changelog",
			}}
			compactHero
		>
			<PageSection>
				<div className="text-center">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
						Where to follow along
					</p>
					<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
						Building in public
						<br />
						<span className="text-primary-base">for now.</span>
					</h2>
					<p className="mx-auto mt-6 max-w-2xl text-[15px] text-text-sub-600 leading-7 dark:text-white/50">
						We don't have a traditional blog yet. These are the best places to
						stay current on Reloop development.
					</p>
				</div>
				<div className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-3">
					{updates.map((item) => (
						<a
							key={item.title}
							href={item.href}
							target={item.external ? "_blank" : undefined}
							rel={item.external ? "noopener noreferrer" : undefined}
							className="group flex flex-col rounded-2xl border border-stroke-soft-200 p-6 transition-colors hover:border-stroke-soft-300 dark:border-white/10 dark:hover:border-white/20"
						>
							<span className="font-semibold text-[11px] text-primary-base uppercase tracking-[0.14em]">
								{item.tag}
							</span>
							<h3 className="mt-3 font-semibold text-[17px] text-text-strong-950 leading-snug group-hover:text-primary-base dark:text-white">
								{item.title}
							</h3>
							<p className="mt-2 flex-1 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
								{item.description}
							</p>
							<span className="mt-4 font-semibold text-primary-base text-sm">
								{item.label} →
							</span>
						</a>
					))}
				</div>
				<p className="mx-auto mt-12 max-w-xl text-center text-[14px] text-text-sub-600 dark:text-white/40">
					Want deep dives and tutorials? Our{" "}
					<Link
						href="/docs"
						className="font-semibold text-primary-base underline decoration-primary-base/30 underline-offset-4"
					>
						documentation
					</Link>{" "}
					and{" "}
					<Link
						href="/resources/self-hosting-guide"
						className="font-semibold text-primary-base underline decoration-primary-base/30 underline-offset-4"
					>
						self-hosting guide
					</Link>{" "}
					are the best starting points today.
				</p>
			</PageSection>

			<FeatureCta
				title="Stay in the loop"
				titleMuted="Star us on GitHub."
				description="Watch the repository for release notifications and follow along as we ship."
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

export default BlogPage;
