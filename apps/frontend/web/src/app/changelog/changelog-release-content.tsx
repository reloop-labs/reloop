import type { MDXComponents } from "mdx/types";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { ChangelogCategory, ChangelogRelease } from "./changelog-types";

const categoryOrder: ChangelogCategory[] = [
	"Planning",
	"Design",
	"Frontend",
	"Backend",
	"DevOps",
	"Testing",
];

export function getReleaseMarkdown(release: ChangelogRelease): string {
	if (release.markdown) return release.markdown;

	const sections =
		release.sections ??
		(release.items
			? [{ category: "Frontend" as const, items: release.items }]
			: []);

	const sorted = [...sections].sort(
		(a, b) =>
			categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category),
	);

	return sorted
		.map((sec) => {
			const items = sec.items
				.map((item) => `- **${item.label}.** ${item.description}`)
				.join("\n");
			return `### ${sec.category.toUpperCase()}\n\n${items}`;
		})
		.join("\n\n");
}

const changelogMdxComponents: MDXComponents = {
	h3: ({ children }) => (
		<h3 className="mt-7 mb-2.5 font-medium text-[11px] text-text-sub-600 uppercase tracking-wider first:mt-0 dark:text-white/40">
			{children}
		</h3>
	),
	ul: ({ children }) => <ul className="my-3 space-y-3">{children}</ul>,
	li: ({ children }) => (
		<li className="flex items-start gap-3 text-[14px] text-text-sub-600 leading-relaxed sm:text-[14.5px] dark:text-white/60">
			<span
				className="mt-2 size-1 shrink-0 rounded-[1px] bg-text-sub-600/40 dark:bg-white/35"
				aria-hidden="true"
			/>
			<div>{children}</div>
		</li>
	),
	strong: ({ children }) => (
		<strong className="font-semibold text-text-strong-950 dark:text-white">
			{children}
		</strong>
	),
	p: ({ children }) => (
		<p className="my-2.5 text-[14px] text-text-sub-600 leading-relaxed sm:text-[14.5px] dark:text-white/60">
			{children}
		</p>
	),
};

export async function ChangelogReleaseContent({
	release,
}: {
	release: ChangelogRelease;
}) {
	const markdownSource = getReleaseMarkdown(release);

	return (
		<div className="space-y-6">
			<MDXRemote source={markdownSource} components={changelogMdxComponents} />
		</div>
	);
}

