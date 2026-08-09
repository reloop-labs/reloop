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

type ChangelogSection = {
	category: ChangelogCategory;
	items: ChangelogItem[];
};

export type ChangelogRelease = {
	slug: string;
	date: string;
	/** Optional exact launch date string, e.g. "26 October 2025" */
	launchDate?: string;
	version: string;
	title: string;
	/** One-line summary shown on the changelog index and release header. */
	description: string;
	tags: string[];
	/** Legacy flat list; use `sections` for categorized entries. */
	items?: ChangelogItem[];
	sections?: ChangelogSection[];
	/** Markdown content string for freeform markdown release notes. */
	markdown?: string;
	code?: string;
	preview?: {
		src: string;
		alt: string;
	};
};
