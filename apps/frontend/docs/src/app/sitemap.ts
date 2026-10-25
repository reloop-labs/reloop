import lastmod from "@reloop/fe-docs/generated/lastmod.json";
import { getSiteUrl } from "@reloop/fe-docs/lib/site";
import { source } from "@reloop/fe-docs/lib/source";
import type { MetadataRoute } from "next";

/** Git date of each page's MDX file (scripts/generate-lastmod.ts). */
const lastModified = lastmod as Record<string, string>;

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = getSiteUrl();
	const paths = source
		.generateParams()
		.map(({ slug }) => slug.join("/"))
		.filter((path) => path !== "introduction")
		.sort((a, b) => a.localeCompare(b));

	return [
		{
			url: `${baseUrl}/docs`,
			lastModified: lastModified.introduction,
			changeFrequency: "weekly",
			priority: 0.8,
		},
		...paths.map((path) => ({
			url: `${baseUrl}/docs/${path}`,
			...(lastModified[path] ? { lastModified: lastModified[path] } : {}),
			changeFrequency: "weekly" as const,
			priority: 0.6,
		})),
	];
}
