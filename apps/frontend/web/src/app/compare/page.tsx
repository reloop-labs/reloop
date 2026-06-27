import {
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import { getSiteUrl } from "@reloop/web/lib/site";
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
			description="Pick a provider to see how Reloop compares."
			compactHero
		>
			<PageSection flushTop>
				<ComparisonGrid />
			</PageSection>
		</MarketingPageShell>
	);
};

export default CompareIndexPage;
