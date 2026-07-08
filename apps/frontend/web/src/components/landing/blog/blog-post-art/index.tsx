import { BlogArtCanvas } from "./canvas";
import { FallbackWireframeArt } from "./fallback-art";
import { getBlogPostArt } from "./registry";
import type { BlogArtVariant } from "./types";

export function BlogPostArt({
	slug,
	variant,
}: {
	slug: string;
	variant: BlogArtVariant;
}) {
	const Art = getBlogPostArt(slug);

	return (
		<BlogArtCanvas variant={variant}>
			{Art ? <Art variant={variant} /> : <FallbackWireframeArt slug={slug} />}
		</BlogArtCanvas>
	);
}
