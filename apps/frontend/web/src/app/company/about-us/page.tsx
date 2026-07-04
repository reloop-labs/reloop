import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import { contactEmail, getSiteUrl, socialProfiles } from "@reloop/web/lib/site";
import type { Metadata } from "next";

const pageUrl = `${getSiteUrl()}/company/about-us`;

export const metadata: Metadata = {
	title: "About Us | Reloop",
	description:
		"Reloop Labs builds open-source email infrastructure—hosted service or self-host—for developers who want transparency and control.",
	keywords: [
		"Reloop Labs",
		"about Reloop",
		"open source email company",
		"email infrastructure team",
		"developer email platform",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "About Us | Reloop",
		description:
			"Reloop Labs builds open-source email infrastructure—hosted service or self-host—for developers who want transparency and control.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "About Us | Reloop",
		description:
			"Open-source email infrastructure—hosted or self-host—for developers who want transparency and control.",
	},
};

const pillars = [
	{
		number: "01",
		title: "Radical simplicity",
		description:
			"Email infrastructure that just works. One API, clear SDKs, and a stack you can understand—not a maze of opaque services.",
	},
	{
		number: "02",
		title: "Open by default",
		description:
			"Every line of code is public under Apache 2.0. Audit it, fork it, use our hosted service, or self-host on your servers.",
	},
	{
		number: "03",
		title: "Your choice of deployment",
		description:
			"Use Reloop hosted by us or run it on your network. No vendor lock-in—same open-source platform either way.",
	},
	{
		number: "04",
		title: "Developer-first",
		description:
			"Type-safe SDKs, predictable APIs, and documentation written for engineers shipping real products.",
	},
	{
		number: "05",
		title: "AI-ready",
		description:
			"Agent inboxes, structured parsing, and webhooks built for autonomous workflows—not bolted on later.",
	},
	{
		number: "06",
		title: "Community-driven",
		description:
			"We're in the early days, building in public. Issues, discussions, and contributions shape what comes next.",
	},
];

const timeline = [
	{
		year: "Sep 2025",
		event: "We started",
		detail:
			"Reloop Labs began in September 2025 with one goal: open-source email infrastructure that's transparent and self-hostable.",
	},
	{
		year: "2025–2026",
		event: "Building in the open",
		detail:
			"We've been heads-down on the codebase—APIs, self-hosting, agent inboxes—and sharing progress on GitHub and Discord.",
	},
	{
		year: "Now",
		event: "Still shipping",
		detail:
			"We're not done yet. The product is actively in development, and we're polishing everything for launch.",
	},
	{
		year: "Jul 2026",
		event: "Launching next month",
		detail:
			"Public launch is planned for July 2026. Follow along on GitHub—or get started with hosted or self-hosted builds today.",
	},
];

const bentoCellClass =
	"border-stroke-soft-200 border-t border-l-0 bg-transparent p-8 transition-colors duration-300 first:border-t-0 hover:bg-black/[0.01] sm:border-t sm:border-l lg:p-10 dark:border-white/10 dark:hover:bg-white/[0.02] sm:[&:nth-child(-n+2)]:border-t-0 sm:[&:nth-child(2n+1)]:border-l-0";

const AboutUsPage = () => {
	return (
		<MarketingPageShell
			titleLines={["About Reloop Labs"]}
			description="We build open-source email infrastructure—use our hosted service or self-host. Transparent, developer-first, free from vendor lock-in."
			primaryCta={{
				label: "Get started",
				href: "/dashboard/signup",
			}}
			secondaryCta={{
				label: "Self-hosting guide",
				href: "/resources/self-hosting-guide",
			}}
			compactHero
		>
			<PageSection>
				<div className="flex flex-col gap-16 lg:flex-row lg:items-start lg:gap-24">
					<div className="lg:w-[480px] lg:shrink-0">
						<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
							What we stand for
						</p>
						<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
							Six pillars
							<br />
							<span className="text-primary-base">we live by.</span>
						</h2>
						<p className="mt-6 max-w-[420px] text-[15px] text-text-sub-600 leading-7 sm:text-[16px] dark:text-white/50">
							These aren't slogans—they're the decisions we make when we write
							code, review PRs, and design APIs.
						</p>
					</div>
					<div className="flex-1">
						<div className="grid overflow-hidden rounded-2xl border border-stroke-soft-200 sm:grid-cols-2 dark:border-white/10">
							{pillars.map((pillar) => (
								<div key={pillar.number} className={bentoCellClass}>
									<span className="font-semibold text-sm text-text-soft-400 tabular-nums dark:text-white/28">
										{pillar.number}
									</span>
									<h3 className="mt-3 font-semibold text-[17px] text-text-strong-950 leading-snug sm:text-[18px] dark:text-white">
										{pillar.title}
									</h3>
									<p className="mt-3 text-[14px] text-text-sub-600 leading-[1.7] sm:text-[15px] dark:text-white/50">
										{pillar.description}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</PageSection>

			<PageSection>
				<div className="text-center">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
						Our story
					</p>
					<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
						Built out of frustration.
						<br />
						<span className="text-primary-base">Refined in the open.</span>
					</h2>
					<p className="mx-auto mt-6 max-w-2xl text-[15px] text-text-sub-600 leading-7 sm:text-[16px] dark:text-white/50">
						Developers shouldn't have to choose between expensive proprietary
						vendors and opaque self-hosted setups. Reloop is our answer—the same
						service as proprietary platforms, with an open-source codebase you
						can use hosted or self-host.
					</p>
				</div>
				<div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-stroke-soft-200 sm:grid-cols-2 lg:grid-cols-4 dark:border-white/10">
					{timeline.map((item) => (
						<div
							key={item.year + item.event}
							className="bg-transparent p-8 lg:p-10"
						>
							<span className="font-semibold text-sm text-text-soft-400 tabular-nums dark:text-white/28">
								{item.year}
							</span>
							<h3 className="mt-4 font-semibold text-lg text-text-strong-950 leading-snug dark:text-white">
								{item.event}
							</h3>
							<p className="mt-3 text-[14px] text-text-sub-600 leading-relaxed sm:text-[15px] dark:text-white/50">
								{item.detail}
							</p>
						</div>
					))}
				</div>
				<p className="mx-auto mt-10 max-w-2xl text-center text-[14px] text-text-sub-600 leading-7 dark:text-white/40">
					Questions? Reach us at{" "}
					<a
						href={`mailto:${contactEmail}`}
						className="font-semibold text-primary-base underline decoration-primary-base/30 underline-offset-4"
					>
						{contactEmail}
					</a>
					.
				</p>
			</PageSection>

			<FeatureCta
				title="Join us in the open"
				titleMuted="Contribute on GitHub."
				description="Star the repo, open an issue, or join our Discord community—we're building Reloop together."
				primary={{
					label: "Join Discord",
					href: socialProfiles.discord,
					external: true,
				}}
				secondary={{
					label: "View on GitHub",
					href: socialProfiles.github,
					external: true,
				}}
			/>
		</MarketingPageShell>
	);
};

export default AboutUsPage;
