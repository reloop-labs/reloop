import { JsonLd } from "@reloop/web/components/json-ld";
import { getSiteUrl, socialProfiles } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { FounderLetter } from "./components/founder-letter";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pagePath = "/from-the-founder";
const pageUrl = `${getSiteUrl()}${pagePath}`;
const pageTitle = "Letter from the Founder | Reloop";
const pageDescription =
	"A letter from Reloop co-founder Pranav Patel on why we built open-source email infrastructure you can audit, self-host, and actually own.";

export const metadata: Metadata = {
	title: pageTitle,
	description: pageDescription,
	keywords: [
		"letter from the founder",
		"Reloop founder",
		"Pranav Patel",
		"open source email",
		"why Reloop",
		"Reloop Labs story",
		"self-hosted email infrastructure",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: pageTitle,
		description: pageDescription,
		type: "article",
		url: pageUrl,
		siteName: "Reloop",
		publishedTime: "2026-08-10",
		authors: ["Pranav Patel"],
	},
	twitter: {
		card: "summary_large_image",
		title: pageTitle,
		description: pageDescription,
	},
};

const FromTheFounderPage = () => {
	const siteUrl = getSiteUrl();
	const jsonLd = {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "WebPage",
				"@id": `${pageUrl}#webpage`,
				url: pageUrl,
				name: pageTitle,
				description: pageDescription,
				inLanguage: "en",
				isPartOf: {
					"@type": "WebSite",
					"@id": `${siteUrl}/#website`,
					name: "Reloop",
					url: siteUrl,
				},
				about: {
					"@id": `${siteUrl}/#organization`,
				},
			},
			{
				"@type": "Article",
				"@id": `${pageUrl}#article`,
				headline: "Letter from the founder",
				description: pageDescription,
				datePublished: "2026-08-10",
				dateModified: "2026-08-10",
				author: {
					"@type": "Person",
					name: "Pranav Patel",
					jobTitle: "Co-founder",
					url: "https://github.com/pranavp10",
					image: `${siteUrl}/company/team/pranav-patel.jpg`,
					worksFor: {
						"@id": `${siteUrl}/#organization`,
					},
				},
				publisher: {
					"@type": "Organization",
					"@id": `${siteUrl}/#organization`,
					name: "Reloop Labs",
					url: siteUrl,
					logo: {
						"@type": "ImageObject",
						url: `${siteUrl}/web-app-manifest-512x512.png`,
					},
					sameAs: [
						socialProfiles.github,
						socialProfiles.discord,
						socialProfiles.x,
					],
				},
				mainEntityOfPage: {
					"@id": `${pageUrl}#webpage`,
				},
			},
		],
	};

	return (
		<>
			<JsonLd data={jsonLd} />
			<div className="mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				<FounderLetter />
			</div>
		</>
	);
};

export default FromTheFounderPage;
