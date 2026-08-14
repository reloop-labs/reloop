import { JsonLd } from "@reloop/web/components/json-ld";
import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { BlogIndex } from "@reloop/web/components/landing/blog/blog-index";
import {
	blogIndexDescription,
	buildBlogIndexJsonLd,
	createBlogIndexMetadata,
} from "@reloop/web/lib/landing/blog/seo";
import {
	getCategories,
	getPublishedPosts,
} from "@reloop/web/lib/landing/blog/source";

export const instant = false;

export const metadata = createBlogIndexMetadata();

const BlogPage = () => {
	const posts = getPublishedPosts();

	return (
		<>
			<JsonLd data={buildBlogIndexJsonLd(posts)} />
			<BlogIndex
				posts={posts}
				categories={getCategories()}
				description={blogIndexDescription}
			>
				<BlogCta />
			</BlogIndex>
		</>
	);
};

export default BlogPage;
