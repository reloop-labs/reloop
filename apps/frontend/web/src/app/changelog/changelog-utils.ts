import { changelogCodeByVersion } from "./changelog-code-samples";
import { loadChangelogReleases } from "./changelog-releases";
import type { ChangelogRelease } from "./changelog-types";

export function getChangelogReleasePath(version: string) {
	return `/changelog/${version}`;
}

export function getTagDotColor(tag: string) {
	const lower = tag.toLowerCase();
	if (lower.includes("design") || lower.includes("ui")) {
		return "bg-sky-500/80 dark:bg-sky-400";
	}
	if (
		lower.includes("feature") ||
		lower.includes("inbox") ||
		lower.includes("workflow")
	) {
		return "bg-blue-500/80 dark:bg-blue-400";
	}
	if (
		lower.includes("enhancement") ||
		lower.includes("marketing") ||
		lower.includes("seo")
	) {
		return "bg-purple-500/80 dark:bg-purple-400";
	}
	if (lower.includes("fix") || lower.includes("bug")) {
		return "bg-amber-500/80 dark:bg-amber-400";
	}
	return "bg-indigo-500/80 dark:bg-indigo-400";
}

function withChangelogPreviews(
	releases: Omit<ChangelogRelease, "preview" | "code">[],
): ChangelogRelease[] {
	return releases.map((release) => ({
		...release,
		...(changelogCodeByVersion[release.version] && {
			code: changelogCodeByVersion[release.version],
		}),
	}));
}

export function getChangelogReleases(): ChangelogRelease[] {
	return withChangelogPreviews(loadChangelogReleases());
}

export function getChangelogReleaseByVersion(versionOrSlug: string) {
	const releases = getChangelogReleases();
	return releases.find(
		(release) =>
			release.slug === versionOrSlug || release.version === versionOrSlug,
	);
}

export const changelogReleases = new Proxy([] as ChangelogRelease[], {
	get(_target, prop) {
		const fresh = getChangelogReleases();
		const val = Reflect.get(fresh, prop);
		return typeof val === "function" ? val.bind(fresh) : val;
	},
});
