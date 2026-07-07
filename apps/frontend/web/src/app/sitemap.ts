import { getSiteUrl } from "@reloop/web/lib/site";
import { getAllSitemapRoutes } from "@reloop/web/lib/sitemap-routes";
import type { MetadataRoute } from "next";

function getRoutePriority(path: string): number {
	if (path === "/") return 1;
	if (path === "/resources/community") return 0.8;
	if (path.startsWith("/changelog/")) return 0.6;
	return 0.7;
}

function getChangeFrequency(
	path: string,
): MetadataRoute.Sitemap[number]["changeFrequency"] {
	if (
		path === "/changelog" ||
		path.startsWith("/changelog/")
	) {
		return "weekly";
	}
	return "monthly";
}

export default function sitemap(): MetadataRoute.Sitemap {
	const siteUrl = getSiteUrl();

	return getAllSitemapRoutes().map((path) => ({
		url: `${siteUrl}${path === "/" ? "" : path}`,
		lastModified: new Date("2026-07-05"),
		changeFrequency: getChangeFrequency(path),
		priority: getRoutePriority(path),
	}));
}
