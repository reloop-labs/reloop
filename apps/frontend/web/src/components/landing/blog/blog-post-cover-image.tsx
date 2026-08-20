import { BlogPostHeroArt } from "@reloop/web/components/landing/blog/blog-post-hero-art";
import { BlogPostThumbnail } from "@reloop/web/components/landing/blog/blog-post-thumbnail";
import Image from "next/image";

export function BlogPostCoverImage({
	slug,
	image,
	alt,
	priority = false,
	variant = "card",
}: {
	slug: string;
	image?: string;
	alt: string;
	priority?: boolean;
	variant?: "card" | "hero";
}) {
	if (image) {
		if (variant === "hero") {
			return (
				<div className="relative mx-auto aspect-[2/1] w-full max-w-[720px] overflow-hidden">
					<Image
						src={image}
						alt={alt}
						fill
						className="object-cover"
						sizes="(max-width: 720px) 100vw, 720px"
						priority={priority}
					/>
				</div>
			);
		}

		return (
			<div className="relative aspect-[16/10] overflow-hidden rounded-xl">
				<Image
					src={image}
					alt={alt}
					fill
					className="object-cover"
					sizes="(max-width: 680px) 100vw, 680px"
					priority={priority}
				/>
			</div>
		);
	}

	if (variant === "hero") {
		return <BlogPostHeroArt slug={slug} />;
	}

	return <BlogPostThumbnail slug={slug} />;
}
