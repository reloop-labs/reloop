import { KeepUpToDate } from "@reloop/web/app/careers/components/keep-up-to-date";
import { JsonLd } from "@reloop/web/components/json-ld";
import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { getSiteUrl, socialProfiles } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { AboutFounders } from "./components/about-founders";
import { AboutHero } from "./components/about-hero";
import { AboutPhilosophyCompass } from "./components/about-philosophy-compass";
import { AboutStory } from "./components/about-story";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pageUrl = `${getSiteUrl()}/about`;
const pageTitle = "About Reloop Labs | The Open-Source Email Infrastructure";
const pageDescription =
	"Learn why we built Reloop Labs: proprietary-grade, self-hostable email infrastructure. Meet our founders and see our open-source commitment to developer freedom.";

export const metadata: Metadata = {
	title: pageTitle,
	description: pageDescription,
	keywords: [
		"Reloop Labs",
		"about Reloop",
		"open source email company",
		"email infrastructure team",
		"Reloop founders",
		"self-hostable email platform",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: pageTitle,
		description: pageDescription,
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: pageTitle,
		description: pageDescription,
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
				socialProfiles.github,
				socialProfiles.discord,
				socialProfiles.x,
			],
		},
	};

	return (
		<>
			<JsonLd data={jsonLd} />

			{/* Hero & Key Facts */}
			<AboutHero />

			{/* Story Narrative */}
			<AboutStory />

			{/* Founders Section */}
			<AboutFounders />

			{/* Philosophy Compass Navigation */}
			<AboutPhilosophyCompass />

			{/* Keep Up To Date Section */}
			<KeepUpToDate />

			{/* Blog CTA Section */}
			<BlogCta
				category="Open Source"
				headline="Build email infrastructure you actually control."
				sub="Sign up for our hosted platform at reloop.sh or self-host Reloop on your own servers."
				primaryLabel="Get Started Free"
				primaryHref="/dashboard/signup"
				secondaryLabel="Explore GitHub"
				secondaryHref={socialProfiles.github}
				secondaryExternal
				accentColor="blue"
			/>
		</>
	);
};

export default AboutUsPage;
