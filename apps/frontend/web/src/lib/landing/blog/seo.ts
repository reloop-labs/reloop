import type { BlogPostDefinition } from "@reloop/web/lib/landing/types";
import { getSiteUrl, siteName } from "@reloop/web/lib/site";
import type { Metadata } from "next";

const DESC_MAX = 160;

const blogIndexDescription =
	"Guides, tutorials, and engineering notes from Reloop Labs on email infrastructure, deliverability, self-hosting, and transactional email.";

function siteUrl() {
	return getSiteUrl();
}

export function blogPostPath(slug: string) {
	return `/blog/${slug}`;
}

export function blogPostUrl(slug: string) {
	return `${siteUrl()}${blogPostPath(slug)}`;
}

export function blogCoverAbsoluteUrl(imagePath: string | undefined) {
	if (!imagePath) {
		return undefined;
	}

	if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
		return imagePath;
	}

	return `${siteUrl()}${imagePath.startsWith("/") ? imagePath : `/${imagePath}`}`;
}

function clampDescription(text: string) {
	const description = text.trim().replace(/\s+/g, " ");
	if (description.length <= DESC_MAX) {
		return description;
	}

	return `${description.slice(0, DESC_MAX - 1).trimEnd()}...`;
}

function readTimeToIsoDuration(readTime: string | undefined) {
	if (!readTime) {
		return undefined;
	}

	const minutes = readTime.match(/(\d+)\s*min/i)?.[1];
	if (!minutes) {
		return undefined;
	}

	return `PT${minutes}M`;
}

const articleRobots = {
	index: true,
	follow: true,
	googleBot: {
		index: true,
		follow: true,
		"max-image-preview": "large" as const,
		"max-snippet": -1,
		"max-video-preview": -1,
	},
};

export function createBlogPostMetadata(post: BlogPostDefinition): Metadata {
	const canonicalUrl = blogPostUrl(post.slug);
	const titleFull = `${post.title} | ${siteName}`;
	const description = clampDescription(post.description);
	const coverUrl = blogCoverAbsoluteUrl(post.image);

	return {
		title: post.title,
		description,
		keywords: post.keywords,
		alternates: { canonical: canonicalUrl },
		robots: articleRobots,
		openGraph: {
			title: titleFull,
			description,
			type: "article",
			url: canonicalUrl,
			siteName,
			locale: "en_US",
			publishedTime: post.publishedAt,
			authors: [post.author.name],
			tags: post.tags.length > 0 ? post.tags : undefined,
			...(coverUrl
				? {
						images: [
							{
								url: post.image as string,
								width: 1200,
								height: 630,
								alt: post.title,
							},
						],
					}
				: {}),
		},
		twitter: {
			card: "summary_large_image",
			title: titleFull,
			description,
			...(coverUrl ? { images: [post.image as string] } : {}),
		},
	};
}

export function createBlogIndexMetadata(): Metadata {
	const pageUrl = `${siteUrl()}/blog`;
	const title = "Blog";
	const titleFull = `${title} | ${siteName}`;

	return {
		title,
		description: blogIndexDescription,
		keywords: [
			"Reloop blog",
			"email infrastructure guides",
			"email deliverability tutorials",
			"transactional email best practices",
			"open source email blog",
		],
		alternates: { canonical: pageUrl },
		robots: articleRobots,
		openGraph: {
			title: titleFull,
			description: blogIndexDescription,
			type: "website",
			url: pageUrl,
			siteName,
			locale: "en_US",
		},
		twitter: {
			card: "summary_large_image",
			title: titleFull,
			description: blogIndexDescription,
		},
	};
}

export function createBlogCategoryMetadata(category: {
	name: string;
	slug: string;
	description: string;
}): Metadata {
	const pageUrl = `${siteUrl()}/blog/category/${category.slug}`;
	const title = `${category.name} | Reloop Blog`;
	const description = clampDescription(category.description);

	return {
		title,
		description,
		alternates: { canonical: pageUrl },
		robots: articleRobots,
		openGraph: {
			title,
			description,
			type: "website",
			url: pageUrl,
			siteName,
			locale: "en_US",
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
		},
	};
}

export function buildBlogPostJsonLd(post: BlogPostDefinition) {
	const origin = siteUrl();
	const pageUrl = blogPostUrl(post.slug);
	const coverUrl = blogCoverAbsoluteUrl(post.image);
	const description = clampDescription(post.description);
	const timeRequired = readTimeToIsoDuration(post.readTime);

	return {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "BlogPosting",
				"@id": `${pageUrl}#article`,
				url: pageUrl,
				headline: post.title,
				description,
				datePublished: post.publishedAt,
				dateModified: post.publishedAt,
				inLanguage: "en-US",
				articleSection: post.category,
				keywords: post.tags.length > 0 ? post.tags : post.keywords,
				mainEntityOfPage: pageUrl,
				...(coverUrl ? { image: [coverUrl] } : {}),
				...(timeRequired ? { timeRequired } : {}),
				author: {
					"@type": "Person",
					name: post.author.name,
					jobTitle: post.author.role,
					...(post.author.avatar
						? { image: blogCoverAbsoluteUrl(post.author.avatar) }
						: {}),
				},
				publisher: {
					"@type": "Organization",
					"@id": `${origin}/#organization`,
					name: "Reloop Labs",
					url: origin,
				},
				isPartOf: {
					"@type": "Blog",
					"@id": `${origin}/blog#blog`,
					name: "Reloop Blog",
					url: `${origin}/blog`,
				},
			},
			{
				"@type": "BreadcrumbList",
				itemListElement: [
					{
						"@type": "ListItem",
						position: 1,
						name: "Home",
						item: origin,
					},
					{
						"@type": "ListItem",
						position: 2,
						name: "Blog",
						item: `${origin}/blog`,
					},
					{
						"@type": "ListItem",
						position: 3,
						name: post.title,
						item: pageUrl,
					},
				],
			},
		],
	};
}

export function buildBlogIndexJsonLd(posts: BlogPostDefinition[]) {
	const origin = siteUrl();
	const pageUrl = `${origin}/blog`;

	return {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "Blog",
				"@id": `${pageUrl}#blog`,
				url: pageUrl,
				name: "Reloop Blog",
				description: blogIndexDescription,
				inLanguage: "en-US",
				isPartOf: {
					"@type": "WebSite",
					"@id": `${origin}/#website`,
					name: siteName,
					url: origin,
				},
				publisher: {
					"@type": "Organization",
					"@id": `${origin}/#organization`,
					name: "Reloop Labs",
					url: origin,
				},
				blogPost: posts.map((post) => ({
					"@type": "BlogPosting",
					"@id": `${blogPostUrl(post.slug)}#article`,
					url: blogPostUrl(post.slug),
					headline: post.title,
					description: clampDescription(post.description),
					datePublished: post.publishedAt,
					...(post.image
						? { image: [blogCoverAbsoluteUrl(post.image)] }
						: {}),
				})),
			},
			{
				"@type": "BreadcrumbList",
				itemListElement: [
					{
						"@type": "ListItem",
						position: 1,
						name: "Home",
						item: origin,
					},
					{
						"@type": "ListItem",
						position: 2,
						name: "Blog",
						item: pageUrl,
					},
				],
			},
		],
	};
}

export { blogIndexDescription };
