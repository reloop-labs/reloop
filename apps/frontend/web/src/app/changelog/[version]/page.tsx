import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChangelogGridBody } from "../changelog-grid";
import { ChangelogReleaseContent } from "../changelog-release-content";
import {
	changelogReleases,
	getChangelogReleaseByVersion,
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
		<div className="min-h-screen bg-white dark:bg-black">
			<section className="relative overflow-clip border-[#e5e5e5] border-b px-4 dark:border-white/10">
				<div className="relative z-0 mx-auto max-w-[1080px] border-[#e5e5e5] border-x px-4 pt-36 pb-10 sm:px-12 sm:pt-44 sm:pb-12 dark:border-white/10">
					<Link
						href="/changelog"
						className="inline-flex items-center gap-1 font-medium text-[13px] text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white"
					>
						<span aria-hidden="true">‹</span>
						All updates
					</Link>
				</div>
			</section>

			<ChangelogGridBody>
				<article className="grid grid-cols-1 gap-4 py-12 sm:grid-cols-[10.5rem_minmax(0,1fr)] sm:gap-12 sm:py-16 md:grid-cols-4">
					<div className="sm:pt-1.5 md:col-span-1">
						<time className="block text-[13px] text-text-sub-600 tabular-nums dark:text-white/55">
							{release.date}
						</time>
					</div>

					<div className="min-w-0 md:col-span-3">
						<h1 className="font-semibold text-[1.35rem] text-text-strong-950 leading-snug tracking-tight sm:text-2xl dark:text-white">
							{release.title}
						</h1>

						{release.preview ? (
							<div className="relative mt-5 aspect-video overflow-hidden rounded-lg border border-[#e5e5e5] bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.02]">
								<Image
									src={release.preview.src}
									alt={release.preview.alt}
									fill
									className="object-cover"
									sizes="(max-width: 768px) 100vw, 720px"
									priority
								/>
							</div>
						) : null}

						<p className="mt-5 max-w-2xl text-[15px] text-text-sub-600 leading-relaxed dark:text-white/55">
							{release.description}
						</p>

						<div className="mt-10 sm:mt-12">
							<ChangelogReleaseContent release={release} />
						</div>
					</div>
				</article>
			</ChangelogGridBody>
		</div>
	);
}
