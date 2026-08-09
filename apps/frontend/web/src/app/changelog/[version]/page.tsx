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
	return changelogReleases.map((release) => ({
		version: release.version,
	}));
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

function getBreadcrumbParts(dateStr: string) {
	const parts = dateStr.split(" ");
	const lastPart = parts[parts.length - 1];
	const isYear = Boolean(lastPart && /^\d{4}$/.test(lastPart));
	if (isYear && lastPart) {
		const datePart = parts.slice(0, -1).join(" ").toUpperCase();
		return { year: lastPart, date: datePart };
	}
	return { year: "2026", date: dateStr.toUpperCase() };
}

export default async function ChangelogReleasePage({ params }: PageProps) {
	const { version } = await params;
	const release = getChangelogReleaseByVersion(version);

	if (!release) {
		notFound();
	}

	const { year, date: formattedDate } = getBreadcrumbParts(release.date);

	return (
		<div className="min-h-screen bg-white dark:bg-black">
			<section className="relative w-full border-stroke-soft-200 border-b bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
				<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x px-6 pt-28 pb-14 sm:px-10 sm:pt-32 sm:pb-16 md:max-w-7xl lg:px-12 dark:border-white/10">
					{/* Breadcrumb Header */}
					<div className="flex items-center gap-2 font-medium text-[11px] tracking-wider text-text-sub-600 uppercase dark:text-white/50">
						<Link
							href="/changelog"
							className="transition-colors hover:text-text-strong-950 dark:hover:text-white"
						>
							CHANGELOG
						</Link>
						<span className="text-text-soft-400 dark:text-white/30">/</span>
						<span>{year}</span>
						<span className="text-text-soft-400 dark:text-white/30">/</span>
						<span>{formattedDate}</span>
					</div>

					{/* Title */}
					<h1 className="mt-5 font-semibold text-3xl text-text-strong-950 leading-[1.15] tracking-tight sm:text-4xl lg:text-[2.6rem] dark:text-white">
						{release.title}
					</h1>

					{/* Tag Bullet Dots */}
					{release.tags && release.tags.length > 0 && (
						<div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-medium text-text-sub-600 dark:text-white/60">
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
					<p className="mt-6 max-w-2xl text-[15px] text-text-sub-600 leading-relaxed sm:text-[16px] dark:text-white/60">
						{release.description}
					</p>

					{/* Horizontal Divider */}
					<div className="my-8 border-b border-stroke-soft-200/80 sm:my-10 dark:border-white/10" />

					{/* Release Content Sections */}
					<div className="max-w-3xl">
						<ChangelogReleaseContent release={release} />
					</div>
				</div>
			</section>
		</div>
	);
}
