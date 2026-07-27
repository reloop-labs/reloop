import { CodeBlock } from "@reloop/web/components/page-shell";
import type { ChangelogCategory, ChangelogRelease } from "./changelog-types";

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
		<div className="space-y-8">
			{sorted.map((section) => (
				<div key={section.category}>
					<h2 className="font-semibold text-[12px] text-text-soft-400 uppercase tracking-wider dark:text-white/35">
						{section.category}
					</h2>
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

export function ChangelogReleaseContent({
	release,
}: {
	release: ChangelogRelease;
}) {
	return (
		<div>
			<div className="flex flex-wrap gap-2">
				{release.tags.map((tag) => (
					<span
						key={tag}
						className="rounded-md border border-stroke-soft-200 bg-bg-weak-50 px-2.5 py-1 font-medium text-[12px] text-text-sub-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60"
					>
						{tag}
					</span>
				))}
			</div>

			<div className="mt-10">
				<ReleaseSections release={release} />
			</div>

			{release.code && (
				<div className="mt-10">
					<CodeBlock>{release.code}</CodeBlock>
				</div>
			)}
		</div>
	);
}
