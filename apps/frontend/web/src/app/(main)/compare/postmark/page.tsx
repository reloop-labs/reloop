import { FaqSection } from "@reloop/web/components/faq-section";
import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
	SectionHeading,
} from "@reloop/web/components/page-shell";
import { getSiteUrl, hostedSignupHref } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { CompareOtherLinks } from "../components/compare-other-links";
import { ComparisonTable } from "../components/comparison-table";

const pagePath = "/compare/postmark";
const pageUrl = `${getSiteUrl()}${pagePath}`;

export const metadata: Metadata = {
	title: "Reloop vs Postmark | Email Provider Comparison",
	description:
		"Reloop vs Postmark for transactional email speed, deliverability reporting, campaigns, and open-source infrastructure.",
	openGraph: {
		title: "Reloop vs Postmark",
		description: "Transactional email specialists—hosted proprietary vs open platform.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	alternates: { canonical: pageUrl },
};

const PostmarkComparisonPage = () => {
	return (
		<MarketingPageShell
			titleLines={["Reloop vs Postmark"]}
			description="Postmark optimizes for fast transactional delivery and clear telemetry. Reloop matches that core job—and adds campaigns, self-hosting, and source-level transparency."
			primaryCta={{ label: "Try Reloop free", href: hostedSignupHref }}
			secondaryCta={{ label: "All comparisons", href: "/compare" }}
			compactHero
		>
			<PageSection flushTop narrow>
				<p className="mx-auto max-w-3xl text-center text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
					Postmark is deliberately focused: transactional messages, excellent
					delivery stats, message streams, and a reputation for reliability.
					They are not trying to be a marketing automation suite—which is fine
					if that is all you need. Reloop serves teams that want{" "}
					<strong className="text-text-strong-950 dark:text-white">
						transactional rigor plus growth features
					</strong>{" "}
					without bolting on Mailchimp or a second API vendor.
				</p>
			</PageSection>

			<PageSection>
				<div className="flex flex-col gap-8 lg:flex-row lg:items-start">
					<div className="lg:w-1/2">
						<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
							Postmark&apos;s edge
						</p>
						<h2 className="mt-3 font-serif text-[2rem] tracking-tighter sm:text-[2.4rem] dark:text-white">
							Transactional{" "}
							<span className="text-primary-base">precision.</span>
						</h2>
						<p className="mt-4 text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60">
							Separate message streams for transactional vs broadcast traffic,
							detailed bounce categorization, and a product team that refuses
							feature bloat. If your only job is password resets and receipts at
							high trust, Postmark is a credible choice.
						</p>
					</div>
					<div className="lg:w-1/2">
						<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
							Reloop&apos;s edge
						</p>
						<h2 className="mt-3 font-serif text-[2rem] tracking-tighter sm:text-[2.4rem] dark:text-white">
							Platform{" "}
							<span className="text-primary-base">breadth.</span>
						</h2>
						<p className="mt-4 text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60">
							When product-led growth teams need onboarding campaigns, SMTP for
							legacy services, and agent inbox triage on the same domains you
							use for transactional mail, Reloop keeps it in one auditable stack.
						</p>
					</div>
				</div>
			</PageSection>

			<PageSection alt>
				<ComparisonTable
					competitorName="Postmark"
					features={[
						{
							label: "Open-source codebase",
							reloop: "Yes (Apache 2.0)",
							competitor: "No",
						},
						{ label: "Self-hostable", reloop: "Yes", competitor: "No" },
						{ label: "Transactional API", reloop: "Yes", competitor: "Yes" },
						{ label: "Delivery analytics", reloop: "Yes", competitor: "Yes (detailed)" },
						{ label: "Marketing campaigns", reloop: "Yes", competitor: "Limited" },
						{ label: "SMTP relay", reloop: "Yes", competitor: "Yes" },
						{ label: "Message streams / separation", reloop: "Domain + campaign types", competitor: "Streams" },
						{ label: "Agent inbox", reloop: "Yes", competitor: "No" },
						{
							label: "Free tier",
							reloop: "3,000 emails / month",
							competitor: "Trial credits",
						},
					]}
				/>
			</PageSection>

			<PageSection narrow>
				<SectionHeading
					title="From Postmark servers to Reloop"
					description="Preserve stream separation while you migrate."
					compact
				/>
				<p className="mx-auto max-w-2xl text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60">
					Map each Postmark server (transactional vs broadcast) to Reloop
					domains or campaign types. Export templates via API, recreate
					suppression preferences, and run dual-send in staging until bounce
					rates match baseline. Postmark&apos;s bounce taxonomy maps to Reloop
					webhook event types—your handlers need label updates, not architecture
					rewrites.
				</p>
			</PageSection>

			<FaqSection
				id="compare-postmark-faq"
				title="Postmark vs Reloop FAQ"
				items={[
					{
						question: "Does Reloop match Postmark latency?",
						answer:
							"Hosted Reloop targets production-grade transactional latency. Self-hosted performance depends on your network and MTA setup—same as any self-managed stack.",
					},
					{
						question: "Should we use both for streams?",
						answer:
							"Reloop can separate transactional API sends from campaign traffic without two vendors. Most Postmark stream use cases map to Reloop domains plus campaign modules.",
					},
				]}
				compact
			/>

			<PageSection narrow flushTop>
				<CompareOtherLinks currentHref={pagePath} />
			</PageSection>

			<FeatureCta
				title="Transactional + campaigns"
				titleMuted="One vendor."
				description="Keep Postmark-level care for receipts while your team runs newsletters on the same platform."
				primary={{ label: "Start free", href: hostedSignupHref }}
				secondary={{ label: "All comparisons", href: "/compare" }}
				compact
			/>
		</MarketingPageShell>
	);
};

export default PostmarkComparisonPage;
