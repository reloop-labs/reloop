import { getSiteUrl, siteName, socialProfiles } from "./site";

const communityPath = "/community";

export const communitySeo = {
	title: "Community",
	description:
		"Connect with the Reloop team on Discord, GitHub, and X. Contribute to open-source email infrastructure or follow along as we build in public.",
	keywords: [
		"Reloop community",
		"open source email",
		"email infrastructure",
		"GitHub discussions",
		"Discord",
		"contribute open source",
	],
	path: communityPath,
} as const;

export function communityJsonLd() {
	const siteUrl = getSiteUrl();
	const pageUrl = `${siteUrl}${communityPath}`;

	return {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "WebSite",
				"@id": `${siteUrl}/#website`,
				url: siteUrl,
				name: siteName,
				publisher: { "@id": `${siteUrl}/#organization` },
			},
			{
				"@type": "Organization",
				"@id": `${siteUrl}/#organization`,
				name: siteName,
				url: siteUrl,
				sameAs: [
					socialProfiles.github,
					socialProfiles.discord,
					socialProfiles.x,
				],
			},
			{
				"@type": "WebPage",
				"@id": `${pageUrl}#webpage`,
				url: pageUrl,
				name: "Community | Reloop",
				description: communitySeo.description,
				isPartOf: { "@id": `${siteUrl}/#website` },
				about: { "@id": `${siteUrl}/#organization` },
			},
		],
	};
}
