import { BlogIndex } from "@reloop/web/components/landing/blog/blog-index";
import { FeatureCta } from "@reloop/web/components/page-shell";
import {
	getCategories,
	getPublishedPosts,
} from "@reloop/web/lib/landing/blog/source";
import { getSiteUrl, hostedSignupHref } from "@reloop/web/lib/site";
import type { Metadata } from "next";

export const instant = false;

const pageUrl = `${getSiteUrl()}/blog`;

export const metadata: Metadata = {
	title: "Blog | Reloop",
	description:
		"Guides, tutorials, and engineering notes from Reloop Labs on email infrastructure, deliverability, and self-hosting.",
	keywords: [
		"Reloop blog",
		"email infrastructure guides",
		"email deliverability tutorials",
		"transactional email best practices",
		"open source email blog",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Blog | Reloop",
		description: "Guides, tutorials, and engineering notes from Reloop Labs.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Blog | Reloop",
		description: "Guides, tutorials, and engineering notes from Reloop Labs.",
	},
};

const BlogPage = () => {
	return (
		<BlogIndex posts={getPublishedPosts()} categories={getCategories()}>
			<FeatureCta
				title="Email infrastructure"
				titleMuted="For Developers"
				primary={{
					label: "Start for free",
					href: hostedSignupHref,
				}}
				compact
			/>
		</BlogIndex>
	);
};

export default BlogPage;
