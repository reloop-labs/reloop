import { getSiteUrl, sitemapRoutes } from "@reloop/web/lib/site";
import type { MetadataRoute } from "next";
import {
	changelogReleases,
	getChangelogReleasePath,
} from "./(main)/resources/changelog/changelog-utils";

export default function sitemap(): MetadataRoute.Sitemap {
	const siteUrl = getSiteUrl();

	const staticPages = sitemapRoutes.map((path) => ({
		url: `${siteUrl}${path === "/" ? "" : path}`,
		lastModified: new Date(),
		changeFrequency:
			path === "/resources/changelog"
				? ("weekly" as const)
				: ("monthly" as const),
		priority: path === "/" ? 1 : path === "/resources/community" ? 0.8 : 0.7,
	}));

	const changelogPages = changelogReleases.map((release) => ({
		url: `${siteUrl}${getChangelogReleasePath(release.version)}`,
		lastModified: new Date(),
		changeFrequency: "monthly" as const,
		priority: 0.6,
	}));

	return [...staticPages, ...changelogPages];
}
