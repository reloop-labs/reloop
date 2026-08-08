import "server-only";

import fs from "node:fs";
import path from "node:path";
import { getMDXComponents } from "@reloop/web/mdx-components";
import matter from "gray-matter";
import type { MDXComponents } from "mdx/types";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type {
	BlogCategoryDefinition,
	BlogPostAuthor,
	BlogPostDefinition,
	BlogTocItem,
} from "../types";
import { timestamp } from "./watcher-trigger";

if (process.env.NODE_ENV === "development") {
	void timestamp;
}

export type BlogPostPage = BlogPostDefinition & {
	body: (props?: { components?: MDXComponents }) => React.ReactNode;
	toc: BlogTocItem[];
};

function getBlogDir(): string {
	const paths = [
		path.join(process.cwd(), "content/blog"),
		path.join(process.cwd(), "apps/frontend/web/content/blog"),
	];

	for (const dir of paths) {
		if (fs.existsSync(dir)) {
			return dir;
		}
	}

	return paths[0]!;
}

const blogDir = getBlogDir();

if (process.env.NODE_ENV === "development") {
	setupDevWatcher();
}

function setupDevWatcher() {
	if (typeof window !== "undefined") {
		return;
	}

	const globalStore = globalThis as unknown as Record<string, boolean>;

	if (globalStore.__reloop_blog_watcher__) {
		return;
	}

	globalStore.__reloop_blog_watcher__ = true;

	const triggerFile = path.join(
		process.cwd(),
		"src/lib/landing/blog/watcher-trigger.ts",
	);

	let timeout: ReturnType<typeof setTimeout> | null = null;

	try {
		fs.watch(blogDir, { recursive: true }, (_eventType, filename) => {
			if (
				filename &&
				(filename.endsWith(".mdx") || filename.endsWith(".json"))
			) {
				if (timeout) clearTimeout(timeout);
				timeout = setTimeout(() => {
					try {
						fs.writeFileSync(
							triggerFile,
							`export const timestamp = ${Date.now()};\n`,
							"utf8",
						);
					} catch (error) {
						console.error("[Reloop Blog HMR] Failed to update trigger:", error);
					}
				}, 150);
			}
		});
	} catch (error) {
		console.error("[Reloop Blog HMR] Failed to initialize watcher:", error);
	}
}

function slugifyHeading(title: string) {
	return title
		.toLowerCase()
		.replace(/[^\w\- ]+/g, "")
		.replace(/\s+/g, "-");
}

function extractToc(content: string): BlogTocItem[] {
	const toc: BlogTocItem[] = [];
	const headingRegex = /^##\s+(.*)$/gm;

	for (const match of content.matchAll(headingRegex)) {
		if (!match[1]) continue;
		const title = match[1].trim();
		toc.push({
			title,
			url: `#${slugifyHeading(title)}`,
			depth: 2,
		});
	}

	return toc;
}

const DEFAULT_AUTHOR: BlogPostAuthor = {
	name: "Pranav Patel",
	role: "Co-founder",
	avatar: "/company/team/pranav-patel.jpg",
};

function parseAuthor(raw: unknown): BlogPostAuthor {
	if (!raw) return DEFAULT_AUTHOR;

	if (typeof raw === "string") {
		return {
			name: raw,
			role: "Engineering",
		};
	}

	if (typeof raw === "object" && raw !== null) {
		const obj = raw as Record<string, unknown>;
		return {
			name: (obj.name as string) || DEFAULT_AUTHOR.name,
			role: (obj.role as string) || DEFAULT_AUTHOR.role,
			avatar: (obj.avatar as string) || DEFAULT_AUTHOR.avatar,
		};
	}

	return DEFAULT_AUTHOR;
}

function parseFrontmatter(
	slug: string,
	data: Record<string, unknown>,
): BlogPostDefinition {
	const author = parseAuthor(data.author);

	return {
		slug,
		title: (data.title as string) || slug,
		description: (data.description as string) || "",
		keywords: (data.keywords as string[]) || [],
		publishedAt:
			(data.publishedAt as string) || new Date().toISOString().slice(0, 10),
		category: (data.category as string) || "Guides",
		tags: (data.tags as string[]) || [],
		readTime: (data.readTime as string) || "5 min read",
		author,
		image: (data.image as string) || undefined,
		draft: data.draft === true,
		relatedSlugs: (data.relatedSlugs as string[]) || [],
	};
}

function validateCategory(category: string) {
	if (process.env.NODE_ENV !== "development") return;

	const categories = getCategories();
	const known = categories.some((item) => item.name === category);

	if (!known) {
		console.warn(
			`[Reloop Blog] Category "${category}" is not in categories.json`,
		);
	}
}

function readPostFile(slug: string) {
	const filePath = path.join(blogDir, `${slug}.mdx`);

	if (!fs.existsSync(filePath)) {
		return null;
	}

	const fileContent = fs.readFileSync(filePath, "utf8");
	const { data, content } = matter(fileContent);
	const post = parseFrontmatter(slug, data);

	validateCategory(post.category);

	return {
		post,
		content,
		toc: extractToc(content),
		body: (props?: { components?: MDXComponents }) => (
			<MDXRemote
				source={content}
				components={getMDXComponents(props?.components)}
				options={{
					mdxOptions: {
						remarkPlugins: [remarkGfm],
					},
				}}
			/>
		),
	};
}

function listPostSlugs() {
	if (!fs.existsSync(blogDir)) {
		return [];
	}

	return fs
		.readdirSync(blogDir)
		.filter((file) => file.endsWith(".mdx"))
		.map((file) => file.replace(/\.mdx$/, ""));
}

export function getCategories(): BlogCategoryDefinition[] {
	const categoriesPath = path.join(blogDir, "categories.json");

	if (!fs.existsSync(categoriesPath)) {
		return [];
	}

	return JSON.parse(
		fs.readFileSync(categoriesPath, "utf8"),
	) as BlogCategoryDefinition[];
}

export function getCategoryBySlug(slug: string) {
	return getCategories().find((category) => category.slug === slug) ?? null;
}

export function getCategoryByName(name: string) {
	return getCategories().find((category) => category.name === name) ?? null;
}

export function getAllPosts(): BlogPostDefinition[] {
	return listPostSlugs()
		.map((slug) => readPostFile(slug)?.post)
		.filter((post): post is BlogPostDefinition => post !== undefined)
		.sort(
			(a, b) =>
				new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
		);
}

export function getPublishedPosts() {
	// In development, show drafts so they are previewable on the local server.
	// In production, only show published posts.
	if (process.env.NODE_ENV === "development") {
		return getAllPosts();
	}
	return getAllPosts().filter((post) => !post.draft);
}

export function isPostViewable(
	post: BlogPostDefinition | null | undefined,
): post is BlogPostDefinition {
	if (!post) {
		return false;
	}

	if (process.env.NODE_ENV === "development") {
		return true;
	}

	return !post.draft;
}

export function getPost(slug: string): BlogPostPage | null {
	const file = readPostFile(slug);

	if (!file) {
		return null;
	}

	return {
		...file.post,
		body: file.body,
		toc: file.toc,
	};
}

export function getPostsByCategory(categorySlug: string) {
	const category = getCategoryBySlug(categorySlug);

	if (!category) {
		return [];
	}

	return getPublishedPosts().filter((post) => post.category === category.name);
}

export function getRelatedPosts(slug: string, limit = 3): BlogPostDefinition[] {
	const current = getPost(slug);

	if (!current) {
		return [];
	}

	const published = getPublishedPosts().filter((post) => post.slug !== slug);
	const related: BlogPostDefinition[] = [];
	const seen = new Set<string>();

	const addPosts = (posts: BlogPostDefinition[]) => {
		for (const post of posts) {
			if (related.length >= limit) break;
			if (seen.has(post.slug)) continue;
			seen.add(post.slug);
			related.push(post);
		}
	};

	if (current.relatedSlugs?.length) {
		addPosts(
			current.relatedSlugs
				.map((relatedSlug) =>
					published.find((post) => post.slug === relatedSlug),
				)
				.filter((post): post is BlogPostDefinition => post !== undefined),
		);
	}

	if (related.length < limit) {
		addPosts(published.filter((post) => post.category === current.category));
	}

	if (related.length < limit && current.tags.length > 0) {
		addPosts(
			published.filter((post) =>
				post.tags.some((tag) => current.tags.includes(tag)),
			),
		);
	}

	if (related.length < limit) {
		addPosts(published);
	}

	return related.slice(0, limit);
}

export function generateStaticParams() {
	return getPublishedPosts().map((post) => ({ slug: post.slug }));
}

export function generateCategoryStaticParams() {
	return getCategories().map((category) => ({ slug: category.slug }));
}

export function getCategoryPath(slug: string) {
	return `/blog/category/${slug}`;
}
