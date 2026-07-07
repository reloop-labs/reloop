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
	title: "About Reloop Labs | The Team Behind Reloop",
	description:
		"How Pranav and Twinkal founded Reloop Labs to build open-source email infrastructure you can self-host or use as a hosted service.",
	keywords: [
		"Reloop Labs",
		"about Reloop",
		"open source email company",
		"email infrastructure team",
		"Reloop company",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "About Reloop Labs | The Team Behind Reloop",
		description:
			"How Pranav and Twinkal founded Reloop Labs to build open-source email infrastructure you can self-host or use as a hosted service.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "About Reloop Labs | The Team Behind Reloop",
		description:
			"How Pranav and Twinkal founded Reloop Labs to build open-source email infrastructure you can self-host or use as a hosted service.",
	},
};

const AboutUsPage = () => {
	return (
		<MarketingPageShell
			titleLines={["Our story."]}
			description="How two engineers set out to fix email infrastructure—and built it in the open."
			compactHero
			tightHeroBottom
		>
			<PageSection narrow flushTop>
				<AboutUsSection />
			</PageSection>
		</MarketingPageShell>
	);
};

export default AboutUsPage;
