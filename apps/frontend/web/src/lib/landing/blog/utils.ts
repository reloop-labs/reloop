import type { BlogPostDefinition } from "../types";

export function formatBlogDate(date: string) {
	return new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export function getBlogCategories(posts: BlogPostDefinition[]) {
	const tags = [...new Set(posts.map((post) => post.tag))].sort();
	return ["All", ...tags];
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
		category,
		query,
	}: {
		category: string;
		query: string;
	},
) {
	const normalizedQuery = query.trim().toLowerCase();

	return sortBlogPosts(posts).filter((post) => {
		const matchesCategory = category === "All" || post.tag === category;
		const matchesQuery =
			normalizedQuery.length === 0 ||
			post.title.toLowerCase().includes(normalizedQuery) ||
			post.description.toLowerCase().includes(normalizedQuery) ||
			post.tag.toLowerCase().includes(normalizedQuery);

		return matchesCategory && matchesQuery;
	});
}
