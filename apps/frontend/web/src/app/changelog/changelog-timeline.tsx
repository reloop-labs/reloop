import Image from "next/image";
import Link from "next/link";
import type { ChangelogRelease } from "./changelog-types";
import { getChangelogReleasePath } from "./changelog-utils";

function ReleaseEntry({
	release,
	index,
}: {
	release: ChangelogRelease;
	index: number;
}) {
	const href = getChangelogReleasePath(release.version);

	return (
		<article className="grid grid-cols-1 gap-4 py-12 sm:grid-cols-[10.5rem_minmax(0,1fr)] sm:gap-12 sm:py-16 md:grid-cols-4">
			<div className="sm:pt-1.5 md:col-span-1">
				<time className="block text-[13px] text-text-sub-600 tabular-nums dark:text-white/55">
					{release.date}
				</time>
			</div>

			<div className="min-w-0 md:col-span-3">
				<Link
					href={href}
					className="group block rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-2 focus-visible:ring-offset-bg-white-0 dark:focus-visible:ring-offset-black"
				>
					<h2 className="font-semibold text-[1.35rem] text-text-strong-950 leading-snug tracking-tight transition-colors group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4 sm:text-2xl dark:text-white">
						{release.title}
					</h2>

					<div className="relative mt-5 aspect-video overflow-hidden rounded-lg border border-stroke-soft-200 bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.02]">
						{release.preview ? (
							<Image
								src={release.preview.src}
								alt={release.preview.alt}
								fill
								className="object-cover transition-transform duration-300 group-hover:scale-[1.01]"
								sizes="(max-width: 768px) 100vw, 720px"
								priority={index === 0}
							/>
						) : (
							<div className="flex h-full items-center justify-center px-6">
								<p className="text-center text-[13px] text-text-soft-400 dark:text-white/25">
									Release preview
								</p>
							</div>
						)}
					</div>
				</Link>

				<p className="mt-5 max-w-2xl text-[15px] text-text-sub-600 leading-relaxed dark:text-white/55">
					{release.description}
				</p>
			</div>
		</article>
	);
}

export function ChangelogTimeline({
	releases,
}: {
	releases: ChangelogRelease[];
}) {
	return (
		<div className="divide-y divide-stroke-soft-200 dark:divide-white/10">
			{releases.map((release, index) => (
				<ReleaseEntry
					key={`${release.version}-${release.title}`}
					release={release}
					index={index}
				/>
			))}
		</div>
	);
}
