import { getLandingSitemapRoutes } from "@reloop/web/lib/landing/routes";
import { getSiteUrl, sitemapRoutes as baseSitemapRoutes } from "@reloop/web/lib/site";
import type { MetadataRoute } from "next";
import {
	changelogReleases,
	getChangelogReleasePath,
} from "./resources/changelog/changelog-utils";

export default function sitemap(): MetadataRoute.Sitemap {
	const siteUrl = getSiteUrl();
	const sitemapRoutes = [...baseSitemapRoutes, ...getLandingSitemapRoutes()];

	const staticPages = sitemapRoutes.map((path) => ({
		url: `${siteUrl}${path === "/" ? "" : path}`,
		lastModified: new Date("2026-07-05"),
		changeFrequency:
			path === "/resources/changelog"
				? ("weekly" as const)
				: ("monthly" as const),
		priority: path === "/" ? 1 : path === "/resources/community" ? 0.8 : 0.7,
	}));

	const changelogPages = changelogReleases.map((release) => ({
		url: `${siteUrl}${getChangelogReleasePath(release.version)}`,
		lastModified: new Date("2026-07-05"),
		changeFrequency: "monthly" as const,
		priority: 0.6,
	}));

	return [...staticPages, ...changelogPages];
}
