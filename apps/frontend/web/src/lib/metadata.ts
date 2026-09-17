import type { Metadata } from "next";
import { socialImage } from "./site";

type PageMetadataInput = {
	title: string;
	description: string;
	path: string;
	keywords?: readonly string[];
	ogImage?: string | false;
};

export function createPageMetadata({
	title,
	description,
	path,
	keywords,
	ogImage,
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
			url: ogImage ?? socialImage.url,
			width: 1200,
			height: 630,
			alt: `${title} | Reloop`,
		};
		metadata.openGraph = { ...metadata.openGraph, images: [image] };
		metadata.twitter = { ...metadata.twitter, images: [image.url] };
	}

	return metadata;
}
