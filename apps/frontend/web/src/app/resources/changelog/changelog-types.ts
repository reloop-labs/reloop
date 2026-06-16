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
	/** One-line summary shown on the changelog index and release header. */
	description: string;
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
