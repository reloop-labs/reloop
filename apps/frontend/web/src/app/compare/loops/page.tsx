import { FaqSection } from "@reloop/web/components/faq-section";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { competitorBrands } from "../competitor-brands";
import { CompareHeroStatStrip } from "../components/compare-hero-stat-strip";
import { CompareMigrate } from "../components/compare-migrate";
import { CompareOtherLinks } from "../components/compare-other-links";
import { CompareSection } from "../components/compare-section";
import { ComparisonMatrix } from "../components/comparison-matrix";
import { ComparisonPageShell } from "../components/comparison-page-shell";
import { loopsComparisonCategories } from "./comparison-data";
import { LoopsCostCalculator } from "./loops-cost-calculator";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pagePath = "/compare/loops";
const pageUrl = `${getSiteUrl()}${pagePath}`;

export const metadata: Metadata = {
	title: "Reloop vs Loops: Detailed Email Provider Comparison Report",
	description:
		"Learn how Reloop compares to Loops. Consolidate SaaS product onboarding, marketing broadcasts, and transactional APIs into one open-source platform without contact penalties.",
	keywords: [
		"Reloop vs Loops",
		"Loops alternative",
		"SaaS email comparison",
		"open source Loops alternative",
		"lifecycle email platform",
		"KumoMTA email API",
	],
	openGraph: {
		title: "Reloop vs Loops | Email Provider Comparison Report",
		description:
			"Learn how Reloop compares to Loops. Consolidate SaaS product onboarding, marketing broadcasts, and transactional APIs into one open-source platform without contact penalties.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Reloop vs Loops: Detailed Email Provider Comparison Report",
		description:
			"Learn how Reloop compares to Loops. Consolidate SaaS product onboarding, marketing broadcasts, and transactional APIs into one open-source platform without contact penalties.",
	},
	alternates: { canonical: pageUrl },
};

const loopsStats = [
	{
		label: "Pricing Model",
		value: "Per Send",
		detail: "Reloop charges per send; Loops penalizes growing contact lists",
	},
	{
		label: "Unified Stack",
		value: "1 API",
		detail: "Transactional sends + Marketing loops + Inbound AI agents",
	},
	{
		label: "Open Source Engine",
		value: "100%",
		detail: "KumoMTA core engine with zero vendor lock-in",
	},
	{
		label: "Self-Hosting",
		value: "Free",
		detail: "Deploy on your own Docker/K8s with $0 license fee",
	},
];

const LoopsComparisonPage = () => {
	const loopsBrand = competitorBrands.find((b) => b.name === "Loops");

	return (
		<ComparisonPageShell
			pagePath={pagePath}
			titleLines={["Reloop vs Loops"]}
			description="Loops is great for simple onboarding loops—until engineering needs password resets, billing receipts, and raw API sends. Reloop unifies product email and transactional infrastructure into one open-source platform."
			primaryCta={{
				label: "Start for free",
				href: "/dashboard/signup",
			}}
			secondaryCta={{
				label: "Migrate from Loops",
				href: "/compare/loops#migrate",
			}}
		>
			{/* Metric Stat Strip */}
			<CompareSection flushTop maxWidth="full">
				<CompareHeroStatStrip stats={loopsStats} />
			</CompareSection>

			{/* The Two-Vendor Problem Section */}
			<CompareSection maxWidth="full">
				<div className="mx-auto max-w-3xl space-y-6 text-center">
					<span className="font-bold text-[12px] text-text-sub-600 uppercase tracking-widest dark:text-white/50">
						The Two-Vendor Problem
					</span>
					<h2 className="font-serif text-[2rem] text-text-strong-950 leading-tight tracking-tight sm:text-[2.5rem] dark:text-white">
						Stop managing split email services
					</h2>
					<p className="text-[16px] text-text-sub-600 leading-relaxed dark:text-white/60">
						Many SaaS teams start with Loops for product onboarding loops, then
						quickly realize they still need Resend or Postmark for auth emails,
						invoices, and transactional webhooks. Reloop unifies both under one
						API key.
					</p>

					{/* Visual Stack Comparison */}
					<div className="mt-8 grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
						<div className="rounded-2xl border border-stroke-soft-200/80 bg-bg-weak-50/50 p-6 dark:border-white/10 dark:bg-white/[0.02]">
							<span className="font-bold text-[12px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
								Fragmented Stack (Loops + 2nd API)
							</span>
							<ul className="mt-3 space-y-2 font-mono text-[13px] text-text-sub-600 dark:text-white/60">
								<li className="flex items-center gap-2">
									<span className="text-red-500">✕</span> Loops → Onboarding
									&amp; Newsletters
								</li>
								<li className="flex items-center gap-2">
									<span className="text-red-500">✕</span> Resend / Postmark →
									Auth &amp; Receipts
								</li>
								<li className="flex items-center gap-2">
									<span className="text-red-500">✕</span> 2 Domain Reputation
									Pools
								</li>
								<li className="flex items-center gap-2">
									<span className="text-red-500">✕</span> 2 Separate Monthly
									Bills
								</li>
							</ul>
						</div>

						<div className="rounded-2xl border border-stroke-soft-200/80 bg-bg-white-0 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
							<span className="font-bold text-[12px] text-primary-base uppercase tracking-wider">
								Unified Stack (Reloop)
							</span>
							<ul className="mt-3 space-y-2 font-mono text-[13px] text-text-strong-950 dark:text-white">
								<li className="flex items-center gap-2">
									<span className="text-emerald-500">✓</span> Reloop →
									Onboarding &amp; Newsletters
								</li>
								<li className="flex items-center gap-2">
									<span className="text-emerald-500">✓</span> Reloop → Auth,
									Billing &amp; Receipts
								</li>
								<li className="flex items-center gap-2">
									<span className="text-emerald-500">✓</span> Reloop → Inbound
									AI Agent Inbox
								</li>
								<li className="flex items-center gap-2">
									<span className="text-emerald-500">✓</span> 1 Domain
									Reputation Pool
								</li>
							</ul>
						</div>
					</div>
				</div>
			</CompareSection>

			{/* Interactive Contact Calculator */}
			<CompareSection maxWidth="full">
				<LoopsCostCalculator />
			</CompareSection>

			{/* Feature Comparison Matrix */}
			<CompareSection maxWidth="full" flushX>
				<div className="mb-10 text-center">
					<h2 className="mt-3 font-serif text-[2rem] text-text-strong-950 leading-[1.1] tracking-tighter sm:text-[2.4rem] lg:text-[2.8rem] dark:text-white">
						Reloop &nbsp;&nbsp;vs&nbsp;&nbsp;&nbsp;Loops
					</h2>
					<p className="mx-auto mt-3 max-w-xl font-medium text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
						Compare capabilities, sending mechanisms, and open-source data
						ownership.
					</p>
				</div>

				<ComparisonMatrix
					competitorName="Loops"
					categories={loopsComparisonCategories}
				/>

				<p className="mt-6 text-center text-[13px] text-text-sub-600 dark:text-white/40">
					Seen something inaccurate?{" "}
					<Link href="/contact" className="font-semibold text-primary-base">
						Tell us
					</Link>
					—we correct comparison pages when public features change.
				</p>
			</CompareSection>

			{/* Migration Section */}
			<CompareSection maxWidth="full">
				{loopsBrand ? (
					<CompareMigrate
						competitorName="Loops"
						competitorIcon={loopsBrand.icon}
						primaryHref="/dashboard/signup"
						guideHref="/docs"
					/>
				) : null}
			</CompareSection>

			{/* FAQ Section */}
			<CompareSection maxWidth="3xl">
				<FaqSection
					id="compare-loops-faq"
					title="Loops vs Reloop FAQ"
					items={[
						{
							question:
								"Why should we choose send-based pricing over contact-based pricing?",
							answer:
								"Contact-based pricing charges you for inactive leads and users who never open your emails. Reloop's send-based pricing ensures you only pay when emails are delivered.",
						},
						{
							question:
								"Can Reloop handle both marketing campaigns and transactional APIs?",
							answer:
								"Yes! Reloop includes transactional API endpoints, SMTP relays, drag-and-drop/JSX email template builders, broadcast campaigns, and AI agent inboxes under one unified platform.",
						},
						{
							question: "Can we self-host Reloop while migrating from Loops?",
							answer:
								"Absolutely. Reloop is 100% open source (KumoMTA engine). You can deploy Reloop on your own Kubernetes or Docker infrastructure with $0 software license fees.",
						},
					]}
					compact
				/>
			</CompareSection>

			<CompareSection maxWidth="full" noDivider>
				<CompareOtherLinks currentHref={pagePath} />
			</CompareSection>
		</ComparisonPageShell>
	);
};

export default LoopsComparisonPage;
