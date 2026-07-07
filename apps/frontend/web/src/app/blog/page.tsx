import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import { blogPosts } from "@reloop/web/lib/landing/blog";
import { getSiteUrl, socialProfiles } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Link from "next/link";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pageUrl = `${getSiteUrl()}/blog`;

export const metadata: Metadata = {
	title: "Blog | Reloop",
	description:
		"Updates, release notes, and engineering notes from Reloop Labs. Follow development on GitHub and Discord.",
	keywords: [
		"Reloop blog",
		"email infrastructure updates",
		"Reloop release notes",
		"open source email news",
		"email platform changelog",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Blog | Reloop",
		description:
			"Updates, release notes, and engineering notes from Reloop Labs.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Blog | Reloop",
		description:
			"Updates, release notes, and engineering notes from Reloop Labs.",
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
	const posts = blogPosts;

	return (
		<MarketingPageShell
			titleLines={["Blog & updates"]}
			description="Guides, tutorials, and updates from Reloop Labs—plus release notes on GitHub and Discord."
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
						Articles
					</p>
					<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
						Guides & <span className="text-primary-base">tutorials.</span>
					</h2>
				</div>
				<div className="mx-auto mt-14 grid max-w-4xl gap-6">
					{posts.map((post) => (
						<Link
							key={post.slug}
							href={`/blog/${post.slug}`}
							className="group flex flex-col rounded-2xl border border-stroke-soft-200 p-6 transition-colors hover:border-stroke-soft-300 sm:flex-row sm:items-start sm:gap-6 dark:border-white/10 dark:hover:border-white/20"
						>
							<div className="flex-1">
								<span className="font-semibold text-[11px] text-primary-base uppercase tracking-[0.14em]">
									{post.tag}
								</span>
								<h3 className="mt-2 font-semibold text-[19px] text-text-strong-950 leading-snug group-hover:text-primary-base dark:text-white">
									{post.title}
								</h3>
								<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
									{post.description}
								</p>
							</div>
							<span className="mt-4 shrink-0 text-[13px] text-text-sub-600 sm:mt-0 dark:text-white/55">
								{post.readTime}
							</span>
						</Link>
					))}
				</div>
			</PageSection>

			<PageSection alt>
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
						We also publish release notes and roadmap updates in the channels
						below.
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
				<p className="mx-auto mt-12 max-w-xl text-center text-[14px] text-text-sub-600 dark:text-white/55">
					Want deep dives and tutorials? Our{" "}
					<Link
						href="/docs"
						className="font-semibold text-primary-link underline decoration-primary-link/30 underline-offset-4"
					>
						documentation
					</Link>{" "}
					and{" "}
					<Link
						href="/docs/self-host"
						className="font-semibold text-primary-link underline decoration-primary-link/30 underline-offset-4"
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
