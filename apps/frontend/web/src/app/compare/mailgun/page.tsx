import { FaqSection } from "@reloop/web/components/faq-section";
import { PageSection, SectionHeading } from "@reloop/web/components/page-shell";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { CompareOtherLinks } from "../components/compare-other-links";
import { ComparisonPageShell } from "../components/comparison-page-shell";
import { ComparisonTable } from "../components/comparison-table";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pagePath = "/compare/mailgun";
const pageUrl = `${getSiteUrl()}${pagePath}`;

export const metadata: Metadata = {
	title: "Reloop vs Mailgun | Email Provider Comparison",
	description:
		"Learn how Reloop compares to Mailgun and why Reloop is the best Mailgun alternative for all your developer email API needs.",
	keywords: [
		"Reloop vs Mailgun",
		"Mailgun alternative",
		"SMTP comparison",
		"email API comparison",
		"open source Mailgun alternative",
	],
	openGraph: {
		title: "Reloop vs Mailgun",
		description:
			"Learn how Reloop compares to Mailgun and why Reloop is the best Mailgun alternative for all your developer email API needs.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Reloop vs Mailgun | Email Provider Comparison",
		description:
			"Learn how Reloop compares to Mailgun and why Reloop is the best Mailgun alternative for all your developer email API needs.",
	},
	alternates: { canonical: pageUrl },
};

const MailgunComparisonPage = () => {
	return (
		<ComparisonPageShell
			pagePath={pagePath}
			titleLines={["Reloop vs Mailgun"]}
			description="Learn how Reloop compares to Mailgun and why Reloop is the best Mailgun alternative for all your developer email API needs."
		>
			<PageSection flushTop narrow>
				<div className="mx-auto max-w-3xl space-y-6 text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
					<p>
						Mailgun remains a common choice for teams that need REST + SMTP,
						domain-level configuration, and inbound parsing. Under Twilio, the
						product also carries enterprise packaging, usage-based billing, and
						the usual question:{" "}
						<em>
							what happens to our sending reputation and data if we leave?
						</em>
					</p>
					<p>
						Reloop is built for teams that want Mailgun-class capabilities—API,
						SMTP, webhooks, validation—but with{" "}
						<strong className="font-semibold text-text-strong-950 dark:text-white">
							source access and a self-host path
						</strong>{" "}
						so email infrastructure is not a permanent external dependency.
					</p>
				</div>
			</PageSection>

			<PageSection>
				<SectionHeading
					title="Mailgun in production today"
					description="What we hear from teams running Mailgun for years."
					compact
				/>
				<div className="grid gap-4 sm:grid-cols-3">
					<div className="rounded-2xl border border-stroke-soft-200 p-5 dark:border-white/10">
						<p className="font-semibold text-text-strong-950 dark:text-white">
							Legacy SMTP apps
						</p>
						<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
							Cron jobs and services still send via SMTP credentials—not the
							REST API. Mailgun supports both; so does Reloop.
						</p>
					</div>
					<div className="rounded-2xl border border-stroke-soft-200 p-5 dark:border-white/10">
						<p className="font-semibold text-text-strong-950 dark:text-white">
							Inbound routes
						</p>
						<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
							Support inboxes and reply parsing often depend on Mailgun inbound.
							Reloop&apos;s agent inbox targets the same workflows with modern
							AI tooling.
						</p>
					</div>
					<div className="rounded-2xl border border-stroke-soft-200 p-5 dark:border-white/10">
						<p className="font-semibold text-text-strong-950 dark:text-white">
							Billing surprises
						</p>
						<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
							Validation, dedicated IPs, and overages stack on base send volume.
							Reloop publishes tiered send-based pricing and a self-host escape
							hatch.
						</p>
					</div>
				</div>
			</PageSection>

			<PageSection alt>
				<SectionHeading title="Capability matrix" compact />
				<ComparisonTable
					competitorName="Mailgun"
					features={[
						{
							label: "Open-source codebase",
							reloop: "Yes (Apache 2.0)",
							competitor: "No",
						},
						{ label: "Self-hostable", reloop: "Yes", competitor: "No" },
						{ label: "REST API", reloop: "Yes", competitor: "Yes" },
						{ label: "SMTP relay", reloop: "Yes", competitor: "Yes" },
						{
							label: "Inbound / reply handling",
							reloop: "Agent inbox",
							competitor: "Inbound routes",
						},
						{ label: "Email validation API", reloop: "Yes", competitor: "Yes" },
						{
							label: "Marketing campaigns",
							reloop: "Yes",
							competitor: "Limited",
						},
						{ label: "Agent / AI workflows", reloop: "Yes", competitor: "No" },
						{
							label: "Free tier",
							reloop: "3,000 emails / month",
							competitor: "Trial-based",
						},
					]}
				/>
			</PageSection>

			<PageSection narrow>
				<SectionHeading
					title="Mailgun → Reloop migration"
					description="A sequence that works for API and SMTP senders."
					compact
				/>
				<ol className="mx-auto max-w-2xl list-none space-y-3">
					<li className="rounded-2xl border border-stroke-soft-200 px-5 py-4 dark:border-white/10">
						<span className="font-semibold text-primary-base">Step 1 —</span>
						<span className="text-[15px] text-text-sub-600 dark:text-white/60">
							{" "}
							Export domain DNS records and document current Mailgun routes
							(inbound, webhooks, suppression lists).
						</span>
					</li>
					<li className="rounded-2xl border border-stroke-soft-200 px-5 py-4 dark:border-white/10">
						<span className="font-semibold text-primary-base">Step 2 —</span>
						<span className="text-[15px] text-text-sub-600 dark:text-white/60">
							{" "}
							Provision the same domains in Reloop; verify DKIM/SPF before
							production cutover.
						</span>
					</li>
					<li className="rounded-2xl border border-stroke-soft-200 px-5 py-4 dark:border-white/10">
						<span className="font-semibold text-primary-base">Step 3 —</span>
						<span className="text-[15px] text-text-sub-600 dark:text-white/60">
							{" "}
							For SMTP workloads, update host, port, and credentials only—no app
							rewrite required.
						</span>
					</li>
					<li className="rounded-2xl border border-stroke-soft-200 px-5 py-4 dark:border-white/10">
						<span className="font-semibold text-primary-base">Step 4 —</span>
						<span className="text-[15px] text-text-sub-600 dark:text-white/60">
							{" "}
							For API workloads, swap endpoints and map Mailgun event webhooks
							to Reloop delivery events.
						</span>
					</li>
				</ol>
				<p className="mx-auto mt-6 max-w-2xl text-center text-[14px] text-text-sub-600 dark:text-white/50">
					<Link
						href="/features/smtp"
						className="font-semibold text-primary-base"
					>
						Reloop SMTP docs
					</Link>{" "}
					cover credential rotation without downtime.
				</p>
			</PageSection>

			<FaqSection
				id="compare-mailgun-faq"
				title="Mailgun vs Reloop FAQ"
				items={[
					{
						question: "Can Reloop replace Mailgun inbound routes?",
						answer:
							"Reloop's agent inbox and webhook model cover reply handling and automated triage. Map your existing inbound URLs to Reloop handlers during migration.",
					},
					{
						question: "Do we lose deliverability moving off Mailgun?",
						answer:
							"Deliverability depends on domain reputation, content, and IPs—not the dashboard brand. Self-hosted Reloop lets you own IPs directly; hosted Reloop manages shared pools like other providers.",
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

export default MailgunComparisonPage;
