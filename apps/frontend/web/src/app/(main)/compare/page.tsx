import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
	SectionHeading,
} from "@reloop/web/components/page-shell";
import { getSiteUrl, hostedSignupHref } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { ComparisonGrid } from "./components/comparison-grid";

const siteUrl = getSiteUrl();
const comparePageUrl = `${siteUrl}/compare`;

export const metadata: Metadata = {
	title: "Compare Reloop | Email Provider Comparisons",
	description:
		"Compare Reloop with Resend, SendGrid, Mailgun, AWS SES, Postmark, Loops, and Mailchimp. Open-source, self-hostable email infrastructure.",
	openGraph: {
		title: "Compare Reloop | Email Provider Comparisons",
		description:
			"Compare Reloop with Resend, SendGrid, Mailgun, AWS SES, Postmark, Loops, and Mailchimp.",
		type: "website",
		url: comparePageUrl,
		siteName: "Reloop",
	},
	alternates: {
		canonical: comparePageUrl,
	},
};

const CompareIndexPage = () => {
	return (
		<MarketingPageShell
			titleLines={["Reloop vs", "the competition."]}
			description="Open-source email infrastructure you can self-host or run hosted. See how Reloop compares to the providers teams switch from most often."
			primaryCta={{ label: "Get started", href: hostedSignupHref }}
			secondaryCta={{ label: "View pricing", href: "/pricing" }}
			compactHero
		>
			<PageSection flushTop>
				<ComparisonGrid />
			</PageSection>

			<PageSection alt narrow>
				<SectionHeading
					title="Why compare?"
					description="Every provider on this page is proprietary hosted SaaS—or raw cloud plumbing. Reloop is the open-source alternative with a hosted option."
					compact
				/>
				<div className="grid gap-4 sm:grid-cols-3">
					{[
						{
							title: "Open source",
							description:
								"Apache 2.0 codebase you can read, fork, and deploy yourself.",
						},
						{
							title: "Self-host or hosted",
							description:
								"Same product whether Reloop runs your stack or you do.",
						},
						{
							title: "Full platform",
							description:
								"Transactional, campaigns, SMTP, webhooks, analytics, and agent inbox.",
						},
					].map((item) => (
						<div
							key={item.title}
							className="rounded-2xl border border-stroke-soft-200 p-5 dark:border-white/10"
						>
							<h3 className="font-semibold text-text-strong-950 dark:text-white">
								{item.title}
							</h3>
							<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
								{item.description}
							</p>
						</div>
					))}
				</div>
			</PageSection>

			<FeatureCta
				title="Ready to switch?"
				titleMuted="Start free today."
				description="3,000 emails per month on the Free plan. Migrate from any provider with our docs and community support."
				primary={{ label: "Get started", href: hostedSignupHref }}
				secondary={{
					label: "Self-hosting guide",
					href: "/resources/self-hosting-guide",
				}}
				compact
			/>
		</MarketingPageShell>
	);
};

export default CompareIndexPage;
