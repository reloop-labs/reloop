import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";

const pagePath = "/features/transaction-emails";
const pageUrl = `${getSiteUrl()}${pagePath}`;

export const metadata: Metadata = {
	title: "Transactional Email API | Reloop",
	description:
		"Low-latency transactional email delivery for developers. Send password resets, order confirmations, and welcome emails with a simple API. Open source and self-hostable.",
	keywords: [
		"transactional email API",
		"transactional email service",
		"password reset email",
		"order confirmation email",
		"welcome email API",
		"open source transactional email",
		"email delivery API",
		"sendgrid alternative",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Transactional Email API | Reloop",
		description:
			"Low-latency transactional email delivery for developers. Password resets, receipts, and welcome emails with a simple API.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Transactional Email API | Reloop",
		description:
			"Low-latency transactional email delivery for developers. Password resets, receipts, and welcome emails with a simple API.",
	},
};

export default function TransactionEmailsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
