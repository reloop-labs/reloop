import { getSiteUrl, sitemapRoutes } from "@reloop/web/lib/site";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
	const siteUrl = getSiteUrl();

	return sitemapRoutes.map((path) => ({
		url: `${siteUrl}${path === "/" ? "" : path}`,
		lastModified: new Date(),
		changeFrequency: path === "/resources/changelog" ? "weekly" : "monthly",
		priority: path === "/" ? 1 : path === "/resources/community" ? 0.8 : 0.7,
	}));
}
