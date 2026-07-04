import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import { getSiteUrl, socialProfiles } from "@reloop/web/lib/site";
import type { Metadata } from "next";

const pageUrl = `${getSiteUrl()}/philosophy/why-reloop`;

export const metadata: Metadata = {
	title: "Why Reloop | Reloop",
	description:
		"Why we built Reloop: open-source, self-hostable email infrastructure that puts developers back in control.",
	keywords: [
		"why Reloop",
		"open source email",
		"self-hosted email",
		"email vendor lock-in",
		"email infrastructure alternative",
		"transparent email platform",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Why Reloop | Reloop",
		description:
			"Why we built Reloop: open-source, self-hostable email infrastructure that puts developers back in control.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Why Reloop | Reloop",
		description:
			"Open-source, self-hostable email infrastructure that puts developers back in control.",
	},
};

const problems = [
	{
		number: "01",
		title: "Opaque vendors",
		description:
			"Proprietary providers hide routing logic, pricing surprises, and deliverability decisions behind dashboards you can't audit.",
	},
	{
		number: "02",
		title: "Vendor lock-in",
		description:
			"Your contact lists, templates, and sending reputation get trapped in someone else's platform—with no clean exit.",
	},
	{
		number: "03",
		title: "Data leaves your network",
		description:
			"Every message, webhook payload, and contact record passes through infrastructure you don't own or operate.",
	},
];

const solutions = [
	{
		number: "01",
		title: "Read the source",
		description:
			"Apache 2.0 licensed code you can inspect, fork, and run. Every routing decision is auditable.",
	},
	{
		number: "02",
		title: "Self-host anywhere",
		description:
			"Docker Compose, Kubernetes, or bare metal—deploy on your network and keep data where you want it.",
	},
	{
		number: "03",
		title: "Built for developers",
		description:
			"Modern APIs, typed SDKs, webhooks, SMTP relay, campaigns, templates, and agent-ready inboxes in one stack.",
	},
];

const bentoCellClass =
	"border-stroke-soft-200 border-t border-l-0 bg-transparent p-8 transition-colors duration-300 first:border-t-0 hover:bg-black/[0.01] sm:border-t sm:border-l lg:p-10 dark:border-white/10 dark:hover:bg-white/[0.02] sm:[&:nth-child(-n+2)]:border-t-0 sm:[&:nth-child(2n+1)]:border-l-0";

const WhyReloopPage = () => {
	return (
		<MarketingPageShell
			titleLines={["Why Reloop?"]}
			description="Email infrastructure like proprietary platforms—except our codebase is open source. Use our hosted service or self-host it yourself."
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
							The problem
						</p>
						<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
							Email wasn't
							<br />
							<span className="text-primary-base">meant to be a mystery.</span>
						</h2>
						<p className="mt-6 max-w-[420px] text-[15px] text-text-sub-600 leading-7 dark:text-white/50">
							Teams shouldn't choose between expensive SaaS vendors and fragile
							home-grown SMTP hacks. There's a third path.
						</p>
					</div>
					<div className="flex-1">
						<div className="grid overflow-hidden rounded-2xl border border-stroke-soft-200 sm:grid-cols-1 dark:border-white/10">
							{problems.map((item) => (
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

			<PageSection>
				<div className="flex flex-col gap-16 lg:flex-row lg:items-start lg:gap-24">
					<div className="lg:w-[480px] lg:shrink-0">
						<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
							Our answer
						</p>
						<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
							Infrastructure
							<br />
							<span className="text-primary-base">you control.</span>
						</h2>
						<p className="mt-6 max-w-[420px] text-[15px] text-text-sub-600 leading-7 dark:text-white/50">
							Reloop is a full email stack—transactional, campaigns, SMTP,
							analytics, templates, webhooks—under a license you can actually
							read.
						</p>
					</div>
					<div className="flex-1">
						<div className="grid overflow-hidden rounded-2xl border border-stroke-soft-200 sm:grid-cols-1 dark:border-white/10">
							{solutions.map((item) => (
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
				<div className="grid gap-px overflow-hidden rounded-2xl border border-stroke-soft-200 sm:grid-cols-2 dark:border-white/10">
					<div className="p-8 sm:p-10">
						<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
							Proprietary email
						</p>
						<ul className="mt-6 space-y-4">
							{[
								"Opaque pricing that grows with volume",
								"Black-box deliverability",
								"Data on someone else's servers",
								"Roadmap you can't influence",
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
					<div className="border-stroke-soft-200 border-t p-8 sm:border-t-0 sm:border-l dark:border-white/10">
						<p className="font-semibold text-[11px] text-primary-base uppercase tracking-[0.16em]">
							Reloop
						</p>
						<ul className="mt-6 space-y-4">
							{[
								"Same service as proprietary platforms",
								"Use hosted or self-host the open-source code",
								"Every routing decision is auditable",
								"Contribute features via GitHub",
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
			</PageSection>

			<FeatureCta
				title="See for yourself"
				titleMuted="Hosted or self-hosted."
				description="Sign up for Reloop as a service, or deploy the open-source platform on your infrastructure."
				primary={{
					label: "Get started",
					href: "/dashboard/signup",
				}}
				secondary={{
					label: "Self-hosting guide",
					href: "/resources/self-hosting-guide",
				}}
			/>
		</MarketingPageShell>
	);
};

export default WhyReloopPage;
