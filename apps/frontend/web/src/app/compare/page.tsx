import {
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { CompareCalculator } from "./components/compare-calculator";
import { CompareHeroStatStrip } from "./components/compare-hero-stat-strip";
import { CompareInteractiveSpotlight } from "./components/compare-interactive-spotlight";
import { CompareMasterMatrix } from "./components/compare-master-matrix";
import { ComparisonGrid } from "./components/comparison-grid";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const siteUrl = getSiteUrl();
const comparePageUrl = `${siteUrl}/compare`;

export const metadata: Metadata = {
	title: "Reloop vs The Competition | Email Provider & API Comparison Report",
	description:
		"Compare Reloop against Resend, SendGrid, Mailgun, AWS SES, Postmark, Loops, and Mailchimp. Calculate volume savings, inspect open source architecture, and explore features.",
	keywords: [
		"email provider comparison",
		"Reloop vs Resend",
		"Reloop vs SendGrid",
		"Reloop vs Mailgun",
		"Reloop vs AWS SES",
		"Reloop vs Postmark",
		"email API comparison",
		"best email provider",
		"open source email engine comparison",
		"KumoMTA email API",
	],
	openGraph: {
		title: "Reloop vs The Competition | Email Provider & API Comparison Report",
		description:
			"Compare Reloop against Resend, SendGrid, Mailgun, AWS SES, Postmark, Loops, and Mailchimp. Calculate volume savings, inspect open source architecture, and explore features.",
		type: "website",
		url: comparePageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Reloop vs The Competition | Email Provider & API Comparison Report",
		description:
			"Compare Reloop against Resend, SendGrid, Mailgun, AWS SES, Postmark, Loops, and Mailchimp. Calculate volume savings, inspect open source architecture, and explore features.",
	},
	alternates: {
		canonical: comparePageUrl,
	},
};

const CompareIndexPage = () => {
	return (
		<MarketingPageShell
			titleLines={["Reloop vs", "the competition."]}
			description="Compare Reloop against leading email service providers. Learn how Reloop delivers 10x lower costs, open-source transparency, and unified email infrastructure."
			compactHero
		>
			{/* Metric Stat Strip */}
			<PageSection flushTop>
				<CompareHeroStatStrip />
			</PageSection>

			{/* Interactive Brand Spotlight */}
			<PageSection>
				<CompareInteractiveSpotlight />
			</PageSection>

			{/* Volume & ROI Cost Calculator */}
			<PageSection>
				<CompareCalculator />
			</PageSection>

			{/* Master Feature Matrix */}
			<PageSection>
				<CompareMasterMatrix />
			</PageSection>

			{/* Dedicated Brand Directory Grid */}
			<PageSection>
				<ComparisonGrid />
			</PageSection>
		</MarketingPageShell>
	);
};

export default CompareIndexPage;
