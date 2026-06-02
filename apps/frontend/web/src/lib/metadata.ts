import type { Metadata } from "next";
import { defaultOgImage } from "./site";

type PageMetadataInput = {
	title: string;
	description: string;
	path: string;
	keywords?: readonly string[];
	ogImage?: string;
};

export function createPageMetadata({
	title,
	description,
	path,
	keywords,
	ogImage = defaultOgImage,
}: PageMetadataInput): Metadata {
	const image = {
		url: ogImage,
		width: 512,
		height: 512,
		alt: `${title} | Reloop`,
	};

	return {
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
			images: [image],
		},
		twitter: {
			card: "summary_large_image",
			title: `${title} | Reloop`,
			description,
			images: [ogImage],
		},
	};
}
