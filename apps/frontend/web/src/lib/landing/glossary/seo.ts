import type { GlossaryTermDefinition } from "@reloop/web/lib/landing/types";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";

const siteUrl = () => getSiteUrl();

/** Meta description sweet spot. */
const DESC_MIN = 120;
const DESC_MAX = 160;

function clampDescription(text: string, keywordHint?: string): string {
	let d = text.trim().replace(/\s+/g, " ");
	if (d.length < DESC_MIN) {
		const pad =
			keywordHint != null
				? ` Learn what ${keywordHint} means in Reloop's free email glossary for developers and marketers.`
				: " Part of Reloop's free email glossary for developers and marketers.";
		d = `${d}${pad}`;
	}
	if (d.length <= DESC_MAX) return d;
	return `${d.slice(0, DESC_MAX - 1).trimEnd()}...`;
}

/**
 * Title segment for Next's root template (`%s | Reloop`).
 * Primary keyword first: "{Term} | Email Glossary" → SERP "… | Reloop".
 */
export function glossaryTermTitle(term: GlossaryTermDefinition): string {
	return `${term.title} | Email Glossary`;
}

/** Full title string for Open Graph / JSON-LD (includes brand). */
export function glossaryTermTitleFull(term: GlossaryTermDefinition): string {
	return `${glossaryTermTitle(term)} | Reloop`;
}

export function glossaryTermMetaDescription(
	term: GlossaryTermDefinition,
): string {
	return clampDescription(term.description, term.title);
}

export function glossaryTermKeywords(term: GlossaryTermDefinition): string[] {
	const extra = [
		`${term.title} meaning`,
		`${term.title} definition`,
		"email glossary",
		"email terms",
		"email infrastructure",
	];
	// Dedupe case-insensitively, keep order
	const seen = new Set<string>();
	const out: string[] = [];
	for (const k of [...term.keywords, ...extra]) {
		const key = k.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(k);
	}
	return out;
}

export function createGlossaryTermMetadata(
	term: GlossaryTermDefinition,
): Metadata {
	const path = `/glossary/${term.slug}`;
	const canonicalUrl = `${siteUrl()}${path}`;
	// Segment only — root layout template appends " | Reloop"
	const title = glossaryTermTitle(term);
	const titleFull = glossaryTermTitleFull(term);
	const description = glossaryTermMetaDescription(term);
	const keywords = glossaryTermKeywords(term);

	return {
		title,
		description,
		keywords,
		alternates: { canonical: canonicalUrl },
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-image-preview": "large",
				"max-snippet": -1,
				"max-video-preview": -1,
			},
		},
		openGraph: {
			title: titleFull,
			description,
			type: "article",
			url: canonicalUrl,
			siteName: "Reloop",
			locale: "en_US",
		},
		twitter: {
			card: "summary_large_image",
			title: titleFull,
			description,
		},
		// Dynamic opengraph-image.tsx / twitter-image.tsx are picked up by Next
	};
}

export function createGlossaryIndexMetadata(): Metadata {
	const pageUrl = `${siteUrl()}/glossary`;
	// Segment for template → "Email Glossary: Deliverability & Auth Terms | Reloop"
	const title = "Email Glossary: Deliverability & Auth Terms";
	const titleFull = `${title} | Reloop`;
	const description = clampDescription(
		"Plain-language definitions for email terms: deliverability, authentication (SPF, DKIM, DMARC), bounces, analytics, and the rest of what you hit when you ship mail.",
	);

	return {
		title,
		description,
		keywords: [
			"email glossary",
			"email marketing terms",
			"email deliverability glossary",
			"SPF DKIM DMARC explained",
			"email infrastructure terminology",
			"email authentication terms",
			"transactional email terms",
			"email bounce meaning",
		],
		alternates: { canonical: pageUrl },
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-image-preview": "large",
				"max-snippet": -1,
				"max-video-preview": -1,
			},
		},
		openGraph: {
			title: titleFull,
			description,
			type: "website",
			url: pageUrl,
			siteName: "Reloop",
			locale: "en_US",
		},
		twitter: {
			card: "summary_large_image",
			title: titleFull,
			description,
		},
	};
}

export function buildGlossaryTermJsonLd(term: GlossaryTermDefinition) {
	const origin = siteUrl();
	const pageUrl = `${origin}/glossary/${term.slug}`;
	const glossaryUrl = `${origin}/glossary`;
	const description = glossaryTermMetaDescription(term);

	const definedTerm = {
		"@type": "DefinedTerm",
		"@id": `${pageUrl}#term`,
		name: term.title,
		description: term.description,
		url: pageUrl,
		inDefinedTermSet: {
			"@type": "DefinedTermSet",
			"@id": `${glossaryUrl}#glossary`,
			name: "Email Glossary",
			url: glossaryUrl,
		},
		...(term.keywords.length > 0
			? { alternateName: term.keywords.slice(0, 5) }
			: {}),
	};

	const webPage = {
		"@type": "WebPage",
		"@id": pageUrl,
		url: pageUrl,
		name: glossaryTermTitleFull(term),
		description,
		isPartOf: {
			"@type": "WebSite",
			name: "Reloop",
			url: origin,
		},
		about: { "@id": `${pageUrl}#term` },
		mainEntity: { "@id": `${pageUrl}#term` },
		inLanguage: "en-US",
	};

	const breadcrumb = {
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: "Home",
				item: origin,
			},
			{
				"@type": "ListItem",
				position: 2,
				name: "Email Glossary",
				item: glossaryUrl,
			},
			{
				"@type": "ListItem",
				position: 3,
				name: term.title,
				item: pageUrl,
			},
		],
	};

	const graph: Record<string, unknown>[] = [definedTerm, webPage, breadcrumb];

	if (term.relatedTerms && term.relatedTerms.length > 0) {
		graph.push({
			"@type": "ItemList",
			name: `Related to ${term.title}`,
			itemListElement: term.relatedTerms.map((r, i) => ({
				"@type": "ListItem",
				position: i + 1,
				name: r.title,
				url: `${origin}/glossary/${r.slug}`,
			})),
		});
	}

	return {
		"@context": "https://schema.org",
		"@graph": graph,
	};
}

export function buildGlossaryIndexJsonLd(
	terms: { slug: string; title: string; description: string }[],
) {
	const origin = siteUrl();
	const pageUrl = `${origin}/glossary`;

	return {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "CollectionPage",
				"@id": pageUrl,
				url: pageUrl,
				name: "Email Glossary",
				description:
					"Plain-language email glossary for marketing and infrastructure terms.",
				isPartOf: {
					"@type": "WebSite",
					name: "Reloop",
					url: origin,
				},
				inLanguage: "en-US",
				mainEntity: { "@id": `${pageUrl}#glossary` },
			},
			{
				"@type": "DefinedTermSet",
				"@id": `${pageUrl}#glossary`,
				name: "Email Glossary",
				description:
					"Plain-language glossary of email marketing and infrastructure terms.",
				url: pageUrl,
				hasDefinedTerm: terms.map((term) => ({
					"@type": "DefinedTerm",
					name: term.title,
					description: term.description,
					url: `${origin}/glossary/${term.slug}`,
					inDefinedTermSet: `${pageUrl}#glossary`,
				})),
			},
			{
				"@type": "BreadcrumbList",
				itemListElement: [
					{
						"@type": "ListItem",
						position: 1,
						name: "Home",
						item: origin,
					},
					{
						"@type": "ListItem",
						position: 2,
						name: "Email Glossary",
						item: pageUrl,
					},
				],
			},
			{
				"@type": "ItemList",
				name: "Email glossary terms",
				numberOfItems: terms.length,
				itemListElement: terms.map((term, i) => ({
					"@type": "ListItem",
					position: i + 1,
					name: term.title,
					url: `${origin}/glossary/${term.slug}`,
				})),
			},
		],
	};
}
