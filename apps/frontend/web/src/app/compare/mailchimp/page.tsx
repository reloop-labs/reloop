import { FaqSection } from "@reloop/web/components/faq-section";
import { PageSection, SectionHeading } from "@reloop/web/components/page-shell";
import {
	getComparePage,
	mailchimpFeatures,
} from "@reloop/web/lib/compare-content";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { ComparePageJsonLd } from "../components/compare-json-ld";
import { CompareOtherLinks } from "../components/compare-other-links";
import { ComparisonPageShell } from "../components/comparison-page-shell";
import { ComparisonTable } from "../components/comparison-table";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pagePath = "/compare/mailchimp";
const pageUrl = `${getSiteUrl()}${pagePath}`;

export const metadata: Metadata = {
	title: "Reloop vs Mailchimp | Email Provider Comparison",
	description:
		"Learn how Reloop compares to Mailchimp and why Reloop is the best Mailchimp alternative for all your product and marketing email needs.",
	keywords: [
		"Reloop vs Mailchimp",
		"Mailchimp alternative",
		"newsletter platform comparison",
		"email marketing comparison",
		"open source Mailchimp alternative",
	],
	openGraph: {
		title: "Reloop vs Mailchimp",
		description:
			"Learn how Reloop compares to Mailchimp and why Reloop is the best Mailchimp alternative for all your product and marketing email needs.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Reloop vs Mailchimp | Email Provider Comparison",
		description:
			"Learn how Reloop compares to Mailchimp and why Reloop is the best Mailchimp alternative for all your product and marketing email needs.",
	},
	alternates: { canonical: pageUrl },
};

const MailchimpComparisonPage = () => {
	const compare = getComparePage("mailchimp");
	return (
		<>
			<ComparePageJsonLd slug="mailchimp" />
			<ComparisonPageShell
				pagePath={pagePath}
				titleLines={["Reloop vs Mailchimp"]}
				description="Learn how Reloop compares to Mailchimp and why Reloop is the best Mailchimp alternative for all your product and marketing email needs."
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
							3,000 emails free (200/day), then Individual $10/mo (25,000),
							Startup $20/mo (50,000), Enterprise custom. Store contacts for
							segmentation without audience-based surcharges. See{" "}
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
					features={mailchimpFeatures}
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
						<strong className="text-text-strong-950 dark:text-white">
							Marketing:
						</strong>{" "}
						Export templates and audiences; rebuild segments from your CRM or
						product DB in Reloop.
					</li>
					<li>
						<strong className="text-text-strong-950 dark:text-white">
							Engineering:
						</strong>{" "}
						Replace Mandrill or SMTP plugins with Reloop API sends for auth and
						billing events.
					</li>
					<li>
						<strong className="text-text-strong-950 dark:text-white">
							Ops:
						</strong>{" "}
						Consolidate DNS to one provider; monitor one webhook stream for
						campaign and transactional events.
					</li>
				</ol>
			</PageSection>

			<FaqSection
				id="compare-mailchimp-faq"
				title="Mailchimp vs Reloop FAQ"
				items={compare?.faqs ?? []}
				compact
			/>

			<PageSection>
				<CompareOtherLinks currentHref={pagePath} />
			</PageSection>
		</ComparisonPageShell>
		</>
	);
};

export default MailchimpComparisonPage;
