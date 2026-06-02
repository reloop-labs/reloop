import type { Metadata } from "next";
import { defaultOgImage } from "./site";

type PageMetadataInput = {
	title: string;
	description: string;
	path: string;
	keywords?: readonly string[];
	/** Set to false when the route provides opengraph-image.tsx */
	ogImage?: string | false;
};

export function createPageMetadata({
	title,
	description,
	path,
	keywords,
	ogImage = defaultOgImage,
}: PageMetadataInput): Metadata {
	const metadata: Metadata = {
		title,
		description,
		keywords: keywords ? [...keywords] : undefined,
		alternates: {
			canonical: path,
		},
		openGraph: {
			title: `${title} | Reloop`,
			description,
			type: "website",
			url: path,
		},
		twitter: {
			card: "summary_large_image",
			title: `${title} | Reloop`,
			description,
		},
	};

	if (ogImage !== false) {
		const image = {
			url: ogImage,
			width: ogImage === defaultOgImage ? 512 : 1200,
			height: ogImage === defaultOgImage ? 512 : 630,
			alt: `${title} | Reloop`,
		};
		metadata.openGraph = { ...metadata.openGraph, images: [image] };
		metadata.twitter = { ...metadata.twitter, images: [ogImage] };
	}

	return metadata;
}
