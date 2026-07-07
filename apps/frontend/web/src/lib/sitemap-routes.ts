import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { LANGUAGE_SLUGS } from "../app/languages/languages";
import {
	changelogReleases,
	getChangelogReleasePath,
} from "../app/changelog/changelog-utils";

const APP_DIR = join(process.cwd(), "src/app");

/** Same-origin routes served outside this app (e.g. docs reverse proxy). */
const EXTERNAL_ROUTES = ["/docs/resources/sdks"];

function hasPage(dir: string) {
	return existsSync(join(dir, "page.tsx")) || existsSync(join(dir, "page.ts"));
}

function collectStaticRoutes(dir: string, segments: string[] = []): string[] {
	const routes: string[] = [];

	if (hasPage(dir)) {
		routes.push(segments.length === 0 ? "/" : `/${segments.join("/")}`);
	}

	for (const entry of readdirSync(dir)) {
		if (entry.startsWith(".") || entry === "api") continue;

		const fullPath = join(dir, entry);
		if (!statSync(fullPath).isDirectory()) continue;

		if (entry.startsWith("(") && entry.endsWith(")")) {
			routes.push(...collectStaticRoutes(fullPath, segments));
			continue;
		}

		if (entry.startsWith("[")) {
			const segmentPath = segments.join("/");

			if (entry === "[version]" && segmentPath === "changelog") {
				for (const release of changelogReleases) {
					routes.push(getChangelogReleasePath(release.version));
				}
			} else if (entry === "[slug]" && segmentPath === "languages") {
				for (const slug of LANGUAGE_SLUGS) {
					routes.push(`/languages/${slug}`);
				}
			}

			continue;
		}

		routes.push(...collectStaticRoutes(fullPath, [...segments, entry]));
	}

	return routes;
}

/** All indexable marketing routes for sitemap.xml */
export function getAllSitemapRoutes(): string[] {
	const routes = [...collectStaticRoutes(APP_DIR), ...EXTERNAL_ROUTES];
	return [...new Set(routes)].sort((a, b) => a.localeCompare(b));
}
