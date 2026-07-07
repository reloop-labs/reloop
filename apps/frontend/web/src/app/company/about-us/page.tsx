import {
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { AboutUsSection } from "./components/about-us-section";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pageUrl = `${getSiteUrl()}/company/about-us`;

export const metadata: Metadata = {
	title: "About Reloop Labs | Built by Pranav and Twinkal",
	description:
		"Pranav and Twinkal founded Reloop Labs to build open-source email infrastructure—proprietary-grade sends, self-hostable code, and a hosted service at reloop.sh.",
	keywords: [
		"Reloop Labs",
		"about Reloop",
		"open source email company",
		"email infrastructure team",
		"Reloop founders",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "About Reloop Labs | Built by Pranav and Twinkal",
		description:
			"Two engineers built the email stack they couldn't buy—open source, self-hostable, and available as a hosted service from day one.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "About Reloop Labs | Built by Pranav and Twinkal",
		description:
			"Two engineers built the email stack they couldn't buy—open source, self-hostable, and available as a hosted service from day one.",
	},
};

const AboutUsPage = () => {
	return (
		<MarketingPageShell
			titleLines={["We built the email", "stack we couldn't buy."]}
			description="Pranav and Twinkal founded Reloop Labs to ship proprietary-grade email infrastructure as open source—hosted at reloop.sh or on your servers."
			fullViewportHero
		>
			<PageSection narrow flushTop>
				<AboutUsSection />
			</PageSection>
		</MarketingPageShell>
	);
};

export default AboutUsPage;
