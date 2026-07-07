import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import { getSiteUrl, socialProfiles } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Link from "next/link";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pageUrl = `${getSiteUrl()}/philosophy/why-open-source`;

export const metadata: Metadata = {
	title: "Why Open Source | Reloop",
	description:
		"Reloop is Apache 2.0 open source. Transparency, security through visibility, and community-driven development.",
	keywords: [
		"open source email",
		"Apache 2.0 email platform",
		"transparent email infrastructure",
		"community-driven email",
		"self-hostable email",
		"open source sendgrid alternative",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Why Open Source | Reloop",
		description:
			"Reloop is Apache 2.0 open source. Transparency, security through visibility, and community-driven development.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Why Open Source | Reloop",
		description:
			"Apache 2.0 open source. Transparency, security through visibility, and community-driven development.",
	},
};

const benefits = [
	{
		number: "01",
		title: "Complete transparency",
		description:
			"Every line of code is visible. You know exactly how email is routed, stored, and delivered—no hidden algorithms.",
	},
	{
		number: "02",
		title: "No vendor lock-in",
		description:
			"Use our hosted service, self-host on your servers, modify the code, or migrate whenever you want.",
	},
	{
		number: "03",
		title: "Security through visibility",
		description:
			"Public code means more eyes on security. Issues get found and fixed in the open—not buried in a ticket queue.",
	},
	{
		number: "04",
		title: "Community innovation",
		description:
			"Features and fixes from developers solving real problems. The roadmap is shaped by contributors, not a sales team.",
	},
	{
		number: "05",
		title: "Runs anywhere",
		description:
			"Docker Compose, Kubernetes, or bare metal—or use Reloop hosted. Your infrastructure, your rules.",
	},
	{
		number: "06",
		title: "Accessible to everyone",
		description:
			"Apache 2.0 with Reloop Labs use restrictions: free for personal and internal use, hosted or self-hosted.",
	},
];

const bentoCellClass =
	"border-stroke-soft-200 border-t border-l-0 bg-transparent p-8 transition-colors duration-300 first:border-t-0 hover:bg-black/[0.01] sm:border-t sm:border-l lg:p-10 dark:border-white/10 dark:hover:bg-white/[0.02] sm:[&:nth-child(-n+2)]:border-t-0 sm:[&:nth-child(2n+1)]:border-l-0";

const WhyOpenSourcePage = () => {
	return (
		<MarketingPageShell
			titleLines={["Why open source"]}
			description="Transparency, security, and community-driven development aren't marketing words—they're why Reloop is open source from day one."
			primaryCta={{
				label: "View on GitHub",
				href: socialProfiles.github,
				external: true,
			}}
			secondaryCta={{
				label: "License",
				href: "/license",
			}}
			compactHero
		>
			<PageSection>
				<div className="flex flex-col gap-16 lg:flex-row lg:items-start lg:gap-24">
					<div className="lg:w-[480px] lg:shrink-0">
						<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
							The open source advantage
						</p>
						<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
							Six reasons
							<br />
							<span className="text-primary-base">that matter.</span>
						</h2>
						<p className="mt-6 max-w-[420px] text-[15px] text-text-sub-600 leading-7 dark:text-white/50">
							Open source isn't just a license—it's how we build trust with
							developers who depend on email infrastructure every day.
						</p>
					</div>
					<div className="flex-1">
						<div className="grid overflow-hidden rounded-2xl border border-stroke-soft-200 sm:grid-cols-2 dark:border-white/10">
							{benefits.map((item) => (
								<div key={item.number} className={bentoCellClass}>
									<span className="font-semibold text-sm text-text-soft-400 tabular-nums dark:text-white/28">
										{item.number}
									</span>
									<h3 className="mt-3 font-semibold text-[17px] text-text-strong-950 leading-snug dark:text-white">
										{item.title}
									</h3>
									<p className="mt-3 text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
										{item.description}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</PageSection>

			<PageSection narrow>
				<div className="text-center">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
						The difference
					</p>
					<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] dark:text-white">
						Closed source asks you to trust.
						<br />
						<span className="text-primary-base">
							Open source lets you verify.
						</span>
					</h2>
				</div>
				<div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-stroke-soft-200 sm:grid-cols-2 dark:border-white/10">
					<div className="p-8 lg:p-10">
						<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
							Proprietary providers
						</p>
						<ul className="mt-6 space-y-4">
							{[
								"Opaque pricing that grows with you",
								"Black-box deliverability decisions",
								"Locked into their roadmap",
								"Data leaves your control",
								"Support tickets instead of source code",
							].map((pt) => (
								<li
									key={pt}
									className="flex items-start gap-3 text-[15px] text-text-sub-600 dark:text-white/50"
								>
									<span className="mt-0.5 shrink-0 font-semibold text-text-soft-400">
										✕
									</span>
									{pt}
								</li>
							))}
						</ul>
					</div>
					<div className="border-stroke-soft-200 border-t p-8 sm:border-t-0 sm:border-l lg:p-10 dark:border-white/10">
						<p className="font-semibold text-[11px] text-primary-base uppercase tracking-[0.16em]">
							Reloop open source
						</p>
						<ul className="mt-6 space-y-4">
							{[
								"Hosted service or self-host on your infrastructure",
								"Every routing decision is auditable",
								"Contribute to the roadmap on GitHub",
								"Same open-source codebase either way",
								"Read the code, fix the bug, ship the PR",
							].map((pt) => (
								<li
									key={pt}
									className="flex items-start gap-3 text-[15px] text-text-sub-600 dark:text-white/50"
								>
									<span className="mt-0.5 shrink-0 font-semibold text-primary-base">
										✓
									</span>
									{pt}
								</li>
							))}
						</ul>
					</div>
				</div>
				<p className="mx-auto mt-10 max-w-xl text-center text-[14px] text-text-sub-600 dark:text-white/55">
					Reloop is licensed under{" "}
					<Link
						href="/license"
						className="font-semibold text-primary-link underline decoration-primary-link/30 underline-offset-4"
					>
						Apache 2.0 with additional use restrictions
					</Link>
					. Use Reloop as a hosted service from Reloop Labs, or self-host the
					open-source platform on your own infrastructure.
				</p>
			</PageSection>

			<FeatureCta
				title="Get started with Reloop"
				titleMuted="Hosted or self-hosted."
				description="Sign up for our email service, or clone the repo and run Reloop on infrastructure you control."
				primary={{
					label: "Get started",
					href: "/dashboard/signup",
				}}
				secondary={{
					label: "Self-hosting guide",
					href: "/docs/self-host",
				}}
			/>
		</MarketingPageShell>
	);
};

export default WhyOpenSourcePage;
