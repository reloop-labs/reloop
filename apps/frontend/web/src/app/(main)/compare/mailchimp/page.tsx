import { FaqSection } from "@reloop/web/components/faq-section";
import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
	SectionHeading,
} from "@reloop/web/components/page-shell";
import { getSiteUrl, hostedSignupHref } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { CompareOtherLinks } from "../components/compare-other-links";
import { ComparisonTable } from "../components/comparison-table";

const pagePath = "/compare/mailchimp";
const pageUrl = `${getSiteUrl()}${pagePath}`;

export const metadata: Metadata = {
	title: "Reloop vs Mailchimp | Email Provider Comparison",
	description:
		"Reloop vs Mailchimp for newsletters, audience pricing, transactional email, and developer-first campaign APIs.",
	openGraph: {
		title: "Reloop vs Mailchimp",
		description: "Marketing automation vs API-first email platform with send-based pricing.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	alternates: { canonical: pageUrl },
};

const MailchimpComparisonPage = () => {
	return (
		<MarketingPageShell
			titleLines={["Reloop vs Mailchimp"]}
			description="Mailchimp owns small-business marketing email. Reloop is for product teams that need campaigns and transactional sends with APIs—not audience-based bills."
			primaryCta={{ label: "Try Reloop free", href: hostedSignupHref }}
			secondaryCta={{ label: "All comparisons", href: "/compare" }}
			compactHero
		>
			<PageSection flushTop narrow>
				<div className="mx-auto max-w-3xl space-y-6 text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
					<p>
						Mailchimp prices by how many contacts you store—not how many emails
						you actually send. That model works for newsletters with huge lists
						and infrequent sends. It punishes API-driven products that email
						active users often but don&apos;t need to pay for dormant contacts.
					</p>
					<p>
						Transactional email (Mandrill) was historically a separate
						product—and still feels bolted on. Reloop charges by{" "}
						<strong className="text-text-strong-950 dark:text-white">
							send volume
						</strong>
						, exposes everything via API, and includes campaigns without a
						separate SKU.
					</p>
				</div>
			</PageSection>

			<PageSection>
				<SectionHeading
					title="Audience pricing vs send pricing"
					description="Why developer-led products feel Mailchimp bills."
					compact
				/>
				<div className="grid gap-6 sm:grid-cols-2">
					<div className="rounded-2xl border border-stroke-soft-200 p-6 dark:border-white/10">
						<h3 className="font-semibold text-text-strong-950 dark:text-white">
							Mailchimp model
						</h3>
						<p className="mt-3 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
							10,000 contacts on a free or starter tier—even if only 500 receive
							monthly mail—can force an upgrade. Engineering-triggered sends
							often require Mandrill or a third integration.
						</p>
					</div>
					<div className="rounded-2xl border border-primary-base/30 bg-primary-base/5 p-6">
						<h3 className="font-semibold text-text-strong-950 dark:text-white">
							Reloop model
						</h3>
						<p className="mt-3 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/60">
							3,000 emails free, then tiers by monthly sends (50k, 250k, custom).
							Store contacts for segmentation without audience-based surcharges.
							See{" "}
							<Link href="/pricing" className="font-semibold text-primary-base">
								pricing details
							</Link>
							.
						</p>
					</div>
				</div>
			</PageSection>

			<PageSection alt>
				<ComparisonTable
					competitorName="Mailchimp"
					features={[
						{
							label: "Open-source codebase",
							reloop: "Yes (Apache 2.0)",
							competitor: "No",
						},
						{ label: "Self-hostable", reloop: "Yes", competitor: "No" },
						{ label: "Newsletter / campaigns", reloop: "Yes", competitor: "Yes (primary)" },
						{ label: "Transactional API", reloop: "Yes", competitor: "Separate product path" },
						{ label: "SMTP relay", reloop: "Yes", competitor: "Limited" },
						{ label: "Developer API focus", reloop: "Primary", competitor: "Secondary" },
						{ label: "Visual drag-and-drop editor", reloop: "Yes", competitor: "Yes (advanced)" },
						{ label: "Agent inbox", reloop: "Yes", competitor: "No" },
						{
							label: "Pricing basis",
							reloop: "Emails sent",
							competitor: "Contacts stored",
						},
					]}
				/>
			</PageSection>

			<PageSection narrow>
				<SectionHeading
					title="Leaving Mailchimp for a product stack"
					description="What marketing + engineering teams do together."
					compact
				/>
				<ol className="mx-auto max-w-2xl list-none space-y-3 text-[15px] text-text-sub-600 dark:text-white/60">
					<li>
						<strong className="text-text-strong-950 dark:text-white">Marketing:</strong>{" "}
						Export templates and audiences; rebuild segments from your CRM or
						product DB in Reloop.
					</li>
					<li>
						<strong className="text-text-strong-950 dark:text-white">Engineering:</strong>{" "}
						Replace Mandrill or SMTP plugins with Reloop API sends for auth and
						billing events.
					</li>
					<li>
						<strong className="text-text-strong-950 dark:text-white">Ops:</strong>{" "}
						Consolidate DNS to one provider; monitor one webhook stream for
						campaign and transactional events.
					</li>
				</ol>
			</PageSection>

			<FaqSection
				id="compare-mailchimp-faq"
				title="Mailchimp vs Reloop FAQ"
				items={[
					{
						question: "Can non-technical teammates still send campaigns?",
						answer:
							"Yes. Reloop includes a campaign builder and template editor. Mailchimp's visual editor is more mature for pure marketer workflows—evaluate with your marketing lead.",
					},
					{
						question: "Is Reloop only for developers?",
						answer:
							"Reloop is developer-first but not developer-only. Teams that want API control and marketer-friendly campaigns fit best.",
					},
				]}
				compact
			/>

			<PageSection narrow flushTop>
				<CompareOtherLinks currentHref={pagePath} />
			</PageSection>

			<FeatureCta
				title="Pay for sends, not shelfware contacts"
				titleMuted="Try Reloop free."
				description="3,000 emails per month—campaigns and transactional included."
				primary={{ label: "Get started", href: hostedSignupHref }}
				secondary={{ label: "Compare pricing", href: "/pricing" }}
				compact
			/>
		</MarketingPageShell>
	);
};

export default MailchimpComparisonPage;
