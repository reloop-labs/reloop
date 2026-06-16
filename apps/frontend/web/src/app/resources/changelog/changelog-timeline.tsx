"use client";

import { cn } from "@reloop/ui/cn";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangelogRelease } from "./changelog-types";
import { getChangelogReleasePath } from "./changelog-utils";

const STICKY_TOP_CLASS = "top-24";
const STICKY_OFFSET_PX = 96;

function ReleaseMeta({
	date,
	version,
	className,
}: {
	date: string;
	version: string;
	className?: string;
}) {
	return (
		<div className={className}>
			<time className="block font-medium text-[13px] text-text-sub-600 tabular-nums dark:text-white/40">
				{date}
			</time>
			<div className="mt-2.5 inline-flex min-w-[2.75rem] items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-weak-50 px-2.5 py-1.5 font-semibold text-[13px] text-text-strong-950 tabular-nums dark:border-white/10 dark:bg-white/[0.04] dark:text-white">
				{version}
			</div>
		</div>
	);
}

function ReleaseMarker({
	date,
	version,
	isActive,
}: {
	date: string;
	version: string;
	isActive: boolean;
}) {
	return (
		<div className="relative hidden sm:block">
			<div
				className="absolute top-0 bottom-0 left-full w-px bg-stroke-soft-200 dark:bg-white/10"
				aria-hidden="true"
			/>
			<div className={cn("py-10", isActive && `sticky ${STICKY_TOP_CLASS}`)}>
				<ReleaseMeta
					date={date}
					version={version}
					className="pr-6 text-right"
				/>
				<div
					className="-translate-x-1/2 absolute top-[calc(2.5rem+0.4rem)] left-full size-2 rounded-full bg-text-strong-950 ring-[3px] ring-bg-white-0 dark:bg-white dark:ring-[#0a0d12]"
					aria-hidden="true"
				/>
			</div>
		</div>
	);
}

function ReleaseListCard({
	release,
	index,
}: {
	release: ChangelogRelease;
	index: number;
}) {
	const href = getChangelogReleasePath(release.version);

	return (
		<Link
			href={href}
			className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-2 focus-visible:ring-offset-bg-white-0 dark:focus-visible:ring-offset-[#0a0d12]"
		>
			<div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-weak-50 transition-colors group-hover:border-stroke-soft-200/80 dark:border-white/10 dark:bg-white/[0.02] dark:group-hover:border-white/15">
				{release.preview ? (
					<Image
						src={release.preview.src}
						alt={release.preview.alt}
						fill
						className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
						sizes="(max-width: 768px) 100vw, 672px"
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
			<h2 className="mt-5 font-semibold text-[1.2rem] text-text-strong-950 leading-snug transition-colors group-hover:text-primary-base sm:text-[1.35rem] dark:text-white dark:group-hover:text-primary-base">
				{release.title}
			</h2>
			<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed sm:text-[15px] dark:text-white/50">
				{release.description}
			</p>
		</Link>
	);
}

function useActiveReleaseIndex(releaseCount: number) {
	const articleRefs = useRef<(HTMLElement | null)[]>([]);
	const [activeIndex, setActiveIndex] = useState(0);

	const updateActiveIndex = useCallback(() => {
		let next = 0;

		for (let index = 0; index < releaseCount; index++) {
			const article = articleRefs.current[index];
			if (!article) continue;

			if (article.getBoundingClientRect().top <= STICKY_OFFSET_PX) {
				next = index;
			}
		}

		setActiveIndex((current) => (current === next ? current : next));
	}, [releaseCount]);

	useEffect(() => {
		updateActiveIndex();

		let frame = 0;
		const onScroll = () => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(updateActiveIndex);
		};

		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll);

		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
		};
	}, [updateActiveIndex]);

	const setArticleRef = useCallback(
		(index: number) => (element: HTMLElement | null) => {
			articleRefs.current[index] = element;
		},
		[],
	);

	return { activeIndex, setArticleRef };
}

export function ChangelogTimeline({
	releases,
}: {
	releases: ChangelogRelease[];
}) {
	const { activeIndex, setArticleRef } = useActiveReleaseIndex(releases.length);

	return (
		<div>
			{releases.map((release, index) => (
				<article
					key={`${release.version}-${release.title}`}
					ref={setArticleRef(index)}
					className="grid grid-cols-1 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-8 lg:gap-10"
				>
					<ReleaseMeta
						date={release.date}
						version={release.version}
						className="mb-6 sm:hidden"
					/>

					<ReleaseMarker
						date={release.date}
						version={release.version}
						isActive={index === activeIndex}
					/>

					<div
						className={
							index < releases.length - 1
								? "min-w-0 py-6 pb-14 sm:py-10 sm:pb-20"
								: "min-w-0 py-6 sm:py-10"
						}
					>
						<ReleaseListCard release={release} index={index} />
					</div>
				</article>
			))}
		</div>
	);
}
