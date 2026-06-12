import { PageSection } from "@reloop/web/components/page-shell";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChangelogReleaseContent } from "../changelog-release-content";
import {
	changelogReleases,
	getChangelogReleaseByVersion,
} from "../changelog-utils";

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
			...(release.preview && {
				images: [{ url: release.preview.src, alt: release.preview.alt }],
			}),
		},
	};
}

export default async function ChangelogReleasePage({ params }: PageProps) {
	const { version } = await params;
	const release = getChangelogReleaseByVersion(version);

	if (!release) {
		notFound();
	}

	return (
		<div className="pb-16 sm:pb-20">
			<PageSection narrow flushTop>
				<Link
					href="/resources/changelog"
					className="inline-flex items-center gap-1 font-medium text-[13px] text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/45 dark:hover:text-white"
				>
					<span aria-hidden="true">‹</span>
					All updates
				</Link>

				<header className="mx-auto mt-10 max-w-2xl sm:mt-12">
					{release.preview ? (
						<div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.02]">
							<Image
								src={release.preview.src}
								alt={release.preview.alt}
								fill
								className="object-cover"
								sizes="(max-width: 768px) 100vw, 672px"
								priority
							/>
						</div>
					) : null}
					<time className="mt-6 block font-medium text-[13px] text-text-sub-600 tabular-nums dark:text-white/40">
						{release.date}
					</time>
					<h1 className="mt-3 font-semibold text-[1.35rem] text-text-strong-950 leading-snug sm:text-[1.5rem] dark:text-white">
						{release.title}
					</h1>
					<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed sm:text-[15px] dark:text-white/50">
						{release.description}
					</p>
				</header>

				<div className="mx-auto mt-12 max-w-2xl sm:mt-14">
					<ChangelogReleaseContent release={release} />
				</div>
			</PageSection>
		</div>
	);
}
