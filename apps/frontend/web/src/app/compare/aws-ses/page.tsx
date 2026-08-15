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

const pagePath = "/compare/aws-ses";
const pageUrl = `${getSiteUrl()}${pagePath}`;

export const metadata: Metadata = {
	title: "Reloop vs AWS SES | Email Provider Comparison",
	description:
		"Learn how Reloop compares to Amazon SES and why Reloop is the best SES alternative for all your email delivery and platform needs.",
	keywords: [
		"Reloop vs AWS SES",
		"Amazon SES alternative",
		"AWS SES comparison",
		"SES email platform",
		"open source AWS SES alternative",
	],
	openGraph: {
		title: "Reloop vs AWS SES",
		description:
			"Learn how Reloop compares to Amazon SES and why Reloop is the best SES alternative for all your email delivery and platform needs.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Reloop vs AWS SES | Email Provider Comparison",
		description:
			"Learn how Reloop compares to Amazon SES and why Reloop is the best SES alternative for all your email delivery and platform needs.",
	},
	alternates: { canonical: pageUrl },
};

const AwsSesComparisonPage = () => {
	return (
		<ComparisonPageShell
			pagePath={pagePath}
			titleLines={["Reloop vs AWS SES"]}
			description="Learn how Reloop compares to Amazon SES and why Reloop is the best SES alternative for all your email delivery and platform needs."
		>
			<PageSection flushTop narrow>
				<div className="mx-auto max-w-3xl space-y-6 text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
					<p>
						SES wins spreadsheet comparisons at millions of messages per month.
						What spreadsheets miss is everything around SES: SNS wiring for
						bounces, CloudWatch dashboards, template storage, campaign UI,
						support contacts, and the engineering time to glue it together.
					</p>
					<p>
						Reloop is the opposite trade: a{" "}
						<strong className="text-text-strong-950 dark:text-white">
							complete email product
						</strong>{" "}
						with APIs, campaigns, analytics, and webhooks—hosted by Reloop Labs
						or self-hosted on your AWS account if you want SES-adjacent control
						without assembling fifteen services.
					</p>
				</div>
			</PageSection>

			<PageSection>
				<SectionHeading
					title="Total cost of ownership"
					description="SES line item vs platform line item."
					compact
				/>
				<div className="grid gap-6 lg:grid-cols-2">
					<div className="rounded-3xl border border-stroke-soft-200 p-6 dark:border-white/10">
						<h3 className="font-semibold text-lg text-text-strong-950 dark:text-white">
							AWS SES stack (typical)
						</h3>
						<ul className="mt-4 space-y-2 text-[14px] text-text-sub-600 dark:text-white/50">
							<li>SES send charges + data transfer</li>
							<li>SNS topics + Lambda consumers for events</li>
							<li>S3 for template assets or logs</li>
							<li>Custom admin UI or spreadsheet ops</li>
							<li>Separate tool for marketing campaigns</li>
							<li>Engineering maintenance ongoing</li>
						</ul>
					</div>
					<div className="rounded-3xl border border-primary-base/30 bg-primary-base/5 p-6">
						<h3 className="font-semibold text-lg text-text-strong-950 dark:text-white">
							Reloop stack
						</h3>
						<ul className="mt-4 space-y-2 text-[14px] text-text-sub-600 dark:text-white/60">
							<li>Tiered platform pricing or self-host infra only</li>
							<li>Built-in webhooks and delivery analytics</li>
							<li>Template editor and campaign builder included</li>
							<li>Agent inbox for support and AI workflows</li>
							<li>Single dashboard for ops and developers</li>
							<li>Open-source—extend instead of fork-lifting glue code</li>
						</ul>
					</div>
				</div>
			</PageSection>

			<PageSection alt>
				<SectionHeading title="SES vs Reloop capabilities" compact />
				<ComparisonTable
					competitorName="AWS SES"
					features={[
						{
							label: "Open-source platform",
							reloop: "Yes (Apache 2.0)",
							competitor: "No",
						},
						{
							label: "Self-host on your AWS account",
							reloop: "Yes",
							competitor: "SES only",
						},
						{
							label: "Marketing campaigns UI",
							reloop: "Yes",
							competitor: "No (DIY)",
						},
						{ label: "Transactional API", reloop: "Yes", competitor: "Yes" },
						{
							label: "Built-in delivery dashboard",
							reloop: "Yes",
							competitor: "CloudWatch / DIY",
						},
						{
							label: "Webhooks",
							reloop: "Native",
							competitor: "SNS configuration",
						},
						{
							label: "Template management",
							reloop: "Yes",
							competitor: "Limited",
						},
						{ label: "Agent inbox", reloop: "Yes", competitor: "No" },
						{
							label: "Per-email list price",
							reloop: "Tier bundles",
							competitor: "Very low at scale",
						},
					]}
				/>
			</PageSection>

			<PageSection narrow>
				<SectionHeading
					title="Running Reloop on AWS"
					description="Keep data in your account without building the product yourself."
					compact
				/>
				<p className="mx-auto max-w-2xl text-center text-[15px] text-text-sub-600 leading-7 dark:text-white/50">
					Many SES teams already run on AWS. Reloop deploys via Docker Compose,
					EKS, or ECS—see our{" "}
					<Link
						href="/docs/self-host"
						className="font-semibold text-primary-base"
					>
						self-hosting guide
					</Link>{" "}
					for wiring Postgres, Redis, and outbound SMTP alongside your existing
					VPC patterns.
				</p>
			</PageSection>

			<FaqSection
				id="compare-aws-ses-faq"
				title="AWS SES vs Reloop FAQ"
				items={[
					{
						question: "Is Reloop cheaper than SES at 10M emails/month?",
						answer:
							"SES raw sending is often cheaper at extreme volume. Reloop competes on platform TCO—engineering time, campaign tooling, support, and unified ops—not on being the cheapest SMTP pipe.",
					},
					{
						question: "Can we migrate boto3 sends to Reloop?",
						answer:
							"Yes. Replace AWS SDK send calls with Reloop REST or SMTP. Map SNS bounce notifications to Reloop webhook endpoints.",
					},
					{
						question: "Do we need both SES and Reloop?",
						answer:
							"Not usually. Self-hosted Reloop includes outbound delivery. Some teams keep SES as an MTA backend during transition—that is an advanced integration, not the default path.",
					},
				]}
				compact
			/>

			<PageSection>
				<CompareOtherLinks currentHref={pagePath} />
			</PageSection>
		</ComparisonPageShell>
	);
};

export default AwsSesComparisonPage;
