import {
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { ComparisonGrid } from "./components/comparison-grid";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const siteUrl = getSiteUrl();
const comparePageUrl = `${siteUrl}/compare`;

export const metadata: Metadata = {
	title: "Compare Reloop | Email Provider Comparisons",
	description:
		"Learn how Reloop compares to popular email providers—and why Reloop is the best alternative for all your developer email needs.",
	keywords: [
		"email provider comparison",
		"Reloop vs Resend",
		"Reloop vs SendGrid",
		"Reloop vs Mailgun",
		"email API comparison",
		"best email provider",
		"open source email comparison",
	],
	openGraph: {
		title: "Compare Reloop | Email Provider Comparisons",
		description:
			"Learn how Reloop compares to popular email providers—and why Reloop is the best alternative for all your developer email needs.",
		type: "website",
		url: comparePageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Compare Reloop | Email Provider Comparisons",
		description:
			"Learn how Reloop compares to popular email providers—and why Reloop is the best alternative for all your developer email needs.",
	},
	alternates: {
		canonical: comparePageUrl,
	},
};

const CompareIndexPage = () => {
	return (
		<MarketingPageShell
			titleLines={["Reloop vs", "the competition."]}
			description="Learn how Reloop compares to popular email providers—and why Reloop is the best alternative for all your developer email needs."
			compactHero
		>
			<PageSection flushTop>
				<ComparisonGrid />
			</PageSection>
		</MarketingPageShell>
	);
};

export default CompareIndexPage;
