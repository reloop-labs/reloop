import { BlogPostPageView } from "@reloop/web/components/landing/blog/blog-post-page-view";
import { post } from "@reloop/web/lib/landing/blog/transactional-email-best-practices";
import { defaultLandingCta } from "@reloop/web/lib/landing/constants";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";

export const instant = false;

export const metadata = createLandingMetadata(
	post.title,
	post.description,
	`/company/blog/${post.slug}`,
	post.keywords,
);

export default function TransactionalEmailBestPracticesBlogPage() {
	return (
		<BlogPostPageView
			post={post}
			cta={defaultLandingCta(
				"Ready to try Reloop?",
				"Open-source email infrastructure with a free hosted tier.",
			)}
		/>
	);
}
