import { FaqSection } from "@reloop/web/components/faq-section";
import { PageSection, SectionHeading } from "@reloop/web/components/page-shell";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { CompareOtherLinks } from "../components/compare-other-links";
import { ComparisonPageShell } from "../components/comparison-page-shell";
import { ComparisonTabs } from "../components/comparison-tabs";
import { InfrastructureDiagram } from "../components/infrastructure-diagram";
import { resendComparisonCategories } from "./comparison-data";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pagePath = "/compare/resend";
const siteUrl = getSiteUrl();
const pageUrl = `${siteUrl}${pagePath}`;

export const metadata: Metadata = {
	title: "Reloop vs Resend: a detailed comparison",
	description:
		"Reloop vs Resend for developer email: own MTA vs Amazon SES, self-hosting, agent inbox, templates, webhooks, and pricing—without the hype.",
	keywords: [
		"Reloop vs Resend",
		"Resend alternative",
		"Resend comparison",
		"open source Resend alternative",
		"self-hosted email API",
		"KumoMTA email",
	],
	openGraph: {
		title: "Reloop vs Resend",
		description:
			"Own MTA vs SES-backed API. Self-hosting, agent inbox, and developer email—compared honestly.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Reloop vs Resend: a detailed comparison",
		description:
			"Own MTA vs Amazon SES, self-hosting, agent inbox, templates, and pricing.",
	},
	alternates: { canonical: pageUrl },
};

const ResendComparisonPage = () => {
	return (
		<ComparisonPageShell
			pagePath={pagePath}
			titleLines={["Reloop vs Resend"]}
			description="Resend made developer email feel modern. Reloop keeps that DX—and adds an own-MTA stack, self-hosting, and an agent inbox built for two-way email. Here’s the honest side-by-side."
			primaryCta={{ label: "Start free", href: `${siteUrl}/dashboard/signup` }}
			secondaryCta={{ label: "View pricing", href: `${siteUrl}/pricing` }}
		>
			<PageSection flushTop narrow>
				<div className="mx-auto max-w-3xl space-y-6 text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
					<p>
						Resend raised the bar for developer email—a clean API, React Email
						ergonomics, and a dashboard that feels effortless. A lot of teams
						start there, and for good reason.
					</p>
					<p>
						Reloop picks up where that leaves off: the same send, SMTP, and
						webhook basics, plus{" "}
						<strong className="font-semibold text-text-strong-950 dark:text-white">
							ownership and a two-way agent inbox
						</strong>
						. Read the source, self-host if you want, or run hosted—and receive
						replies into a real inbox your agents can work from. Below is a
						straight comparison of what each product actually ships today.
					</p>
				</div>
			</PageSection>

			<PageSection>
				<SectionHeading
					title="Side by side"
					description="The capabilities that matter when you’re choosing an email platform—grouped so you can skim what you care about."
					compact
				/>
				<ComparisonTabs
					competitorName="Resend"
					categories={resendComparisonCategories}
				/>
				<p className="mt-6 text-center text-[13px] text-text-sub-600 dark:text-white/40">
					Seen something inaccurate?{" "}
					<Link href="/contact" className="font-semibold text-primary-base">
						Tell us
					</Link>
					—we correct comparison pages when the facts change.
				</p>
			</PageSection>

			<PageSection alt>
				<SectionHeading
					title="What's under the hood matters"
					description="Resend’s public sending path goes through Amazon SES. Reloop sends through its own KumoMTA stack—hosted by us or self-hosted by you."
					compact
				/>
				<div className="mx-auto max-w-5xl">
					<InfrastructureDiagram
						src="/compare/reloop-vs-resend-infrastructure.webp"
						alt="Diagram comparing Reloop’s direct KumoMTA delivery path to Resend’s path through Amazon SES"
					/>
				</div>
				<div className="mx-auto mt-10 max-w-3xl space-y-5 text-[15px] text-text-sub-600 leading-7 dark:text-white/55">
					<p>
						That extra hop is a real architectural difference. It does{" "}
						<em>not</em> automatically mean Reloop is faster or more reliable
						for every workload—network, content, reputation, and volume all
						matter. What it does mean: when you need to change sending behavior,
						debug the MTA layer, or run the stack in your VPC, Reloop is built
						for that. Resend’s delivery ultimately depends on Amazon SES.
					</p>
				</div>
			</PageSection>

			<PageSection>
				<SectionHeading
					title="Why infrastructure ownership matters"
					description="We’re biased—and these are tradeoffs, not slam dunks."
					compact
				/>
				<div className="grid gap-6 md:grid-cols-2">
					{[
						{
							title: "Control",
							body: "With Reloop you can inspect and operate the sending path (API → queue → KumoMTA). With Resend, the last mile is Amazon’s. That is fine for many apps; it is a constraint when you need custom egress, on-prem data, or deep MTA tuning.",
						},
						{
							title: "Deployment choice",
							body: "Reloop is available as hosted SaaS or self-hosted. Resend is hosted-only. If data residency or “we run our own email infra” is a hard requirement, that alone is a deciding factor.",
						},
						{
							title: "Reputation isolation",
							body: "Both products offer shared IPs by default and dedicated IPs on higher tiers. Self-hosted Reloop can attach IPs you control. Neither product magically fixes a bad sending list—reputation is still earned by content and list hygiene.",
						},
						{
							title: "Debugging",
							body: "Reloop stores message content and delivery events in your dashboard (and in your database if you self-host). Resend also gives strong event tooling on their hosted product. Pick based on where you need the data to live—not slogans.",
						},
					].map((item) => (
						<div
							key={item.title}
							className="rounded-3xl border border-stroke-soft-200 bg-bg-weak-50/80 p-6 dark:border-white/10 dark:bg-white/[0.03]"
						>
							<h3 className="font-serif text-[1.65rem] text-text-strong-950 tracking-tight dark:text-white">
								{item.title}
							</h3>
							<p className="mt-3 text-[15px] text-text-sub-600 leading-relaxed dark:text-white/55">
								{item.body}
							</p>
						</div>
					))}
				</div>
			</PageSection>

			<PageSection alt>
				<SectionHeading
					title="Webhooks for events—not theater"
					description="Both products emit delivery webhooks. Implementations differ; verify signatures and event names in each docs set."
					compact
				/>
				<div className="overflow-hidden rounded-3xl border border-stroke-soft-200 dark:border-white/10">
					<div className="overflow-x-auto">
						<table className="w-full min-w-[720px] text-left text-[14px]">
							<thead>
								<tr className="border-stroke-soft-200 border-b bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.03]">
									<th className="px-5 py-4 font-semibold text-text-strong-950 dark:text-white">
										Topic
									</th>
									<th className="px-5 py-4 font-semibold text-primary-base">
										Reloop
									</th>
									<th className="px-5 py-4 font-semibold text-text-strong-950 dark:text-white">
										Resend
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-stroke-soft-200 dark:divide-white/10">
								<tr>
									<td className="px-5 py-4 text-text-sub-600 dark:text-white/50">
										Outbound event types
									</td>
									<td className="px-5 py-4 font-medium text-text-strong-950 dark:text-white">
										sent, delivered, delivery_delayed, bounced, complained,
										opened, clicked
									</td>
									<td className="px-5 py-4 font-medium text-text-strong-950 dark:text-white">
										sent, delivered, delivery_delayed, bounced, complained,
										opened, clicked
									</td>
								</tr>
								<tr>
									<td className="px-5 py-4 text-text-sub-600 dark:text-white/50">
										Signature verification
									</td>
									<td className="px-5 py-4 font-medium text-text-strong-950 dark:text-white">
										HMAC-SHA256 (
										<code className="rounded bg-bg-weak-50 px-1.5 py-0.5 font-mono text-[12px] dark:bg-white/5">
											X-Webhook-Signature
										</code>
										)
									</td>
									<td className="px-5 py-4 font-medium text-text-strong-950 dark:text-white">
										Svix-style signing headers
									</td>
								</tr>
								<tr>
									<td className="px-5 py-4 text-text-sub-600 dark:text-white/50">
										Management API
									</td>
									<td className="px-5 py-4 font-medium text-text-strong-950 dark:text-white">
										Create, update, list, retry deliveries
									</td>
									<td className="px-5 py-4 font-medium text-text-strong-950 dark:text-white">
										Yes (hosted webhook endpoints)
									</td>
								</tr>
								<tr>
									<td className="px-5 py-4 text-text-sub-600 dark:text-white/50">
										Drop-in Resend webhook compatibility
									</td>
									<td className="px-5 py-4 font-medium text-text-strong-950 dark:text-white">
										No—event names and signing differ; expect a small adapter
									</td>
									<td className="px-5 py-4 font-medium text-text-strong-950 dark:text-white">
										Native
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</PageSection>

			<PageSection>
				<SectionHeading
					title="How much does it cost?"
					description="List prices as of our current Reloop plans and Resend’s publicly listed tiers. Always confirm on each pricing page before you buy."
					compact
				/>
				<div className="overflow-hidden rounded-3xl border border-stroke-soft-200 dark:border-white/10">
					<div className="overflow-x-auto">
						<table className="w-full min-w-[720px] text-left text-[14px]">
							<thead>
								<tr className="border-stroke-soft-200 border-b bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.03]">
									<th className="px-5 py-4 font-semibold text-text-strong-950 dark:text-white">
										Plan shape
									</th>
									<th className="px-5 py-4 font-semibold text-primary-base">
										Reloop
									</th>
									<th className="px-5 py-4 font-semibold text-text-strong-950 dark:text-white">
										Resend
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-stroke-soft-200 dark:divide-white/10">
								<tr>
									<td className="px-5 py-4 text-text-sub-600 dark:text-white/50">
										Free
									</td>
									<td className="px-5 py-4 font-medium text-text-strong-950 dark:text-white">
										$0 · 3,000 emails / month
									</td>
									<td className="px-5 py-4 font-medium text-text-strong-950 dark:text-white">
										$0 · 3,000 emails / month
									</td>
								</tr>
								<tr>
									<td className="px-5 py-4 text-text-sub-600 dark:text-white/50">
										~25k emails / month
									</td>
									<td className="px-5 py-4 font-medium text-text-strong-950 dark:text-white">
										Individual · $10 / month · 25,000 emails
									</td>
									<td className="px-5 py-4 font-medium text-text-strong-950 dark:text-white">
										No matching public tier (jump to Pro)
									</td>
								</tr>
								<tr>
									<td className="px-5 py-4 text-text-sub-600 dark:text-white/50">
										~50k emails / month
									</td>
									<td className="px-5 py-4 font-medium text-text-strong-950 dark:text-white">
										Startup · $20 / month · 50,000 emails
									</td>
									<td className="px-5 py-4 font-medium text-text-strong-950 dark:text-white">
										Pro · $20 / month · 50,000 emails
									</td>
								</tr>
								<tr>
									<td className="px-5 py-4 text-text-sub-600 dark:text-white/50">
										Higher volume / dedicated IP
									</td>
									<td className="px-5 py-4 font-medium text-text-strong-950 dark:text-white">
										Enterprise · custom · dedicated IP optional
									</td>
									<td className="px-5 py-4 font-medium text-text-strong-950 dark:text-white">
										Scale / Enterprise · dedicated IP on higher plans
									</td>
								</tr>
								<tr>
									<td className="px-5 py-4 text-text-sub-600 dark:text-white/50">
										Self-host cost model
									</td>
									<td className="px-5 py-4 font-medium text-text-strong-950 dark:text-white">
										Your infra only (license still applies)
									</td>
									<td className="px-5 py-4 font-medium text-text-strong-950 dark:text-white">
										Not available
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				<p className="mt-6 text-center text-[14px] text-text-sub-600 dark:text-white/45">
					Full Reloop details on{" "}
					<Link href="/pricing" className="font-semibold text-primary-base">
						Pricing
					</Link>
					. Resend figures from their public pricing page—re-check before
					committing.
				</p>
			</PageSection>

			<PageSection alt>
				<div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
					<div>
						<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/45">
							Where Resend fits well
						</p>
						<h2 className="mt-3 font-serif text-[2rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[2.4rem] dark:text-white">
							Hosted DX,{" "}
							<span className="text-primary-base">zero MTA ops.</span>
						</h2>
						<ul className="mt-6 space-y-4 text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60">
							<li>
								You want a hosted-only product and have no interest in running
								or auditing email infrastructure.
							</li>
							<li>
								You are deep in React Email + Resend SDKs and scheduled sends
								are a hard requirement today.
							</li>
							<li>
								You are fine depending on Amazon SES for the final delivery hop.
							</li>
						</ul>
					</div>
					<div>
						<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/45">
							Where Reloop is different
						</p>
						<h2 className="mt-3 font-serif text-[2rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[2.4rem] dark:text-white">
							Own stack +{" "}
							<span className="text-primary-base">deployment choice.</span>
						</h2>
						<ul className="mt-6 space-y-4 text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60">
							<li>
								You want to read the source and optionally self-host under our
								license terms.
							</li>
							<li>
								You need inbound mail in an agent inbox alongside transactional
								sends—not only outbound APIs.
							</li>
							<li>
								You prefer an Individual $10 / 25k tier before jumping to a $20 /
								50k plan.
							</li>
						</ul>
					</div>
				</div>
			</PageSection>

			<PageSection narrow>
				<SectionHeading
					title="Migrating from Resend"
					description="Most teams keep template rendering and swap the transport."
					compact
				/>
				<div className="mx-auto max-w-2xl space-y-4">
					{[
						{
							step: "1",
							title: "Stand up Reloop",
							body: "Create a hosted account or deploy from the repo. Add your domain, verify SPF/DKIM/DMARC, and create an API key.",
						},
						{
							step: "2",
							title: "Keep your templates",
							body: "Continue rendering React Email (or any HTML) in your app. Reloop accepts rendered HTML or Reloop template IDs—no forced rewrite.",
						},
						{
							step: "3",
							title: "Swap the client",
							body: "Replace Resend SDK calls with Reloop’s API/SDK. from, to, subject, and HTML map cleanly. It is not a drop-in proxy—plan a small adapter.",
						},
						{
							step: "4",
							title: "Re-wire webhooks",
							body: "Point delivery and bounce handlers at Reloop webhooks. Update signature verification to HMAC headers and map event names.",
						},
					].map((item) => (
						<div
							key={item.step}
							className="rounded-2xl border border-stroke-soft-200 px-5 py-4 dark:border-white/10"
						>
							<p className="font-semibold text-text-strong-950 dark:text-white">
								<span className="mr-2 text-primary-base">{item.step}.</span>
								{item.title}
							</p>
							<p className="mt-2 text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60">
								{item.body}
							</p>
						</div>
					))}
				</div>
				<p className="mx-auto mt-8 max-w-2xl text-center text-[14px] text-text-sub-600 dark:text-white/50">
					See the{" "}
					<Link
						href="/docs/self-host"
						className="font-semibold text-primary-base"
					>
						self-hosting guide
					</Link>{" "}
					and{" "}
					<Link href="/docs" className="font-semibold text-primary-base">
						API docs
					</Link>{" "}
					while you evaluate.
				</p>
			</PageSection>

			<FaqSection
				id="compare-resend-faq"
				title="Resend vs Reloop FAQ"
				items={[
					{
						question: "Is Reloop API-compatible with Resend?",
						answer:
							"No. Reloop has its own REST API and SDKs. Migration is usually a small client swap for standard send payloads—not a drop-in proxy.",
					},
					{
						question: "Does Reloop use Amazon SES like Resend?",
						answer:
							"No. Reloop’s sending path uses KumoMTA in our stack. You can self-host that path. Resend’s public delivery path uses Amazon SES.",
					},
					{
						question: "Can we still use React Email?",
						answer:
							"Yes. Render templates in your application and pass HTML to Reloop, or use Reloop’s React Email-based template editor. Only the transport call needs to change.",
					},
					{
						question: "Do you claim better deliverability than Resend?",
						answer:
							"No—not on this page. Deliverability depends on content, list quality, domain reputation, and volume. We compare architecture and product surface area, not inbox-placement scores we haven’t published.",
					},
					{
						question: "Who should stay on Resend?",
						answer:
							"Teams that want hosted-only transactional email, love Resend’s DX, need scheduled sending today, and do not need self-hosting or an agent inbox.",
					},
					{
						question: "Who should evaluate Reloop?",
						answer:
							"Teams that want source access, optional self-hosting, own-MTA control, inbound agent inbox workflows, or a $10 / 25k tier before larger plans.",
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

export default ResendComparisonPage;
