import { CodeBlock } from "@reloop/web/components/page-shell";
import Image from "next/image";

export type ChangelogCategory =
	| "Planning"
	| "Design"
	| "Frontend"
	| "Backend"
	| "DevOps"
	| "Testing";

type ChangelogItem = {
	label: string;
	description: string;
};

export type ChangelogSection = {
	category: ChangelogCategory;
	items: ChangelogItem[];
};

export type ChangelogRelease = {
	date: string;
	version: string;
	title: string;
	tags: string[];
	/** Legacy flat list; use `sections` for categorized entries. */
	items?: ChangelogItem[];
	sections?: ChangelogSection[];
	code?: string;
	preview?: {
		src: string;
		alt: string;
	};
};

const categoryOrder: ChangelogCategory[] = [
	"Planning",
	"Design",
	"Frontend",
	"Backend",
	"DevOps",
	"Testing",
];

function ReleaseSections({ release }: { release: ChangelogRelease }) {
	const sections =
		release.sections ??
		(release.items
			? [{ category: "Frontend" as const, items: release.items }]
			: []);

	const sorted = [...sections].sort(
		(a, b) =>
			categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category),
	);

	return (
		<div className="mt-6 space-y-8">
			{sorted.map((section) => (
				<div key={section.category}>
					<h3 className="font-semibold text-[12px] text-text-soft-400 uppercase tracking-wider dark:text-white/35">
						{section.category}
					</h3>
					<ul className="mt-3 space-y-3">
						{section.items.map((item) => (
							<li
								key={`${section.category}-${item.label}`}
								className="text-[14px] text-text-sub-600 leading-relaxed sm:text-[15px] dark:text-white/50"
							>
								<span className="font-semibold text-text-strong-950 dark:text-white">
									{item.label}
								</span>{" "}
								{item.description}
							</li>
						))}
					</ul>
				</div>
			))}
		</div>
	);
}

export function ChangelogTimeline({
	releases,
}: {
	releases: ChangelogRelease[];
}) {
	return (
		<div className="space-y-16 sm:space-y-20">
			{releases.map((release, index) => (
				<article
					key={`${release.version}-${release.title}`}
					className="grid grid-cols-1 gap-6 sm:grid-cols-[7rem_1fr] sm:gap-x-10 lg:grid-cols-[8rem_1fr]"
				>
					<div className="sm:pt-1">
						<time className="block font-medium text-[13px] text-text-sub-600 tabular-nums dark:text-white/40">
							{release.date}
						</time>
						<div className="mt-3 inline-flex min-w-[2.75rem] items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-weak-50 px-2.5 py-1.5 font-semibold text-[13px] text-text-strong-950 tabular-nums dark:border-white/10 dark:bg-white/[0.04] dark:text-white">
							{release.version}
						</div>
					</div>

					<div
						className={`relative sm:border-stroke-soft-200 sm:border-l sm:pl-10 dark:sm:border-white/10 ${index < releases.length - 1 ? "sm:pb-2" : ""}`}
					>
						<div
							className="-translate-x-1/2 absolute top-2 left-0 hidden size-2.5 rounded-full bg-text-strong-950 sm:block dark:bg-white"
							aria-hidden="true"
						/>

						<h2 className="font-semibold text-[1.35rem] text-text-strong-950 leading-snug sm:text-[1.5rem] dark:text-white">
							Release {release.version} — {release.title}
						</h2>

						<div className="mt-4 flex flex-wrap gap-2">
							{release.tags.map((tag) => (
								<span
									key={tag}
									className="rounded-md border border-stroke-soft-200 bg-bg-weak-50 px-2.5 py-1 font-medium text-[12px] text-text-sub-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60"
								>
									{tag}
								</span>
							))}
						</div>

						<div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.02]">
							{release.preview ? (
								<Image
									src={release.preview.src}
									alt={release.preview.alt}
									fill
									className="object-cover"
									sizes="(max-width: 1320px) 100vw, 1320px"
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

						<ReleaseSections release={release} />

						{release.code && (
							<div className="mt-6">
								<CodeBlock>{release.code}</CodeBlock>
							</div>
						)}
					</div>
				</article>
			))}
		</div>
	);
}
