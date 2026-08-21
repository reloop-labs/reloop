import { FaqSection } from "@reloop/web/components/faq-section";
import { PageSection, SectionHeading } from "@reloop/web/components/page-shell";
import { sendgridFeatures, getComparePage } from "@reloop/web/lib/compare-content";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { ComparePageJsonLd } from "../components/compare-json-ld";
import { CompareOtherLinks } from "../components/compare-other-links";
import { ComparisonPageShell } from "../components/comparison-page-shell";
import { ComparisonTable } from "../components/comparison-table";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pagePath = "/compare/sendgrid";
const pageUrl = `${getSiteUrl()}${pagePath}`;

export const metadata: Metadata = {
	title: "Reloop vs SendGrid | Email Provider Comparison",
	description:
		"Learn how Reloop compares to SendGrid and why Reloop is the best SendGrid alternative for all your transactional and marketing email needs.",
	keywords: [
		"Reloop vs SendGrid",
		"SendGrid alternative",
		"Twilio SendGrid alternative",
		"email platform comparison",
		"open source SendGrid",
	],
	openGraph: {
		title: "Reloop vs SendGrid",
		description:
			"Learn how Reloop compares to SendGrid and why Reloop is the best SendGrid alternative for all your transactional and marketing email needs.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Reloop vs SendGrid | Email Provider Comparison",
		description:
			"Learn how Reloop compares to SendGrid and why Reloop is the best SendGrid alternative for all your transactional and marketing email needs.",
	},
	alternates: { canonical: pageUrl },
};

const SendGridComparisonPage = () => {
	const compare = getComparePage("sendgrid");
	return (
		<>
			<ComparePageJsonLd slug="sendgrid" />
			<ComparisonPageShell
				pagePath={pagePath}
				titleLines={["Reloop vs SendGrid"]}
				description="Learn how Reloop compares to SendGrid and why Reloop is the best SendGrid alternative for all your transactional and marketing email needs."
			>
			<PageSection flushTop narrow>
				<p className="mx-auto max-w-3xl text-center text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
					SendGrid bundles transactional APIs, marketing campaigns, templates,
					suppression management, and deliverability tooling—often sold with
					annual commits and sales-assisted upgrades. It works at scale, but
					many teams inherit it through acquisition rather than active choice.
					Reloop offers a modern, API-first platform you can{" "}
					<strong className="text-text-strong-950 dark:text-white">
						host or run hosted
					</strong>
					, with campaigns and transactional sends in one codebase.
				</p>
			</PageSection>

			<PageSection>
				<div className="rounded-3xl border border-stroke-soft-200 bg-bg-weak-50 p-8 dark:border-white/10">
					<h2 className="font-serif text-[1.8rem] text-text-strong-950 tracking-tighter dark:text-white">
						Common SendGrid pain points we hear
					</h2>
					<div className="mt-6 grid gap-6 sm:grid-cols-2">
						<div>
							<p className="font-semibold text-text-strong-950 dark:text-white">
								UI vs API drift
							</p>
							<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
								Marketing teams use the dashboard; engineering uses APIs. Two
								products evolved separately—syncing templates and audiences is
								fragile.
							</p>
						</div>
						<div>
							<p className="font-semibold text-text-strong-950 dark:text-white">
								Twilio bundle pressure
							</p>
							<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
								Email spend sits beside SMS and voice on one bill. Leaving
								SendGrid rarely feels like a standalone decision.
							</p>
						</div>
						<div>
							<p className="font-semibold text-text-strong-950 dark:text-white">
								No self-host option
							</p>
							<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
								Regulated customers cannot move message metadata on-prem without
								changing vendors entirely.
							</p>
						</div>
						<div>
							<p className="font-semibold text-text-strong-950 dark:text-white">
								AI workflows are external
							</p>
							<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
								Agent inboxes and LLM-driven triage require third-party tools on
								top of SendGrid events.
							</p>
						</div>
					</div>
				</div>
			</PageSection>

			<PageSection alt>
				<SectionHeading title="SendGrid vs Reloop" compact />
				<ComparisonTable
					competitorName="SendGrid"
					features={sendgridFeatures}
				/>
			</PageSection>

			<PageSection narrow>
				<SectionHeading
					title="Enterprise migration checklist"
					description="For teams with multiple SendGrid subusers and template libraries."
					compact
				/>
				<ul className="mx-auto max-w-2xl space-y-3 text-[15px] text-text-sub-600 dark:text-white/60">
					<li className="flex gap-3">
						<span className="text-primary-base">▸</span>
						Inventory subusers, API keys, and IP pools—map each to Reloop orgs
						or environments.
					</li>
					<li className="flex gap-3">
						<span className="text-primary-base">▸</span>
						Export dynamic templates and contact segments; rebuild automations
						in Reloop campaigns or via API triggers.
					</li>
					<li className="flex gap-3">
						<span className="text-primary-base">▸</span>
						Run shadow traffic: duplicate transactional sends to Reloop in
						staging with real payloads.
					</li>
					<li className="flex gap-3">
						<span className="text-primary-base">▸</span>
						Align marketing and engineering on a single template source of truth
						going forward.
					</li>
				</ul>
			</PageSection>

			<FaqSection
				id="compare-sendgrid-faq"
				title="SendGrid vs Reloop FAQ"
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

export default SendGridComparisonPage;
