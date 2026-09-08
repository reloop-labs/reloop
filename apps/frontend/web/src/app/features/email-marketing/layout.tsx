import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";

const pagePath = "/features/email-marketing";
const pageUrl = `${getSiteUrl()}${pagePath}`;

export const metadata: Metadata = {
	title: "Marketing Email & Campaigns | Reloop",
	description:
		"Send newsletters, launches, and automated drip campaigns with Reloop. Broadcasts, segmentation, scheduling, and analytics — open source and self-hostable.",
	keywords: [
		"marketing email",
		"email campaigns",
		"newsletter API",
		"email broadcasts",
		"drip campaigns",
		"email segmentation",
		"open source email marketing",
		"mailchimp alternative",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Marketing Email & Campaigns | Reloop",
		description:
			"Newsletters, launches, and automated drips with broadcasts, segments, and analytics.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Marketing Email & Campaigns | Reloop",
		description:
			"Newsletters, launches, and automated drips with broadcasts, segments, and analytics.",
	},
};

export default function EmailMarketingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
