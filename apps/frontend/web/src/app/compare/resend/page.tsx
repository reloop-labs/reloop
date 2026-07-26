import { Icon } from "@reloop/ui/icon";
import { FaqSection } from "@reloop/web/components/faq-section";
import { PageSection } from "@reloop/web/components/page-shell";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { competitorBrands } from "../competitor-brands";
import { CompareOtherLinks } from "../components/compare-other-links";
import { CompareSideTable } from "../components/compare-side-table";
import { ComparisonMatrix } from "../components/comparison-matrix";
import { ComparisonPageShell } from "../components/comparison-page-shell";
import { CrosshairFrame } from "../components/crosshair-frame";
import { InfrastructureDiagram } from "../components/infrastructure-diagram";
import { OptionRow } from "../components/option-row";
import { ProductPanel } from "../components/product-panel";
import { resendComparisonCategories } from "./comparison-data";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pagePath = "/compare/resend";
const siteUrl = getSiteUrl();
const pageUrl = `${siteUrl}${pagePath}`;

const resendBrand = competitorBrands.find((b) => b.name === "Resend");

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

function CellNote({
	value,
	note,
	semibold = true,
}: {
	value: ReactNode;
	note?: string;
	semibold?: boolean;
}) {
	return (
		<div>
			<span
				className={
					semibold
						? "font-semibold text-text-strong-950 dark:text-white"
						: "font-medium text-text-strong-950 dark:text-white"
				}
			>
				{value}
			</span>
			{note ? (
				<span className="mt-0.5 block text-[12px] text-text-sub-600 dark:text-white/40">
					{note}
				</span>
			) : null}
		</div>
	);
}

function CheckCell({ label, note }: { label: string; note?: string }) {
	return (
		<div>
			<div className="flex items-center gap-1.5 font-medium">
				<Icon
					name="check"
					className="size-4 shrink-0 text-text-strong-950 dark:text-white"
				/>
				<span>{label}</span>
			</div>
			{note ? (
				<span className="mt-0.5 block text-[12px] text-text-sub-600 dark:text-white/40">
					{note}
				</span>
			) : null}
		</div>
	);
}

const ResendComparisonPage = () => {
	return (
		<ComparisonPageShell
			pagePath={pagePath}
			titleLines={["Reloop vs Resend"]}
			description="Resend made developer email feel modern. Reloop keeps that DX—and adds an own-MTA stack, self-hosting, and an agent inbox built for two-way email. Here's the honest side-by-side."
			primaryCta={{
				label: "Start for free",
				href: "/dashboard/signup",
			}}
			secondaryCta={{
				label: "Migrate from Resend",
				href: "/compare/resend#migrate",
			}}
		>
			{/* At a glance — product panel + crosshair */}
			<PageSection flushTop>
				<div className="mx-auto max-w-2xl">
					<CrosshairFrame>
						<ProductPanel
							title="At a glance"
							description="Four differences that matter when you're evaluating a Resend alternative."
						>
							<div className="space-y-3 p-4 sm:p-5">
								<OptionRow
									icon={
										<svg
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.75"
											strokeLinecap="round"
											strokeLinejoin="round"
											aria-hidden
										>
											<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
										</svg>
									}
									title="Own sending MTA"
									description="Reloop runs KumoMTA in-stack. Resend's public path goes through Amazon SES."
								/>
								<OptionRow
									icon={
										<svg
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.75"
											strokeLinecap="round"
											strokeLinejoin="round"
											aria-hidden
										>
											<rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
											<rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
											<line x1="6" x2="6.01" y1="6" y2="6" />
											<line x1="6" x2="6.01" y1="18" y2="18" />
										</svg>
									}
									title="Hosted or self-hosted"
									description="Same product on Reloop Labs cloud or your own infrastructure. Resend is hosted-only."
								/>
								<OptionRow
									icon={
										<svg
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.75"
											strokeLinecap="round"
											strokeLinejoin="round"
											aria-hidden
										>
											<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
										</svg>
									}
									title="Agent inbox for two-way email"
									description="Inbound mail, full content, and AI compose helpers—not just outbound APIs."
								/>
								<OptionRow
									icon={
										<svg
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.75"
											strokeLinecap="round"
											strokeLinejoin="round"
											aria-hidden
										>
											<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
											<polyline points="14 2 14 8 20 8" />
										</svg>
									}
									title="Open-source codebase"
									description="Apache 2.0 with Reloop Labs use restrictions—read the source, audit the path."
								/>
							</div>
						</ProductPanel>
					</CrosshairFrame>
				</div>
			</PageSection>

			{/* Feature matrix */}
			<PageSection>
				<div className="mb-10 text-center">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/45">
						Feature by feature
					</p>
					<h2 className="mt-3 font-serif text-[2rem] text-text-strong-950 leading-[1.1] tracking-tighter sm:text-[2.4rem] lg:text-[2.8rem] dark:text-white">
						The full comparison matrix
					</h2>
					<p className="mx-auto mt-3 max-w-2xl text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
						Only claims we can defend from product docs and public Resend
						docs—no invented wins.
					</p>
				</div>
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

			{/* Infrastructure */}
			<PageSection>
				<div className="mb-12 text-center">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/45">
						Architecture
					</p>
					<h2 className="mt-3 font-serif text-[2rem] text-text-strong-950 leading-[1.1] tracking-tighter sm:text-[2.4rem] lg:text-[2.8rem] dark:text-white">
						What&apos;s under the hood matters
					</h2>
					<p className="mx-auto mt-3 max-w-2xl text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
						Resend&apos;s public sending path goes through Amazon SES. Reloop
						sends through its own KumoMTA stack—hosted by us or self-hosted by
						you.
					</p>
				</div>
				<div className="mx-auto max-w-5xl">
					<CrosshairFrame>
						<ProductPanel>
							<div className="p-4 sm:p-8">
								<InfrastructureDiagram />
							</div>
						</ProductPanel>
					</CrosshairFrame>
				</div>
				<div className="mx-auto mt-10 max-w-3xl space-y-5 text-[15px] text-text-sub-600 leading-7 dark:text-white/55">
					<p>
						That extra hop is a real architectural difference. It does{" "}
						<em>not</em> automatically mean Reloop is faster or more reliable
						for every workload—network, content, reputation, and volume all
						matter. What it does mean: when you need to change sending behavior,
						debug the MTA layer, or run the stack in your VPC, Reloop is built
						for that. Resend&apos;s delivery ultimately depends on Amazon SES.
					</p>
				</div>
			</PageSection>

			{/* Ownership — option-row cards */}
			<PageSection>
				<div className="mb-12 text-center">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/45">
						Tradeoffs
					</p>
					<h2 className="mt-3 font-serif text-[2rem] text-text-strong-950 leading-[1.1] tracking-tighter sm:text-[2.4rem] lg:text-[2.8rem] dark:text-white">
						Why infrastructure ownership matters
					</h2>
					<p className="mx-auto mt-3 max-w-2xl text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
						We&apos;re biased—and these are tradeoffs, not slam dunks.
					</p>
				</div>
				<div className="mx-auto max-w-3xl">
					<ProductPanel>
						<div className="space-y-3 p-4 sm:p-5">
							{[
								{
									title: "Control",
									body: "With Reloop you can inspect and operate the sending path (API → queue → KumoMTA). With Resend, the last mile is Amazon's. That is fine for many apps; it is a constraint when you need custom egress, on-prem data, or deep MTA tuning.",
									icon: (
										<svg
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.75"
											strokeLinecap="round"
											strokeLinejoin="round"
											aria-hidden
										>
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
									body: 'Reloop is available as hosted SaaS or self-hosted. Resend is hosted-only. If data residency or "we run our own email infra" is a hard requirement, that alone is a deciding factor.',
									icon: (
										<svg
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.75"
											strokeLinecap="round"
											strokeLinejoin="round"
											aria-hidden
										>
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
										<svg
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.75"
											strokeLinecap="round"
											strokeLinejoin="round"
											aria-hidden
										>
											<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
											<path d="m9 12 2 2 4-4" />
										</svg>
									),
								},
								{
									title: "Debugging",
									body: "Reloop stores message content and delivery events in your dashboard (and in your database if you self-host). Resend also gives strong event tooling on their hosted product. Pick based on where you need the data to live—not slogans.",
									icon: (
										<svg
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.75"
											strokeLinecap="round"
											strokeLinejoin="round"
											aria-hidden
										>
											<path d="m7 11 2-2-2-2" />
											<path d="M11 13h4" />
											<rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
										</svg>
									),
								},
							].map((item) => (
								<OptionRow
									key={item.title}
									icon={item.icon}
									title={item.title}
									description={item.body}
								/>
							))}
						</div>
					</ProductPanel>
				</div>
			</PageSection>

			{/* Webhooks */}
			<PageSection>
				<div className="mb-12 text-center">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/45">
						Events
					</p>
					<h2 className="mt-3 font-serif text-[2rem] text-text-strong-950 leading-[1.1] tracking-tighter sm:text-[2.4rem] lg:text-[2.8rem] dark:text-white">
						Webhooks for events—not theater
					</h2>
					<p className="mx-auto mt-3 max-w-2xl text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
						Both products emit delivery webhooks. Implementations differ; verify
						signatures and event names in each docs set.
					</p>
				</div>
				<div className="mx-auto max-w-3xl">
					<ProductPanel>
						<div className="p-3 sm:p-5">
							<CompareSideTable
								topicLabel="Topic"
								competitorName="Resend"
								competitorIcon={resendBrand?.icon}
								rows={[
									{
										label: "Outbound event types",
										reloop: (
											<CellNote
												value="7"
												note="sent, delivered, delivery_delayed, bounced, complained, opened, clicked"
											/>
										),
										competitor: (
											<CellNote
												value="7"
												note="sent, delivered, delivery_delayed, bounced, complained, opened, clicked"
											/>
										),
									},
									{
										label: "Inbound webhook payload",
										reloop: (
											<CellNote
												value="Full content"
												note="Body, headers, and attachments in a single POST"
											/>
										),
										competitor: (
											<CellNote
												value="Metadata only"
												note="Separate API calls needed for body and attachments"
											/>
										),
									},
									{
										label: "Endpoint limits",
										reloop: <CellNote value="Unlimited" />,
										competitor: (
											<CellNote
												value="1 on Free"
												note="10 on Pro, more on Scale"
											/>
										),
									},
									{
										label: "Signature verification",
										reloop: (
											<CheckCell
												label="HMAC-SHA256"
												note="X-Webhook-Signature"
											/>
										),
										competitor: <CheckCell label="Svix-style headers" />,
									},
									{
										label: "Automatic retries",
										reloop: (
											<CellNote
												value="Automatic retries"
												note="Exponential backoff up to 24 hours"
											/>
										),
										competitor: (
											<CellNote
												value="Retries"
												note="Escalating intervals up to 10 hours"
											/>
										),
									},
									{
										label: "Management API",
										reloop: (
											<CheckCell
												label="Full CRUD + retry"
												note="Create, update, list, retry deliveries"
											/>
										),
										competitor: (
											<CheckCell
												label="Endpoints API"
												note="Hosted webhook endpoints"
											/>
										),
									},
									{
										label: "Drop-in Resend webhook compatibility",
										reloop:
											"No—event names & signing differ; expect a small adapter",
										competitor: "Native",
									},
								]}
							/>
						</div>
					</ProductPanel>
				</div>
			</PageSection>

			{/* Pricing */}
			<PageSection>
				<div className="mb-12 text-center">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/45">
						Pricing
					</p>
					<h2 className="mt-3 font-serif text-[2rem] text-text-strong-950 leading-[1.1] tracking-tighter sm:text-[2.4rem] lg:text-[2.8rem] dark:text-white">
						How much does it cost?
					</h2>
					<p className="mx-auto mt-3 max-w-2xl text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
						List prices as of our current Reloop plans and Resend&apos;s
						publicly listed tiers. Always confirm on each pricing page before
						you buy.
					</p>
				</div>
				<div className="mx-auto max-w-3xl">
					<ProductPanel>
						<div className="p-3 sm:p-5">
							<CompareSideTable
								topicLabel="Plan shape"
								competitorName="Resend"
								competitorIcon={resendBrand?.icon}
								rows={[
									{
										label: "Free",
										reloop: (
											<span className="font-medium">
												$0 · 3,000 emails / month
											</span>
										),
										competitor: (
											<span className="font-medium">
												$0 · 3,000 emails / month
											</span>
										),
									},
									{
										label: "~25k emails / month",
										reloop: (
											<span className="font-medium">
												Individual · $10 / month · 25,000 emails
											</span>
										),
										competitor: (
											<span className="font-medium">
												No matching public tier (jump to Pro)
											</span>
										),
									},
									{
										label: "~50k emails / month",
										reloop: (
											<span className="font-medium">
												Startup · $20 / month · 50,000 emails
											</span>
										),
										competitor: (
											<span className="font-medium">
												Pro · $20 / month · 50,000 emails
											</span>
										),
									},
									{
										label: "Higher volume / dedicated IP",
										reloop: (
											<span className="font-medium">
												Enterprise · custom · dedicated IP optional
											</span>
										),
										competitor: (
											<span className="font-medium">
												Scale / Enterprise · dedicated IP on higher plans
											</span>
										),
									},
									{
										label: "Self-host cost model",
										reloop: (
											<span className="font-medium">
												Your infra only (license still applies)
											</span>
										),
										competitor: (
											<span className="font-medium">Not available</span>
										),
									},
								]}
							/>
						</div>
					</ProductPanel>
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

			{/* Fit criteria — two product panels */}
			<PageSection>
				<div className="mx-auto max-w-4xl">
					<div className="grid gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-8">
						<ProductPanel
							title="Where Resend fits well"
							description="Hosted-only, and that's fine by you."
						>
							<ul className="space-y-4 px-5 py-5 text-[14px] text-text-sub-600 leading-relaxed sm:px-6 dark:text-white/60">
								<li className="flex gap-3">
									<span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-text-sub-600/40 dark:bg-white/30" />
									<span>
										You&apos;re comfortable being fully hosted, with no option
										to self-host later if your needs change.
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-text-sub-600/40 dark:bg-white/30" />
									<span>
										You&apos;re deep in React Email + Resend SDKs, and scheduled
										sends are a hard requirement today.
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-text-sub-600/40 dark:bg-white/30" />
									<span>
										You&apos;re okay depending on Amazon SES for the final
										delivery hop, even though you don&apos;t control that layer.
									</span>
								</li>
							</ul>
						</ProductPanel>
						<ProductPanel
							title="Where Reloop is different"
							description="Full control — hosted or self-hosted, your call."
						>
							<ul className="space-y-4 px-5 py-5 text-[14px] text-text-sub-600 leading-relaxed sm:px-6 dark:text-white/60">
								<li className="flex gap-3">
									<span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary-base" />
									<span>
										You want to read the source and self-host whenever you want,
										not locked into one deployment model.
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary-base" />
									<span>
										You need incoming email in an inbox, not just outgoing
										emails.
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary-base" />
									<span>
										You&apos;d rather start on a $10/25k plan than be pushed
										straight into a $20/50k tier.
									</span>
								</li>
							</ul>
						</ProductPanel>
					</div>
				</div>
			</PageSection>

			{/* Migration */}
			<PageSection narrow>
				<div id="migrate" className="scroll-mt-28">
					<div className="mb-12 text-center">
						<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/45">
							Migration
						</p>
						<h2 className="mt-3 font-serif text-[2rem] text-text-strong-950 leading-[1.1] tracking-tighter sm:text-[2.4rem] lg:text-[2.8rem] dark:text-white">
							Migrating from Resend
						</h2>
						<p className="mx-auto mt-3 max-w-2xl text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
							Most teams keep rendering templates in their app and swap the send
							path. Reloop is not a drop-in Resend proxy.
						</p>
					</div>
					<div className="mx-auto max-w-2xl">
						<CrosshairFrame>
							<ProductPanel
								title="Swap the send path"
								description="Five practical steps—not a rewrite of your product."
							>
								<div className="divide-y divide-stroke-soft-200 dark:divide-white/10">
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
											body: "Replace Resend SDK calls with Reloop's API or the reloop-email SDK (reloop.mail.send). from, to, subject, and html/text map cleanly. Auth, base URL, and response shape differ—plan a small adapter.",
										},
										{
											step: "4",
											title: "Re-wire delivery webhooks",
											body: "Point delivery and bounce handlers at Reloop webhooks. Verify X-Webhook-Signature / X-Webhook-Timestamp (HMAC-SHA256), map events like email.delivered and email.bounced, and adapt to Reloop's { id, event, payload, timestamp } envelope—not Svix.",
										},
										{
											step: "5",
											title: "Or keep SMTP",
											body: "If you send over SMTP today, point your client at smtp.reloop.sh (port 587, STARTTLS) and use your Reloop API key as the credentials. Domain verification still required; no SDK rewrite.",
										},
									].map((item) => (
										<div key={item.step} className="px-5 py-4 sm:px-6">
											<p className="font-semibold text-[14px] text-text-strong-950 dark:text-white">
												<span className="mr-2 text-primary-base">
													{item.step}.
												</span>
												{item.title}
											</p>
											<p className="mt-2 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/60">
												{item.body}
											</p>
										</div>
									))}
								</div>
							</ProductPanel>
						</CrosshairFrame>
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
						. If you need Reloop&apos;s agent inbox, add the receiving MX Reloop
						shows for your domain and use the inbox APIs—inbound receive
						webhooks are not the migration path today.
					</p>
				</div>
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
							"No. Reloop's sending path uses KumoMTA in our stack. Resend's public delivery path uses Amazon SES.",
					},
					{
						question: "Can we still use React Email?",
						answer:
							"Yes. Render templates in your application and pass HTML to Reloop, or use Reloop's React Email-based template editor. There is no react field on the send API—only the transport call needs to change.",
					},
					{
						question: "Do you claim better deliverability than Resend?",
						answer:
							"No—not on this page. Deliverability depends on content, list quality, domain reputation, and volume. We compare architecture and product surface area, not inbox-placement scores we haven't published.",
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
