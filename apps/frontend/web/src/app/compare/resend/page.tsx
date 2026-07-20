import { FaqSection } from "@reloop/web/components/faq-section";
import { PageSection } from "@reloop/web/components/page-shell";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { BrandIcon } from "../components/brand-icon";
import { competitorBrands } from "../competitor-brands";
import { CompareOtherLinks } from "../components/compare-other-links";
import { ComparisonPageShell } from "../components/comparison-page-shell";
import { ComparisonMatrix } from "../components/comparison-matrix";
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
		>
			<PageSection>
				<ComparisonMatrix
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

			<PageSection>
				<div className="mb-12 text-center">
					<h2 className="font-serif text-[2rem] text-text-strong-950 leading-[1.1] tracking-tighter sm:text-[2.4rem] lg:text-[2.8rem] dark:text-white">
						What&apos;s under the hood matters
					</h2>
					<p className="mx-auto mt-3 max-w-2xl text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
						Resend’s public sending path goes through Amazon SES. Reloop sends
						through its own KumoMTA stack—hosted by us or self-hosted by you.
					</p>
				</div>
				<div className="mx-auto max-w-5xl">
					<InfrastructureDiagram />
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
				<div className="mb-12 text-center">
					<h2 className="font-serif text-[2rem] text-text-strong-950 leading-[1.1] tracking-tighter sm:text-[2.4rem] lg:text-[2.8rem] dark:text-white">
						Why infrastructure ownership matters
					</h2>
					<p className="mx-auto mt-3 max-w-2xl text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
						We’re biased—and these are tradeoffs, not slam dunks.
					</p>
				</div>
				<div className="mx-auto max-w-4xl">
					<div className="grid gap-4 md:grid-cols-2">
						{[
							{
								title: "Control",
								body: "With Reloop you can inspect and operate the sending path (API → queue → KumoMTA). With Resend, the last mile is Amazon’s. That is fine for many apps; it is a constraint when you need custom egress, on-prem data, or deep MTA tuning.",
								icon: (
									<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
										<line x1="4" x2="20" y1="21" y2="21" />
										<line x1="4" x2="20" y1="14" y2="14" />
										<line x1="4" x2="20" y1="7" y2="7" />
										<circle cx="8" cy="21" r="2" />
										<circle cx="16" cy="14" r="2" />
										<circle cx="12" cy="7" r="2" />
									</svg>
								),
							},
							{
								title: "Deployment choice",
								body: "Reloop is available as hosted SaaS or self-hosted. Resend is hosted-only. If data residency or “we run our own email infra” is a hard requirement, that alone is a deciding factor.",
								icon: (
									<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
										<rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
										<rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
										<line x1="6" x2="6.01" y1="6" y2="6" />
										<line x1="6" x2="6.01" y1="18" y2="18" />
									</svg>
								),
							},
							{
								title: "Reputation isolation",
								body: "Both products offer shared IPs by default and dedicated IPs on higher tiers. Self-hosted Reloop can attach IPs you control. Neither product magically fixes a bad sending list—reputation is still earned by content and list hygiene.",
								icon: (
									<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
										<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
										<path d="m9 12 2 2 4-4" />
									</svg>
								),
							},
							{
								title: "Debugging",
								body: "Reloop stores message content and delivery events in your dashboard (and in your database if you self-host). Resend also gives strong event tooling on their hosted product. Pick based on where you need the data to live—not slogans.",
								icon: (
									<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
										<path d="m7 11 2-2-2-2" />
										<path d="M11 13h4" />
										<rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
									</svg>
								),
							},
						].map((item) => (
							<div
								key={item.title}
								className="rounded-2xl border-[2px] border-black/[0.04] p-5 dark:border-white/5"
							>
								<div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-text-strong-950/5 text-text-strong-950 dark:bg-white/10 dark:text-white">
									{item.icon}
								</div>
								<h3 className="text-[15px] font-semibold text-text-strong-950 tracking-tight dark:text-white">
									{item.title}
								</h3>
								<p className="mt-2 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/55">
									{item.body}
								</p>
							</div>
						))}
					</div>
				</div>
			</PageSection>

			<PageSection>
				<div className="mb-12 text-center">
					<h2 className="font-serif text-[2rem] text-text-strong-950 leading-[1.1] tracking-tighter sm:text-[2.4rem] lg:text-[2.8rem] dark:text-white">
						Webhooks for events—not theater
					</h2>
					<p className="mx-auto mt-3 max-w-2xl text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
						Both products emit delivery webhooks. Implementations differ; verify signatures and event names in each docs set.
					</p>
				</div>
				<div className="mx-auto max-w-3xl overflow-x-auto pb-2">
					<div className="grid min-w-[560px] grid-cols-[minmax(140px,1.1fr)_minmax(140px,1fr)_minmax(140px,1fr)]">
						{/* Header */}
						<div className="sticky top-0 z-10 border-b border-stroke-soft-200 bg-bg-white-0/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95">
							<div className="p-4 font-medium text-[15px] text-text-strong-950 dark:text-white">
								Topic
							</div>
						</div>
						<div className="sticky top-0 z-10 border-b border-stroke-soft-200 bg-bg-white-0/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95">
							<div className="flex items-center gap-2.5 rounded-t-2xl border-x border-t border-stroke-soft-200 bg-bg-weak-50/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
								<span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm dark:bg-white">
									<Logo className="size-full text-text-strong-950" />
								</span>
								<span className="font-medium text-[15px] text-text-strong-950 dark:text-white">
									Reloop
								</span>
							</div>
						</div>
						<div className="sticky top-0 z-10 border-b border-stroke-soft-200 bg-bg-white-0/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95">
							<div className="flex items-center gap-2.5 p-4">
								{competitorBrands.find((b) => b.name === "Resend")?.icon ? (
									<span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-white">
										<BrandIcon
											icon={competitorBrands.find((b) => b.name === "Resend")!.icon}
											className="size-4"
										/>
									</span>
								) : null}
								<span className="font-medium text-[15px] text-text-strong-950 dark:text-white">
									Resend
								</span>
							</div>
						</div>

						{/* Rows */}
						{[
							{
								label: "Outbound event types",
								reloop: (
									<div>
										<span className="font-semibold text-text-strong-950 dark:text-white">7</span>
										<span className="mt-0.5 block text-[12px] text-text-sub-600 dark:text-white/40">
											sent, delivered, delivery_delayed, bounced, complained, opened, clicked
										</span>
									</div>
								),
								competitor: (
									<div>
										<span className="font-semibold text-text-strong-950 dark:text-white">7</span>
										<span className="mt-0.5 block text-[12px] text-text-sub-600 dark:text-white/40">
											sent, delivered, delivery_delayed, bounced, complained, opened, clicked
										</span>
									</div>
								),
							},
							{
								label: "Inbound webhook payload",
								reloop: (
									<div>
										<span className="font-semibold text-text-strong-950 dark:text-white">Full content</span>
										<span className="mt-0.5 block text-[12px] text-text-sub-600 dark:text-white/40">
											Body, headers, and attachments in a single POST
										</span>
									</div>
								),
								competitor: (
									<div>
										<span className="font-semibold text-text-strong-950 dark:text-white">Metadata only</span>
										<span className="mt-0.5 block text-[12px] text-text-sub-600 dark:text-white/40">
											Separate API calls needed for body and attachments
										</span>
									</div>
								),
							},
							{
								label: "Endpoint limits",
								reloop: (
									<div>
										<span className="font-semibold text-text-strong-950 dark:text-white">Unlimited</span>
									</div>
								),
								competitor: (
									<div>
										<span className="font-semibold text-text-strong-950 dark:text-white">1 on Free</span>
										<span className="mt-0.5 block text-[12px] text-text-sub-600 dark:text-white/40">
											10 on Pro, more on Scale
										</span>
									</div>
								),
							},
							{
								label: "Signature verification",
								reloop: (
									<div>
										<div className="flex items-center gap-1.5 font-medium">
											<Icon name="check" className="size-4 shrink-0 text-text-strong-950 dark:text-white" />
											<span>HMAC-SHA256</span>
										</div>
										<span className="mt-0.5 block text-[12px] text-text-sub-600 dark:text-white/40">
											<code className="rounded bg-bg-weak-50 px-1 py-0.5 font-mono text-[11px] dark:bg-white/5">
												X-Webhook-Signature
											</code>
										</span>
									</div>
								),
								competitor: (
									<div>
										<div className="flex items-center gap-1.5 font-medium">
											<Icon name="check" className="size-4 shrink-0 text-text-strong-950 dark:text-white" />
											<span>Svix-style headers</span>
										</div>
									</div>
								),
							},
							{
								label: "Automatic retries",
								reloop: (
									<div>
										<span className="font-semibold text-text-strong-950 dark:text-white">Automatic retries</span>
										<span className="mt-0.5 block text-[12px] text-text-sub-600 dark:text-white/40">
											Exponential backoff up to 24 hours
										</span>
									</div>
								),
								competitor: (
									<div>
										<span className="font-semibold text-text-strong-950 dark:text-white">Retries</span>
										<span className="mt-0.5 block text-[12px] text-text-sub-600 dark:text-white/40">
											Escalating intervals up to 10 hours
										</span>
									</div>
								),
							},
							{
								label: "Management API",
								reloop: (
									<div>
										<div className="flex items-center gap-1.5 font-medium">
											<Icon name="check" className="size-4 shrink-0 text-text-strong-950 dark:text-white" />
											<span>Full CRUD + retry</span>
										</div>
										<span className="mt-0.5 block text-[12px] text-text-sub-600 dark:text-white/40">
											Create, update, list, retry deliveries
										</span>
									</div>
								),
								competitor: (
									<div>
										<div className="flex items-center gap-1.5 font-medium">
											<Icon name="check" className="size-4 shrink-0 text-text-strong-950 dark:text-white" />
											<span>Endpoints API</span>
										</div>
										<span className="mt-0.5 block text-[12px] text-text-sub-600 dark:text-white/40">
											Hosted webhook endpoints
										</span>
									</div>
								),
							},
							{
								label: "Drop-in Resend webhook compatibility",
								reloop: "No—event names & signing differ; expect a small adapter",
								competitor: "Native",
							},
						].map((row) => (
							<div key={row.label} className="contents">
								<div className="flex items-center border-b border-stroke-soft-200 py-3.5 pr-4 dark:border-white/10">
									<span className="text-[14px] text-text-sub-600 dark:text-white/50">
										{row.label}
									</span>
								</div>
								<div className="flex items-center border-x border-b border-stroke-soft-200 bg-bg-weak-50/60 px-4 py-3.5 text-[14px] text-text-strong-950 dark:border-white/10 dark:bg-white/[0.03] dark:text-white">
									{row.reloop}
								</div>
								<div className="flex items-center border-b border-stroke-soft-200 px-4 py-3.5 text-[14px] text-text-strong-950 dark:border-white/10 dark:text-white">
									{row.competitor}
								</div>
							</div>
						))}

						{/* Column footers */}
						<div />
						<div className="h-6 rounded-b-2xl border-x border-b border-stroke-soft-200 bg-bg-weak-50/60 dark:border-white/10 dark:bg-white/[0.03]" />
						<div />
					</div>
				</div>

			</PageSection>

			<PageSection>
				<div className="mb-12 text-center">
					<h2 className="font-serif text-[2rem] text-text-strong-950 leading-[1.1] tracking-tighter sm:text-[2.4rem] lg:text-[2.8rem] dark:text-white">
						How much does it cost?
					</h2>
					<p className="mx-auto mt-3 max-w-2xl text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
						List prices as of our current Reloop plans and Resend’s publicly listed tiers. Always confirm on each pricing page before you buy.
					</p>
				</div>
				<div className="mx-auto max-w-3xl overflow-x-auto pb-2">
					<div className="grid min-w-[560px] grid-cols-[minmax(140px,1.1fr)_minmax(140px,1fr)_minmax(140px,1fr)]">
						{/* Header */}
						<div className="sticky top-0 z-10 border-b border-stroke-soft-200 bg-bg-white-0/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95">
							<div className="p-4 font-medium text-[15px] text-text-strong-950 dark:text-white">
								Plan shape
							</div>
						</div>
						<div className="sticky top-0 z-10 border-b border-stroke-soft-200 bg-bg-white-0/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95">
							<div className="flex items-center gap-2.5 rounded-t-2xl border-x border-t border-stroke-soft-200 bg-bg-weak-50/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
								<span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm dark:bg-white">
									<Logo className="size-full text-text-strong-950" />
								</span>
								<span className="font-medium text-[15px] text-text-strong-950 dark:text-white">
									Reloop
								</span>
							</div>
						</div>
						<div className="sticky top-0 z-10 border-b border-stroke-soft-200 bg-bg-white-0/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95">
							<div className="flex items-center gap-2.5 p-4">
								{competitorBrands.find((b) => b.name === "Resend")?.icon ? (
									<span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-white">
										<BrandIcon
											icon={competitorBrands.find((b) => b.name === "Resend")!.icon}
											className="size-4"
										/>
									</span>
								) : null}
								<span className="font-medium text-[15px] text-text-strong-950 dark:text-white">
									Resend
								</span>
							</div>
						</div>

						{/* Rows */}
						{[
							{
								label: "Free",
								reloop: "$0 · 3,000 emails / month",
								competitor: "$0 · 3,000 emails / month",
							},
							{
								label: "~25k emails / month",
								reloop: "Individual · $10 / month · 25,000 emails",
								competitor: "No matching public tier (jump to Pro)",
							},
							{
								label: "~50k emails / month",
								reloop: "Startup · $20 / month · 50,000 emails",
								competitor: "Pro · $20 / month · 50,000 emails",
							},
							{
								label: "Higher volume / dedicated IP",
								reloop: "Enterprise · custom · dedicated IP optional",
								competitor: "Scale / Enterprise · dedicated IP on higher plans",
							},
							{
								label: "Self-host cost model",
								reloop: "Your infra only (license still applies)",
								competitor: "Not available",
							},
						].map((row) => (
							<div key={row.label} className="contents">
								<div className="flex items-center border-b border-stroke-soft-200 py-3.5 pr-4 dark:border-white/10">
									<span className="text-[14px] text-text-sub-600 dark:text-white/50">
										{row.label}
									</span>
								</div>
								<div className="flex items-center border-x border-b border-stroke-soft-200 bg-bg-weak-50/60 px-4 py-3.5 font-medium text-[14px] text-text-strong-950 dark:border-white/10 dark:bg-white/[0.03] dark:text-white">
									{row.reloop}
								</div>
								<div className="flex items-center border-b border-stroke-soft-200 px-4 py-3.5 font-medium text-[14px] text-text-strong-950 dark:border-white/10 dark:text-white">
									{row.competitor}
								</div>
							</div>
						))}

						{/* Column footers */}
						<div />
						<div className="h-6 rounded-b-2xl border-x border-b border-stroke-soft-200 bg-bg-weak-50/60 dark:border-white/10 dark:bg-white/[0.03]" />
						<div />
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

			<PageSection>
				<div className="mx-auto max-w-4xl">
					<div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
						<div>
							<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/45">
								Where Resend fits well
							</p>
							<h2 className="mt-3 font-serif text-[2rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[2.4rem] dark:text-white">
								Hosted-only, and that&apos;s fine by you.
							</h2>
							<ul className="mt-6 space-y-4 text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60">
								<li>
									You&apos;re comfortable being fully hosted, with no option to self-host later if your needs change.
								</li>
								<li>
									You&apos;re deep in React Email + Resend SDKs, and scheduled sends are a hard requirement today.
								</li>
								<li>
									You&apos;re okay depending on Amazon SES for the final delivery hop, even though you don&apos;t control that layer.
								</li>
							</ul>
						</div>
						<div>
							<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/45">
								WHERE RELOOP IS DIFFERENT
							</p>
							<h2 className="mt-3 font-serif text-[2rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[2.4rem] dark:text-white">
								Full control — hosted or self-hosted, your call.
							</h2>
							<ul className="mt-6 space-y-4 text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60">
								<li>
									You want to read the source and self-host whenever you want, not locked into one deployment model.
								</li>
								<li>
									You need incoming email in an inbox, not just outgoing emails.
								</li>
								<li>
									You&apos;d rather start on a $10/25k plan than be pushed straight into a $20/50k tier.
								</li>
							</ul>
						</div>
					</div>
				</div>
			</PageSection>

			<PageSection narrow>
				<div className="mb-12 text-center">
					<h2 className="font-serif text-[2rem] text-text-strong-950 leading-[1.1] tracking-tighter sm:text-[2.4rem] lg:text-[2.8rem] dark:text-white">
						Migrating from Resend
					</h2>
					<p className="mx-auto mt-3 max-w-2xl text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
						Most teams keep rendering templates in their app and swap the send
						path. Reloop is not a drop-in Resend proxy.
					</p>
				</div>
				<div className="mx-auto max-w-2xl space-y-4">
					{[
						{
							step: "1",
							title: "Create Reloop and verify your domain",
							body: "Sign up for hosted Reloop, add your sending domain, and publish the DNS records Reloop shows you. Sends require SPF, DKIM, and DMARC to be active. Then create an API key.",
						},
						{
							step: "2",
							title: "Keep your templates",
							body: "Keep rendering React Email (or any HTML) in your app—Reloop has no react payload field. Send html/text, or a Reloop template id with variables. Resend template IDs do not carry over.",
						},
						{
							step: "3",
							title: "Swap the client",
							body: "Replace Resend SDK calls with Reloop’s API or the reloop-email SDK (reloop.mail.send). from, to, subject, and html/text map cleanly. Auth, base URL, and response shape differ—plan a small adapter.",
						},
						{
							step: "4",
							title: "Re-wire delivery webhooks",
							body: "Point delivery and bounce handlers at Reloop webhooks. Verify X-Webhook-Signature / X-Webhook-Timestamp (HMAC-SHA256), map events like email.delivered and email.bounced, and adapt to Reloop’s { id, event, payload, timestamp } envelope—not Svix.",
						},
						{
							step: "5",
							title: "Or keep SMTP",
							body: "If you send over SMTP today, point your client at smtp.reloop.sh (port 587, STARTTLS) and use your Reloop API key as the credentials. Domain verification still required; no SDK rewrite.",
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
					Details in the{" "}
					<Link href="/docs" className="font-semibold text-primary-base">
						API docs
					</Link>{" "}
					and{" "}
					<Link
						href="/features/smtp"
						className="font-semibold text-primary-base"
					>
						SMTP guide
					</Link>
					. If you need Reloop’s agent inbox, add the receiving MX Reloop shows
					for your domain and use the inbox APIs—inbound receive webhooks are not
					the migration path today.
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
							"No. Reloop’s sending path uses KumoMTA in our stack. Resend’s public delivery path uses Amazon SES.",
					},
					{
						question: "Can we still use React Email?",
						answer:
							"Yes. Render templates in your application and pass HTML to Reloop, or use Reloop’s React Email-based template editor. There is no react field on the send API—only the transport call needs to change.",
					},
					{
						question: "Do you claim better deliverability than Resend?",
						answer:
							"No—not on this page. Deliverability depends on content, list quality, domain reputation, and volume. We compare architecture and product surface area, not inbox-placement scores we haven’t published.",
					},
					{
						question: "Is Reloop a drop-in Resend replacement?",
						answer:
							"No. Endpoints, auth headers, response shape, webhook signing, and event envelopes differ. Plan a small adapter—or use SMTP if that was your Resend integration.",
					},
					{
						question: "Who should evaluate Reloop?",
						answer:
							"Teams that want own-MTA sending, an agent inbox for two-way email, source access, or a $10 / 25k tier before larger plans.",
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
