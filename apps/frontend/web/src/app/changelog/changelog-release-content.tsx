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
					<h2 className="font-medium text-[11px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
						{section.category}
					</h2>
					<ul className="mt-3 space-y-3.5">
						{section.items.map((item) => (
							<li
								key={`${section.category}-${item.label}`}
								className="flex items-start gap-3 text-[14.5px] text-text-sub-600 leading-relaxed sm:text-[15px] dark:text-white/60"
							>
								<span
									className="mt-2.5 size-1 shrink-0 rounded-[1px] bg-text-sub-600/40 dark:bg-white/35"
									aria-hidden="true"
								/>
								<div>
									<span className="font-semibold text-text-strong-950 dark:text-white">
										{item.label}.
									</span>{" "}
									{item.description}
								</div>
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
		<div className="space-y-8">
			{release.sections && release.sections.length > 0 && (
				<ReleaseSections release={release} />
			)}
			{release.markdown && (
				<div className="prose prose-neutral max-w-none text-[15px] text-text-sub-600 leading-relaxed dark:prose-invert dark:text-white/65">
					{release.markdown}
				</div>
			)}
		</div>
	);
}

