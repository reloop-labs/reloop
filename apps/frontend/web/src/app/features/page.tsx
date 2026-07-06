import { JsonLd } from "@reloop/web/components/json-ld";
import {
	cardGridClass,
	FeatureCta,
	MarketingPageShell,
	PageSection,
	SectionHeading,
} from "@reloop/web/components/page-shell";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Link from "next/link";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pageUrl = `${getSiteUrl()}/features`;

export const metadata: Metadata = {
	title: "Features | Reloop",
	description:
		"Explore Reloop features—campaigns, transactional email, SMTP, analytics, deliverability, and developer tools.",
	keywords: [
		"email infrastructure features",
		"email API features",
		"email campaigns",
		"transactional email",
		"SMTP relay",
		"email analytics",
		"email deliverability",
		"open source email platform",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Features | Reloop",
		description: "Explore Reloop email infrastructure features.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Features | Reloop",
		description:
			"Explore Reloop features—campaigns, transactional email, SMTP, analytics, deliverability, and developer tools.",
	},
};

const productFeatures = [
	{
		title: "AI Agents",
		href: "/features/ai-agents",
		description: "Email infrastructure for autonomous agents and LLMs.",
	},
	{
		title: "Campaigns",
		href: "/features/campaigns",
		description: "Create and track marketing campaigns end to end.",
	},
	{
		title: "Transaction Emails",
		href: "/features/transaction-emails",
		description: "Low-latency transactional delivery for developers.",
	},
	{
		title: "Email Templates",
		href: "/features/email-templates",
		description: "Design and manage reusable email templates.",
	},
	{
		title: "SMTP Relay",
		href: "/features/smtp",
		description: "Managed SMTP with TLS, auth, and fast delivery.",
	},
	{
		title: "Email Analytics",
		href: "/features/email-analytics",
		description: "Opens, clicks, conversions, and real-time reports.",
	},
	{
		title: "Email Validation",
		href: "/features/email-validation",
		description: "Verify addresses before send to protect reputation.",
	},
	{
		title: "Deliverability",
		href: "/features/deliverability",
		description: "Spam testing, reputation monitoring, and auth setup.",
	},
	{
		title: "Marketing Teams",
		href: "/features/marketing-teams",
		description: "Collaborative campaign workspace for teams.",
	},
	{
		title: "Languages & SDKs",
		href: "/docs/resources/sdks",
		description: "Quickstarts for every supported client library.",
	},
];

const platformFeatures = [
	{
		title: "Developers",
		href: "/features/developers",
		description: "APIs, SDKs, and sandbox tooling built for DX.",
	},
	{
		title: "Getting Started",
		href: "/features/getting-started",
		description: "From signup to first send in minutes.",
	},
	{
		title: "API Reference",
		href: "/features/api-reference",
		description: "REST endpoints for send, list, and analytics.",
	},
	{
		title: "Webhooks",
		href: "/features/webhooks",
		description: "Real-time events for delivery and engagement.",
	},
	{
		title: "Integration",
		href: "/features/integration",
		description: "Connect Reloop to your stack.",
	},
	{
		title: "Campaign Builder",
		href: "/features/campaign-builder",
		description: "Visual editor for on-brand campaigns.",
	},
];

const featuresSchema = {
	"@context": "https://schema.org" as const,
	"@type": "ItemList" as const,
	name: "Reloop Features",
	description:
		"Explore Reloop features—campaigns, transactional email, SMTP, analytics, deliverability, and developer tools.",
	url: pageUrl,
	numberOfItems: productFeatures.length + platformFeatures.length,
	itemListElement: [...productFeatures, ...platformFeatures].map(
		(feature, index) => ({
			"@type": "ListItem" as const,
			position: index + 1,
			url: `${getSiteUrl()}${feature.href}`,
			name: feature.title,
			description: feature.description,
		}),
	),
};

export default function FeaturesIndexPage() {
	return (
		<>
			<JsonLd data={featuresSchema} />
			<MarketingPageShell
				titleLines={["Email infrastructure", "built for builders"]}
				description="Campaigns, transactionals, SMTP, analytics, and developer tools—on one platform."
				primaryCta={{ label: "Get started", href: "/dashboard/signup" }}
				secondaryCta={{ label: "Documentation", href: "/docs" }}
			>
				<PageSection>
					<SectionHeading
						title="Core capabilities"
						description="Everything you need to send, measure, and improve email."
					/>
					<div className={cardGridClass}>
						{productFeatures.map((feature) => (
							<Link
								key={feature.href}
								href={feature.href}
								className="group rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 p-8 transition-colors hover:bg-bg-soft-50 dark:border-white/10 dark:hover:bg-white/[0.02]"
							>
								<h3 className="mb-3 font-semibold text-lg text-text-strong-950 group-hover:text-primary-base dark:text-white">
									{feature.title}
								</h3>
								<p className="text-sm text-text-sub-600 leading-relaxed dark:text-white/50">
									{feature.description}
								</p>
							</Link>
						))}
					</div>
				</PageSection>

				<PageSection alt>
					<SectionHeading
						title="Build & integrate"
						description="APIs, SDKs, and workflows for engineering teams."
					/>
					<div className={cardGridClass}>
						{platformFeatures.map((feature) => (
							<Link
								key={feature.href}
								href={feature.href}
								className="group rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 p-8 transition-colors hover:bg-bg-soft-50 dark:border-white/10 dark:hover:bg-white/[0.02]"
							>
								<h3 className="mb-3 font-semibold text-lg text-text-strong-950 group-hover:text-primary-base dark:text-white">
									{feature.title}
								</h3>
								<p className="text-sm text-text-sub-600 leading-relaxed dark:text-white/50">
									{feature.description}
								</p>
							</Link>
						))}
					</div>
				</PageSection>

				<FeatureCta
					title="Start sending with Reloop"
					titleMuted="Free tier included."
					description="Create an account and send your first email in minutes."
					primary={{ label: "Get started", href: "/dashboard/signup" }}
					secondary={{ label: "Read docs", href: "/docs" }}
				/>
			</MarketingPageShell>
		</>
	);
}
