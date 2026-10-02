import { FaqSection } from "@reloop/web/components/faq-section";
import { PageSection, SectionHeading } from "@reloop/web/components/page-shell";
import {
	getComparePage,
	sendgridFeatures,
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

const pagePath = "/compare/sendgrid";
const pageUrl = `${getSiteUrl()}${pagePath}`;

export const metadata: Metadata = {
	title: "Reloop vs SendGrid: API-First Email Without Annual Lock-In (2026)",
	description:
		"Compare Reloop vs SendGrid in 2026: open-source SendGrid alternative with self-hosting, $10/50k vs $19.95/50k, no annual commit, plus migration checklist.",
	keywords: [
		"Reloop vs SendGrid",
		"SendGrid alternative",
		"SendGrid alternatives 2026",
		"Twilio SendGrid alternative",
		"open source SendGrid alternative",
		"self-hosted SendGrid alternative",
		"SendGrid vs Reloop pricing",
		"best SendGrid alternative",
	],
	openGraph: {
		title: "Reloop vs SendGrid: API-First Email Without Annual Lock-In (2026)",
		description:
			"Compare Reloop vs SendGrid in 2026: open-source SendGrid alternative with self-hosting, $10/50k vs $19.95/50k, no annual commit, plus migration checklist.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Reloop vs SendGrid: API-First Email Without Annual Lock-In (2026)",
		description:
			"Compare Reloop vs SendGrid in 2026: open-source SendGrid alternative with self-hosting, $10/50k vs $19.95/50k, no annual commit, plus migration checklist.",
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
				description="The open-source SendGrid alternative for 2026: API-first email with self-hosting, monthly tiers, and an agent inbox — no Twilio bundle or annual commit. By Reloop Labs."
				updatedAt="September 17, 2026"
			>
				<PageSection flushTop narrow>
					<p className="mx-auto max-w-3xl text-center text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
						SendGrid bundles transactional APIs, marketing campaigns, templates,
						suppression management, and deliverability tooling, often sold with
						annual commits and sales-assisted upgrades. It works at scale, but
						many teams inherit it through acquisition rather than active choice.
						Reloop offers a modern, API-first platform you can{" "}
						<strong className="text-text-strong-950 dark:text-white">
							host or run hosted
						</strong>
						, with campaigns and transactional sends in one codebase.
					</p>
					<div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] p-5 text-left sm:p-6">
						<p className="font-semibold text-[14px] text-text-strong-950 dark:text-white">
							Verdict: choose Reloop for ownership and monthly flexibility; stay
							on SendGrid if your tuned enterprise setup already pays.
						</p>
						<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/60">
							At 50,000 emails/month Reloop Pro is $10 vs SendGrid Essentials
							around $19.95; at 100,000/month Reloop Growth is $20 vs roughly
							$34.95 — before SendGrid annual commits. Add Apache 2.0 source
							access, self-hosting, and an agent inbox, and Reloop is the better
							default for teams choosing actively in 2026. Stay on SendGrid if
							subusers, IP pools, and deliverability tooling are already tuned
							and the commit math favors you. Pricing as of September 17, 2026 —
							see{" "}
							<Link href="/pricing" className="underline underline-offset-2">
								reloop.sh/pricing
							</Link>{" "}
							and{" "}
							<Link
								href="/alternatives/sendgrid"
								className="font-semibold text-primary-base"
							>
								best SendGrid alternative
							</Link>
							.
						</p>
					</div>
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
									products evolved separately, and syncing templates and
									audiences is fragile.
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
									Regulated customers cannot move message metadata on-prem
									without changing vendors entirely.
								</p>
							</div>
							<div>
								<p className="font-semibold text-text-strong-950 dark:text-white">
									AI workflows are external
								</p>
								<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
									Agent inboxes and LLM-driven triage require third-party tools
									on top of SendGrid events.
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
						title="Pricing: monthly tiers vs annual commits"
						description="Public list prices as of September 17, 2026. SendGrid figures change with plans and commits — verify before deciding."
						compact
					/>
					<div className="mx-auto max-w-2xl space-y-4 text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60">
						<p>
							SendGrid Essentials lists around $19.95/month for 50,000 emails
							and roughly $34.95/month at 100,000 emails, with enterprise volume
							typically moving to annual, sales-assisted contracts. Reloop Pro
							is $10/month for 50,000 emails and Growth is $20/month for
							100,000, both monthly with no annual lock-in — and a self-host
							path (Apache 2.0, no Reloop license fee) that removes per-send
							billing entirely.
						</p>
						<p>
							The gap compounds with overage and add-ons: Reloop overage is a
							flat $0.50 per 1,000, while SendGrid costs scale with tier jumps
							and IP or feature add-ons. If your SendGrid bill is dominated by a
							commit you negotiated two renewals ago, model trailing-90-day
							volume against{" "}
							<Link href="/pricing" className="font-semibold text-primary-base">
								published Reloop plans
							</Link>{" "}
							before re-signing.
						</p>
					</div>
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
							Inventory subusers, API keys, and IP pools, then map each to
							Reloop orgs or environments.
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
							Align marketing and engineering on a single template source of
							truth going forward.
						</li>
					</ul>
				</PageSection>

				<FaqSection
					id="compare-sendgrid-faq"
					title="SendGrid vs Reloop FAQ"
					items={compare?.faqs ?? []}
					compact
					flush
				/>

				<PageSection narrow>
					<div id="methodology" className="scroll-mt-28">
						<SectionHeading
							title="How we compared — and who wrote this"
							description="By Reloop Labs, the team behind Reloop."
							compact
						/>
						<div className="mx-auto max-w-2xl space-y-4 text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60">
							<p>
								This page is our perspective, not a neutral third party. Feature
								claims come from public docs and the Reloop codebase — no
								invented benchmarks or latency shootouts. Competitor strengths
								(subuser hierarchies, deliverability tooling) are stated where
								they hold; unknowns are marked plainly rather than guessed.
							</p>
							<p>
								Pricing reflects public list prices last checked September 17,
								2026 and can change. SendGrid figures in particular vary by plan
								and commit — verify on their pricing page and{" "}
								<Link href="/pricing" className="underline underline-offset-2">
									reloop.sh/pricing
								</Link>
								. Seen something inaccurate?{" "}
								<Link
									href="/contact"
									className="font-semibold text-primary-base"
								>
									Tell us
								</Link>{" "}
								— we correct comparison pages when the facts change. Related:{" "}
								<Link
									href="/alternatives/sendgrid"
									className="font-semibold text-primary-base"
								>
									best SendGrid alternative
								</Link>
								,{" "}
								<Link
									href="/features/transaction-emails"
									className="font-semibold text-primary-base"
								>
									transactional email
								</Link>
								,{" "}
								<Link href="/docs" className="font-semibold text-primary-base">
									API docs
								</Link>
								.
							</p>
						</div>
					</div>
				</PageSection>

				<PageSection>
					<CompareOtherLinks currentHref={pagePath} />
				</PageSection>
			</ComparisonPageShell>
		</>
	);
};

export default SendGridComparisonPage;
