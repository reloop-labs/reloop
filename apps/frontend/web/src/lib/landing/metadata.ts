import { getSiteUrl, socialImage } from "@reloop/web/lib/site";
import type { Metadata } from "next";

export function createLandingMetadata(
	title: string,
	description: string,
	path: string,
	keywords?: string[],
	ogDescription?: string,
): Metadata {
	const fullTitle = `${title} | Reloop`;
	const canonicalUrl = `${getSiteUrl()}${path}`;

	return {
		title,
		description,
		keywords,
		alternates: { canonical: canonicalUrl },
		openGraph: {
			title: fullTitle,
			description: ogDescription ?? description,
			type: "website",
			url: canonicalUrl,
			siteName: "Reloop",
			images: [socialImage],
		},
		twitter: {
			card: "summary_large_image",
			title: fullTitle,
			description: ogDescription ?? description,
			images: [socialImage.url],
		},
	};
}
