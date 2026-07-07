import { JsonLd } from "@reloop/web/components/json-ld";
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

const pageUrl = `${getSiteUrl()}/about`;

export const metadata: Metadata = {
	title: "About Reloop Labs | The Open-Source Email Infrastructure",
	description:
		"Learn why we built Reloop Labs: proprietary-grade, self-hostable email infrastructure. Meet our founders and see our open-source commitment to developer freedom.",
	keywords: [
		"Reloop Labs",
		"about Reloop",
		"open source email company",
		"email infrastructure team",
		"Reloop founders",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "About Reloop Labs | The Open-Source Email Infrastructure",
		description:
			"Learn why we built Reloop Labs: proprietary-grade, self-hostable email infrastructure. Meet our founders and see our open-source commitment to developer freedom.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "About Reloop Labs | The Open-Source Email Infrastructure",
		description:
			"Learn why we built Reloop Labs: proprietary-grade, self-hostable email infrastructure. Meet our founders and see our open-source commitment to developer freedom.",
	},
};

const AboutUsPage = () => {
	const siteUrl = getSiteUrl();
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "AboutPage",
		mainEntity: {
			"@type": "Organization",
			"@id": `${siteUrl}/#organization`,
			name: "Reloop Labs",
			url: siteUrl,
			logo: `${siteUrl}/web-app-manifest-512x512.png`,
			description:
				"Open-source, self-hostable email infrastructure with a hosted service at reloop.sh.",
			founders: [
				{
					"@type": "Person",
					name: "Pranav Patel",
					sameAs: "https://github.com/pranavp10",
				},
				{
					"@type": "Person",
					name: "Twinkal P",
					sameAs: "https://github.com/twinkalp10",
				},
			],
			sameAs: [
				"https://github.com/reloop-labs/reloop",
				"https://discord.gg/bHnkBcp7xR",
				"https://x.com/reloophq",
			],
		},
	};

	return (
		<>
			<JsonLd data={jsonLd} />
			<MarketingPageShell
				titleLines={["We built the email", "infrastructure we couldn't buy."]}
				description="We started Reloop Labs to build email infrastructure you actually control. Send transactionals, run campaigns, and track analytics from our hosted platform or your own servers."
				fullViewportHero
			>
				<PageSection narrow flushTop>
					<AboutUsSection />
				</PageSection>
			</MarketingPageShell>
		</>
	);
};

export default AboutUsPage;
