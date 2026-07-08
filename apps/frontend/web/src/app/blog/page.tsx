import { FeatureCta } from "@reloop/web/components/page-shell";
import { BlogIndex } from "@reloop/web/components/landing/blog/blog-index";
import { blogPosts } from "@reloop/web/lib/landing/blog";
import { getSiteUrl, socialProfiles } from "@reloop/web/lib/site";
import type { Metadata } from "next";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
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
		description:
			"Guides, tutorials, and engineering notes from Reloop Labs.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Blog | Reloop",
		description:
			"Guides, tutorials, and engineering notes from Reloop Labs.",
	},
};

const BlogPage = () => {
	return (
		<>
			<BlogIndex posts={blogPosts} />
			<FeatureCta
				title="Stay in the loop"
				titleMuted="Star us on GitHub."
				description="Watch the repository for release notifications and follow along as we ship."
				primary={{
					label: "Star on GitHub",
					href: socialProfiles.github,
					external: true,
				}}
				secondary={{
					label: "Join Discord",
					href: socialProfiles.discord,
					external: true,
				}}
				compact
			/>
		</>
	);
};

export default BlogPage;
