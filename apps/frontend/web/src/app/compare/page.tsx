import { PageSection } from "@reloop/web/components/page-shell";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { CompareCalculator } from "./components/compare-calculator";

import { CompareHeroHeader } from "./components/compare-hero-header";
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
		<div className="mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-200 border-x pb-16 md:max-w-7xl dark:border-white/10">
			{/* Top Hero Header */}
			<CompareHeroHeader />

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
		</div>
	);
};

export default CompareIndexPage;
