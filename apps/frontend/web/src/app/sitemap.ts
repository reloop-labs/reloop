import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { changelogReleases } from "@reloop/web/app/changelog/changelog-utils";
import lastmod from "@reloop/web/generated/lastmod.json";
import { getPublishedPosts } from "@reloop/web/lib/landing/blog/source";
import { getSiteUrl } from "@reloop/web/lib/site";
import { getAllSitemapRoutes } from "@reloop/web/lib/sitemap-routes";
import type { MetadataRoute } from "next";

const APP_DIR = join(process.cwd(), "src/app");

/** Git date of each page directory (scripts/generate-lastmod.ts). */
const pageDirDates = lastmod as Record<string, string>;

/** `/sdk/node` → `sdk/[slug]`, `/` → `(home)`: the src/app directory serving a route. */
function pageDirFor(path: string): string | null {
	const resolve = (dir: string, segments: string[]): string | null => {
		const abs = join(APP_DIR, dir);
		if (!existsSync(abs)) return null;
		const entries = readdirSync(abs, { withFileTypes: true }).filter((e) =>
			e.isDirectory(),
		);
		if (segments.length === 0) {
			if (dir in pageDirDates) return dir;
		} else {
			const [head, ...rest] = segments;
			const exact = entries.find((e) => e.name === head);
			const found =
				(exact && resolve(join(dir, exact.name), rest)) ||
				entries
					.filter((e) => e.name.startsWith("["))
					.map((e) => resolve(join(dir, e.name), rest))
					.find(Boolean);
			if (found) return found;
		}
		return (
			entries
				.filter((e) => e.name.startsWith("("))
				.map((e) => resolve(join(dir, e.name), segments))
				.find(Boolean) ?? null
		);
	};
	return resolve("", path.split("/").filter(Boolean));
}

function knownLastModified(): Map<string, Date> {
	const dates = new Map<string, Date>();
	for (const path of getAllSitemapRoutes()) {
		const dir = pageDirFor(path);
		const date = dir === null ? undefined : pageDirDates[dir];
		if (date) dates.set(path, new Date(date));
	}
	// Content dates beat code dates for posts and releases
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
