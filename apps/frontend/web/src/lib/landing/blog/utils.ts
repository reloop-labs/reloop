import type { BlogPostDefinition } from "../types";

export function formatBlogDate(date: string) {
	return new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export function formatBlogDateUpper(date: string) {
	const d = new Date(date);
	const month = d.toLocaleDateString("en-US", { month: "long" }).toUpperCase();
	const day = d.getDate();
	const year = d.getFullYear();
	return `${month} ${day}, ${year}`;
}

export function formatReadTimeUpper(readTime?: string) {
	if (!readTime) return "5 MINUTES READ";
	const cleaned = readTime
		.toUpperCase()
		.replace(/\bMINS\b/g, "MINUTES")
		.replace(/\bMIN\b/g, "MINUTES");
	if (cleaned.includes("MINUTES") && !cleaned.includes("READ")) {
		return `${cleaned} READ`;
	}
	return cleaned;
}

export function sortBlogPosts(posts: BlogPostDefinition[]) {
	return [...posts].sort(
		(a, b) =>
			new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
	);
}

export function filterBlogPosts(
	posts: BlogPostDefinition[],
	{
		query,
	}: {
		query: string;
	},
) {
	const normalizedQuery = query.trim().toLowerCase();

	return sortBlogPosts(posts).filter((post) => {
		if (normalizedQuery.length === 0) {
			return true;
		}

		const haystack = [post.title, post.description, post.category, ...post.tags]
			.join(" ")
			.toLowerCase();

		return haystack.includes(normalizedQuery);
	});
}

export function slugifyCategory(category: string): string {
	return category
		.toLowerCase()
		.replace(/&/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export function getCategoryPath(category: string): string {
	return `/blog/category/${slugifyCategory(category)}`;
}
