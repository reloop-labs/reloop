import { FaqSection } from "@reloop/web/components/faq-section";
import { getComparePage } from "@reloop/web/lib/compare-content";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { competitorBrands } from "../competitor-brands";
import { CompareHeroStatStrip } from "../components/compare-hero-stat-strip";
import { ComparePageJsonLd } from "../components/compare-json-ld";
import { CompareMigrate } from "../components/compare-migrate";
import { CompareOtherLinks } from "../components/compare-other-links";
import { CompareSection } from "../components/compare-section";
import { ComparisonMatrix } from "../components/comparison-matrix";
import { ComparisonPageShell } from "../components/comparison-page-shell";
import { mailgunComparisonCategories } from "./comparison-data";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pagePath = "/compare/mailgun";
const pageUrl = `${getSiteUrl()}${pagePath}`;

export const metadata: Metadata = {
	title: "Reloop vs Mailgun | Email Provider Comparison",
	description:
		"Learn how Reloop compares to Mailgun and why Reloop is the best Mailgun alternative for all your developer email API needs.",
	keywords: [
		"Reloop vs Mailgun",
		"Mailgun alternative",
		"SMTP comparison",
		"email API comparison",
		"open source Mailgun alternative",
	],
	openGraph: {
		title: "Reloop vs Mailgun",
		description:
			"Learn how Reloop compares to Mailgun and why Reloop is the best Mailgun alternative for all your developer email API needs.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Reloop vs Mailgun | Email Provider Comparison",
		description:
			"Learn how Reloop compares to Mailgun and why Reloop is the best Mailgun alternative for all your developer email API needs.",
	},
	alternates: { canonical: pageUrl },
};

const mailgunStats = [
	{
		label: "50,000 Emails",
		value: "$10",
		detail: "Reloop Pro monthly; Mailgun Foundation lists at $35",
	},
	{
		label: "Overage Rate",
		value: "$0.50",
		detail: "Per 1,000 extra emails; Mailgun starts at $1.30",
	},
	{
		label: "SMTP Cutover",
		value: "3 fields",
		detail: "Host, port, credentials. Existing SMTP senders keep their code",
	},
	{
		label: "Self-Hosting",
		value: "$0",
		detail: "Apache 2.0 core on your own Docker or Kubernetes",
	},
];

const mailgunMigrateSteps = [
	{
		step: 1,
		title: "Step 1",
		body: "Create a Reloop account and verify the domains you already send from with Mailgun. Keep both providers live while DKIM and SPF propagate.",
		duration: "5 min",
		visual: "signin" as const,
	},
	{
		step: 2,
		title: "Step 2",
		body: "SMTP senders change host, port, and credentials, with no application rewrite. API senders swap the endpoint and map Mailgun inbound routes to Reloop handlers.",
		duration: "15 min",
		visual: "domains" as const,
	},
	{
		step: 3,
		title: "Step 3",
		body: "Re-point event webhooks at Reloop, move suppression lists across, then shift traffic domain by domain until Mailgun is idle.",
		duration: "1 afternoon",
		visual: "success" as const,
	},
];

const MailgunComparisonPage = () => {
	const mailgunBrand = competitorBrands.find((b) => b.name === "Mailgun");
	const compare = getComparePage("mailgun");

	return (
		<>
			<ComparePageJsonLd slug="mailgun" />
			<ComparisonPageShell
				pagePath={pagePath}
				titleLines={["Reloop vs Mailgun"]}
				description="Mailgun gives you REST, SMTP, and inbound routes as a hosted service under Sinch. Reloop gives you the same sending surface with the source code and a self-host path behind it."
				primaryCta={{
					label: "Get Started ",
					href: "/dashboard/signup",
				}}
				secondaryCta={{
					label: "Migrate from Mailgun",
					href: "/compare/mailgun#migrate",
				}}
			>
				<CompareSection flushTop maxWidth="full">
					<CompareHeroStatStrip stats={mailgunStats} />
				</CompareSection>

				<CompareSection maxWidth="full">
					<div className="mx-auto max-w-3xl space-y-6 text-center">
						<span className="font-bold text-[12px] text-text-sub-600 uppercase tracking-widest dark:text-white/50">
							The Exit Question
						</span>
						<h2 className="font-serif text-[2rem] text-text-strong-950 leading-tight tracking-tight sm:text-[2.5rem] dark:text-white">
							Mailgun works. Leaving it is the hard part.
						</h2>
						<p className="text-[16px] text-text-sub-600 leading-relaxed dark:text-white/60">
							Teams rarely move off Mailgun because the API stopped working.
							They move because the plan tier jumped, because inbound routes
							grew into a parsing layer nobody owns, or because the answer to
							&ldquo;what happens if we leave?&rdquo; is a rewrite. Reloop keeps
							the same sending surface and removes that last answer.
						</p>

						<div className="mt-8 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
							<div className="rounded-2xl border border-stroke-soft-200/80 bg-bg-weak-50/50 p-6 dark:border-white/10 dark:bg-white/[0.02]">
								<p className="font-semibold text-text-strong-950 dark:text-white">
									Plan tiers, not usage
								</p>
								<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/60">
									Basic covers 10,000 emails at $15/mo; the next real step is
									Foundation at $35/mo. Validation and dedicated IPs are priced
									on top. Reloop bills per send, and self-hosting removes the
									tier entirely.
								</p>
							</div>
							<div className="rounded-2xl border border-stroke-soft-200/80 bg-bg-weak-50/50 p-6 dark:border-white/10 dark:bg-white/[0.02]">
								<p className="font-semibold text-text-strong-950 dark:text-white">
									Inbound that outgrew routes
								</p>
								<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/60">
									Support inboxes and reply parsing start as one Mailgun route
									and end as a service. Reloop&apos;s agent inbox handles
									triage, spam scoring, and threading before the webhook fires.
								</p>
							</div>
							<div className="rounded-2xl border border-stroke-soft-200/80 bg-bg-white-0 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
								<p className="font-semibold text-primary-base">
									Reputation you can take with you
								</p>
								<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/60">
									Deliverability follows your domains and IPs, not the
									dashboard. Self-hosted Reloop attaches your own IPs directly
									to the MTA, so the sending identity stays yours.
								</p>
							</div>
						</div>
					</div>
				</CompareSection>

				<CompareSection maxWidth="full" flushX>
					<div className="mb-10 text-center">
						<h2 className="mt-3 font-serif text-[2rem] text-text-strong-950 leading-[1.1] tracking-tighter sm:text-[2.4rem] lg:text-[2.8rem] dark:text-white">
							Reloop &nbsp;&nbsp;vs&nbsp;&nbsp;&nbsp;Mailgun
						</h2>
						<p className="mx-auto mt-3 max-w-xl font-medium text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
							List prices, sending surface, and what you keep if you walk away.
						</p>
					</div>

					<ComparisonMatrix
						competitorName="Mailgun"
						categories={mailgunComparisonCategories}
					/>

					<p className="mt-6 text-center text-[13px] text-text-sub-600 dark:text-white/40">
						Seen something inaccurate?{" "}
						<Link href="/contact" className="font-semibold text-primary-base">
							Tell us
						</Link>
						. We correct comparison pages when public features change.
					</p>
				</CompareSection>

				<CompareSection maxWidth="full">
					{mailgunBrand ? (
						<CompareMigrate
							competitorName="Mailgun"
							competitorIcon={mailgunBrand.icon}
							primaryHref="/dashboard/signup"
							guideHref="/docs"
							steps={mailgunMigrateSteps}
						/>
					) : null}
					<p className="mx-auto mt-10 max-w-2xl px-4 text-center text-[14px] text-text-sub-600 dark:text-white/50">
						The{" "}
						<Link
							href="/features/smtp"
							className="font-semibold text-primary-base"
						>
							Reloop SMTP guide
						</Link>{" "}
						covers credential rotation without downtime. Reloop is not a drop-in
						Mailgun proxy, so plan a small client adapter for API senders.
					</p>
				</CompareSection>

				<FaqSection
					id="compare-mailgun-faq"
					title="Mailgun vs Reloop FAQ"
					items={compare?.faqs ?? []}
					compact
					flush
				/>

				<CompareSection maxWidth="full" noDivider>
					<CompareOtherLinks currentHref={pagePath} />
				</CompareSection>
			</ComparisonPageShell>
		</>
	);
};

export default MailgunComparisonPage;
