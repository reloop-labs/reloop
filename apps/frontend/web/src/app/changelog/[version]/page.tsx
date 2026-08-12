import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChangelogReleaseContent } from "../changelog-release-content";
import {
	changelogReleases,
	getChangelogReleaseByVersion,
	getTagDotColor,
} from "../changelog-utils";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

type PageProps = {
	params: Promise<{ version: string }>;
};

export function generateStaticParams() {
	return changelogReleases.flatMap((release) => [
		{ version: release.slug },
		{ version: release.version },
	]);
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { version } = await params;
	const release = getChangelogReleaseByVersion(version);

	if (!release) {
		return { title: "Release not found" };
	}

	const title = `${release.title} | Changelog`;

	return {
		title,
		description: release.description,
		openGraph: {
			title,
			description: release.description,
			type: "article",
		},
	};
}

function getBreadcrumbDate(release: { date: string; launchDate?: string }) {
	const rawDate = release.launchDate || release.date;
	return rawDate.toUpperCase();
}

export default async function ChangelogReleasePage({ params }: PageProps) {
	const { version } = await params;
	const release = getChangelogReleaseByVersion(version);

	if (!release) {
		notFound();
	}

	return (
		<section className="relative w-full border-stroke-soft-200 bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x px-6 pt-28 pb-14 sm:px-10 sm:pt-32 sm:pb-16 md:max-w-7xl lg:px-12 dark:border-white/10">
				{/* Breadcrumb Header */}
				<div className="flex items-center gap-2 font-medium text-[11px] text-text-sub-600 uppercase tracking-wider dark:text-white/50">
					<Link
						href="/changelog"
						className="transition-colors hover:text-text-strong-950 dark:hover:text-white"
					>
						CHANGELOG
					</Link>
					<span className="text-text-soft-400 dark:text-white/30">/</span>
					<span>{getBreadcrumbDate(release)}</span>
				</div>

				{/* Title */}
				<h1 className="mt-4 font-semibold text-text-strong-950 text-xl leading-snug tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
					{release.title}
				</h1>

				{/* Tag Bullet Dots */}
				{release.tags && release.tags.length > 0 && (
					<div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 font-medium text-[12.5px] text-text-sub-600 dark:text-white/60">
						{release.tags.map((tag) => (
							<div key={tag} className="flex items-center gap-1.5">
								<span
									className={`size-1.5 rounded-full ${getTagDotColor(tag)}`}
									aria-hidden="true"
								/>
								<span>{tag}</span>
							</div>
						))}
					</div>
				)}

				{/* Lead Description */}
				<p className="mt-5 max-w-2xl text-[14px] text-text-sub-600 leading-relaxed sm:text-[14.5px] dark:text-white/60">
					{release.description}
				</p>

				{/* Horizontal Divider */}
				<div className="-mx-6 sm:-mx-10 lg:-mx-12 my-8 border-stroke-soft-200/80 border-b sm:my-10 dark:border-white/10" />

				{/* Release Content Sections */}
				<div className="max-w-3xl">
					<ChangelogReleaseContent release={release} />
				</div>
			</div>
		</section>
	);
}
