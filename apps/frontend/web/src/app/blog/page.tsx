import { JsonLd } from "@reloop/web/components/json-ld";
import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { BlogIndex } from "@reloop/web/components/landing/blog/blog-index";
import { withBlurPlaceholders } from "@reloop/web/lib/landing/blog/blur";
import {
	buildBlogIndexJsonLd,
	createBlogIndexMetadata,
} from "@reloop/web/lib/landing/blog/seo";
import {
	getCategories,
	getPublishedPosts,
} from "@reloop/web/lib/landing/blog/source";

export const instant = false;

export const metadata = createBlogIndexMetadata();

const BlogPage = async () => {
	const posts = await withBlurPlaceholders(getPublishedPosts());

	return (
		<>
			<JsonLd data={buildBlogIndexJsonLd(posts)} />
			<BlogIndex posts={posts} categories={getCategories()}>
				<BlogCta />
			</BlogIndex>
		</>
	);
};

export default BlogPage;
