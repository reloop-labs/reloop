import { FaqSection } from "@reloop/web/components/faq-section";
import { PageSection, SectionHeading } from "@reloop/web/components/page-shell";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { CompareOtherLinks } from "../components/compare-other-links";
import { ComparisonPageShell } from "../components/comparison-page-shell";
import { ComparisonTable } from "../components/comparison-table";

const pagePath = "/compare/sendgrid";
const pageUrl = `${getSiteUrl()}${pagePath}`;

export const metadata: Metadata = {
	title: "Reloop vs SendGrid | Email Provider Comparison",
	description:
		"Reloop vs SendGrid for transactional email, marketing campaigns, enterprise scale, and escaping Twilio vendor lock-in.",
	openGraph: {
		title: "Reloop vs SendGrid",
		description:
			"Enterprise email platform comparison—hosted, self-hosted, and open source.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	alternates: { canonical: pageUrl },
};

const SendGridComparisonPage = () => {
	return (
		<ComparisonPageShell
			pagePath={pagePath}
			titleLines={["Reloop vs SendGrid"]}
			description="SendGrid is the incumbent for high-volume email inside Twilio. This comparison is for teams auditing contracts, UI complexity, and whether they need the full proprietary stack."
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
					features={[
						{
							label: "Open-source codebase",
							reloop: "Yes (Apache 2.0)",
							competitor: "No",
						},
						{ label: "Self-hostable", reloop: "Yes", competitor: "No" },
						{ label: "Transactional API", reloop: "Yes", competitor: "Yes" },
						{ label: "Marketing campaigns", reloop: "Yes", competitor: "Yes" },
						{ label: "Template editor", reloop: "Yes", competitor: "Yes" },
						{ label: "SMTP relay", reloop: "Yes", competitor: "Yes" },
						{ label: "Webhooks", reloop: "Yes", competitor: "Yes" },
						{
							label: "Agent inbox",
							reloop: "Built-in",
							competitor: "Not included",
						},
						{
							label: "Contract flexibility",
							reloop: "Monthly tiers + self-host",
							competitor: "Often annual enterprise",
						},
					]}
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
				items={[
					{
						question: "Can Reloop handle SendGrid-scale volume?",
						answer:
							"Yes. Hosted Essentials and Enterprise tiers target high throughput; self-hosted Reloop scales with your Kubernetes or bare-metal footprint.",
					},
					{
						question: "What about dedicated IPs?",
						answer:
							"Enterprise Reloop supports dedicated IP requirements. Self-hosted deployments can attach your own IPs directly to your MTA layer.",
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

export default SendGridComparisonPage;
