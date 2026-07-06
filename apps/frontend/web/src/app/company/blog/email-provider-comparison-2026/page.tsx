import { BlogPostPage } from "@reloop/web/components/landing/content-pages";
import { defaultLandingCta } from "@reloop/web/lib/landing/constants";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { post } from "@reloop/web/lib/landing/blog/email-provider-comparison-2026";

export const instant = false;

export const metadata = createLandingMetadata(
	post.title,
	post.description,
	`/company/blog/${post.slug}`,
	post.keywords,
);

export default function EmailProviderComparison2026BlogPage() {
	return (
		<BlogPostPage
			post={post}
			cta={defaultLandingCta(
				"Ready to try Reloop?",
				"Open-source email infrastructure with a free hosted tier.",
			)}
		/>
	);
}
