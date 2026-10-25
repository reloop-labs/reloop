import { homeFaqItems } from "@reloop/web/lib/home-faq";
import {
	faqPageJsonLd,
	pricingProductJsonLd,
	pricingSoftwareApplicationJsonLd,
} from "@reloop/web/lib/schema";
import {
	contactEmail,
	defaultOgImage,
	getSiteUrl,
	siteDescription,
	siteName,
	socialProfiles,
} from "@reloop/web/lib/site";

const siteUrl = getSiteUrl();
const organizationId = `${siteUrl}/#organization`;

export const homeSchema = [
	{
		"@context": "https://schema.org" as const,
		"@type": "WebSite" as const,
		"@id": `${siteUrl}/#website`,
		name: siteName,
		url: siteUrl,
		description: siteDescription,
		publisher: { "@id": organizationId },
	},
	{
		"@context": "https://schema.org" as const,
		"@type": "Organization" as const,
		"@id": organizationId,
		name: "Reloop Labs",
		alternateName: siteName,
		url: siteUrl,
		logo: `${siteUrl}${defaultOgImage}`,
		email: contactEmail,
		contactPoint: [
			{
				"@type": "ContactPoint" as const,
				contactType: "customer support",
				email: contactEmail,
				url: `${siteUrl}/contact`,
				availableLanguage: ["English"],
			},
		],
		sameAs: [
			socialProfiles.github,
			socialProfiles.x,
			socialProfiles.discord,
			socialProfiles.linkedin,
		],
	},
	{
		...pricingSoftwareApplicationJsonLd(siteUrl),
		"@id": `${siteUrl}/#software`,
		url: siteUrl,
		publisher: { "@id": organizationId },
	},
	{
		...pricingProductJsonLd(siteUrl),
		"@id": `${siteUrl}/#product`,
		url: siteUrl,
	},
	{
		"@context": "https://schema.org" as const,
		"@type": "ItemList" as const,
		name: "Ways to use Reloop",
		itemListElement: [
			["MCP Server", "/features/mcp"],
			["Developer CLI", "/docs/resources/cli"],
			["Email API", "/docs/api"],
			["SMTP relay", "/docs/smtp"],
		].map(([name, path], index) => ({
			"@type": "ListItem" as const,
			position: index + 1,
			name,
			url: `${siteUrl}${path}`,
		})),
	},
	faqPageJsonLd(homeFaqItems),
];
