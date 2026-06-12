import { changelogCodeByVersion } from "./changelog-code-samples";
import { changelogReleasesData } from "./changelog-releases";
import type { ChangelogRelease } from "./changelog-types";

export function getChangelogReleasePath(version: string) {
	return `/resources/changelog/${version}`;
}

export function getChangelogReleaseByVersion(version: string) {
	return changelogReleases.find((release) => release.version === version);
}

export function withChangelogPreviews(
	releases: Omit<ChangelogRelease, "preview" | "code">[],
): ChangelogRelease[] {
	return releases.map((release) => ({
		...release,
		preview: {
			src: `/changelog/${release.version}.png`,
			alt: `Release ${release.version} - ${release.title}`,
		},
		...(changelogCodeByVersion[release.version] && {
			code: changelogCodeByVersion[release.version],
		}),
	}));
}

export const changelogReleases = withChangelogPreviews(changelogReleasesData);

export const changelogComingNext = [
	"Campaigns builder",
	"Broadcast email sending",
	"SDK GA across all languages",
	"Expanded deliverability tooling",
	"Community integrations marketplace",
	"Advanced analytics dashboard",
	"Custom SMTP relay configuration",
	"A/B testing for email templates",
];
