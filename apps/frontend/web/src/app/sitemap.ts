import { changelogReleases } from "@reloop/web/app/changelog/changelog-utils";
import { getPublishedPosts } from "@reloop/web/lib/landing/blog/source";
import { getSiteUrl } from "@reloop/web/lib/site";
import { getAllSitemapRoutes } from "@reloop/web/lib/sitemap-routes";
import type { MetadataRoute } from "next";

function knownLastModified(): Map<string, Date> {
	const dates = new Map<string, Date>();
	for (const post of getPublishedPosts()) {
		const date = new Date(post.publishedAt);
		if (!Number.isNaN(date.getTime())) dates.set(`/blog/${post.slug}`, date);
	}
	for (const release of changelogReleases) {
		const date = new Date(release.launchDate ?? release.date);
		if (!Number.isNaN(date.getTime())) {
			dates.set(`/changelog/${release.version}`, date);
		}
	}
	return dates;
}

function getRoutePriority(path: string): number {
	if (path === "/") return 1;
	if (path === "/glossary") return 0.8;
	if (path.startsWith("/glossary/")) return 0.7;
	if (path === "/community") return 0.8;
	if (path.startsWith("/changelog/")) return 0.6;
	return 0.7;
}

function getChangeFrequency(
	path: string,
): MetadataRoute.Sitemap[number]["changeFrequency"] {
	if (path === "/changelog" || path.startsWith("/changelog/")) {
		return "weekly";
	}
	if (path === "/glossary") {
		return "weekly";
	}
	return "monthly";
}

export default function sitemap(): MetadataRoute.Sitemap {
	const siteUrl = getSiteUrl();
	const lastModified = knownLastModified();

	return getAllSitemapRoutes().map((path) => ({
		url: `${siteUrl}${path === "/" ? "" : path}`,
		...(lastModified.has(path) ? { lastModified: lastModified.get(path) } : {}),
		changeFrequency: getChangeFrequency(path),
		priority: getRoutePriority(path),
	}));
}
