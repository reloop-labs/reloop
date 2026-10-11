import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";

const pagePath = "/features/transaction-emails";
const pageUrl = `${getSiteUrl()}${pagePath}`;

export const metadata: Metadata = {
	title: "Transactional Email API",
	description:
		"Transactional email that actually arrives. Delivery logs, webhooks, idempotent retries, automatic bounce suppression, and guided SPF/DKIM/DMARC. 3,000 emails a month free. Open source.",
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
			"Transactional email that actually arrives. See every delivery, retry safely, and switch from SendGrid in one config change.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Transactional Email API | Reloop",
		description:
			"Transactional email that actually arrives. See every delivery, retry safely, and switch from SendGrid in one config change.",
	},
};

export default function TransactionEmailsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
