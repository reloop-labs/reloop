import type { BlogPostDefinition } from "../types";

export function formatBlogDate(date: string) {
	return new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
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

		const haystack = [
			post.title,
			post.description,
			post.category,
			...post.tags,
		]
			.join(" ")
			.toLowerCase();

		return haystack.includes(normalizedQuery);
	});
}
