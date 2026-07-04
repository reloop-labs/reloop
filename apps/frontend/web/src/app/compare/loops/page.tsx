import { FaqSection } from "@reloop/web/components/faq-section";
import { PageSection, SectionHeading } from "@reloop/web/components/page-shell";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { CompareOtherLinks } from "../components/compare-other-links";
import { ComparisonPageShell } from "../components/comparison-page-shell";
import { ComparisonTable } from "../components/comparison-table";

const pagePath = "/compare/loops";
const pageUrl = `${getSiteUrl()}${pagePath}`;

export const metadata: Metadata = {
	title: "Reloop vs Loops | Email Provider Comparison",
	description:
		"Reloop vs Loops for SaaS product email, lifecycle campaigns, transactional API, and avoiding two-vendor email stacks.",
	keywords: [
		"Reloop vs Loops",
		"Loops alternative",
		"SaaS email comparison",
		"product email platform",
		"lifecycle email comparison",
	],
	openGraph: {
		title: "Reloop vs Loops",
		description: "Product email for SaaS—hosted UI vs open developer platform.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Reloop vs Loops | Email Provider Comparison",
		description:
			"SaaS product email, lifecycle campaigns, transactional API, and avoiding two-vendor email stacks.",
	},
	alternates: { canonical: pageUrl },
};

const LoopsComparisonPage = () => {
	return (
		<ComparisonPageShell
			pagePath={pagePath}
			titleLines={["Reloop vs Loops"]}
			description="Loops is built for SaaS lifecycle email—onboarding, updates, and newsletters with a polished marketer UI. Reloop covers that surface plus transactional API, SMTP, and self-hosting."
		>
			<PageSection flushTop narrow>
				<div className="mx-auto max-w-3xl space-y-6 text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
					<p>
						Loops found a niche: founders and growth teams at SaaS companies who
						want beautiful product email without learning Mailchimp. The editor
						is fast, the brand is modern, and the mental model is{" "}
						<em>audience → loop → send</em>.
					</p>
					<p>
						The gap appears when engineering needs password resets, billing
						receipts, and webhook-driven sends at the same domains and
						reputation pool. Many Loops customers add Resend or Postmark beside
						it. Reloop is for teams that want{" "}
						<strong className="text-text-strong-950 dark:text-white">
							product email and transactional infrastructure together
						</strong>
						—with APIs their backend already understands.
					</p>
				</div>
			</PageSection>

			<PageSection>
				<SectionHeading
					title="The two-vendor problem"
					description="What Loops + transactional API stacks look like in practice."
					compact
				/>
				<div className="mx-auto max-w-3xl rounded-3xl border border-stroke-soft-200 bg-[#0a0d12] p-6 font-mono text-[13px] text-white/80 sm:p-8 dark:border-white/10">
					<p className="text-white/40">// Typical SaaS email stack today</p>
					<p className="mt-3">Loops → onboarding &amp; newsletters</p>
					<p>Resend / Postmark → auth emails &amp; receipts</p>
					<p>Stripe → billing events → second API client</p>
					<p className="mt-3 text-primary-base">
						Reloop → all of the above, one API key
					</p>
				</div>
			</PageSection>

			<PageSection alt>
				<ComparisonTable
					competitorName="Loops"
					features={[
						{
							label: "Open-source codebase",
							reloop: "Yes (Apache 2.0)",
							competitor: "No",
						},
						{ label: "Self-hostable", reloop: "Yes", competitor: "No" },
						{
							label: "SaaS lifecycle / product email",
							reloop: "Yes",
							competitor: "Yes (core)",
						},
						{
							label: "Transactional REST API",
							reloop: "Yes",
							competitor: "Limited",
						},
						{ label: "SMTP relay", reloop: "Yes", competitor: "No" },
						{ label: "Marketing campaigns", reloop: "Yes", competitor: "Yes" },
						{ label: "Webhooks", reloop: "Yes", competitor: "Yes" },
						{ label: "Agent inbox / AI", reloop: "Yes", competitor: "No" },
						{
							label: "Pricing basis",
							reloop: "Emails sent",
							competitor: "Contacts / audience",
						},
					]}
				/>
			</PageSection>

			<PageSection narrow>
				<SectionHeading
					title="Consolidating Loops + transactional"
					description="How teams unify without losing lifecycle automations."
					compact
				/>
				<ul className="mx-auto max-w-2xl space-y-4 text-[15px] text-text-sub-600 dark:text-white/60">
					<li>
						Export Loops audiences and recreate segments in Reloop contacts—with
						API sync from your product database going forward.
					</li>
					<li>
						Rebuild onboarding loops as Reloop campaigns triggered by product
						events (signup, trial end, feature activation).
					</li>
					<li>
						Point auth and billing services at Reloop&apos;s transactional
						endpoint; delete the secondary API vendor.
					</li>
					<li>
						Use one set of domain authentication records and one deliverability
						reputation pool.
					</li>
				</ul>
			</PageSection>

			<FaqSection
				id="compare-loops-faq"
				title="Loops vs Reloop FAQ"
				items={[
					{
						question: "Is Reloop's marketer UI as polished as Loops?",
						answer:
							"Loops optimizes for marketer-first UX. Reloop balances marketer campaigns with developer APIs—choose based on whether engineering owns the email stack day-to-day.",
					},
					{
						question: "Can we migrate one product line at a time?",
						answer:
							"Yes. Many teams move transactional sends first (lower risk), then migrate lifecycle campaigns once domains are warm on Reloop.",
					},
				]}
				compact
			/>

			<PageSection narrow>
				<CompareOtherLinks currentHref={pagePath} />
			</PageSection>
		</ComparisonPageShell>
	);
};

export default LoopsComparisonPage;
