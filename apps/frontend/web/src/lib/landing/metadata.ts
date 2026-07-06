import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";

export function createLandingMetadata(
	title: string,
	description: string,
	path: string,
	keywords?: string[],
): Metadata {
	const fullTitle = `${title} | Reloop`;
	const canonicalUrl = `${getSiteUrl()}${path}`;

	return {
		title: fullTitle,
		description,
		keywords,
		alternates: { canonical: canonicalUrl },
		openGraph: {
			title: fullTitle,
			description,
			type: "website",
			url: canonicalUrl,
			siteName: "Reloop",
		},
		twitter: {
			card: "summary_large_image",
			title: fullTitle,
			description,
		},
	};
}
