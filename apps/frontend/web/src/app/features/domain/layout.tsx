import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";

const pagePath = "/features/domain";
const pageUrl = `${getSiteUrl()}${pagePath}`;

export const metadata: Metadata = {
	title: "Custom Domain & DNS Authentication | Reloop",
	description:
		"Automated SPF, DKIM, and DMARC verification for custom sending domains. Verify DNS records, secure email deliverability, and eliminate spam flags with zero configuration.",
	keywords: [
		"domain authentication",
		"email domain verification",
		"SPF record",
		"DKIM key generation",
		"DMARC policy enforcement",
		"custom sending domain",
		"email deliverability",
		"DNS verification API",
		"BIMI record",
		"custom return path",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Custom Domain & DNS Authentication | Reloop",
		description:
			"Automated SPF, DKIM, and DMARC verification for custom sending domains. Verify DNS records and ensure flawless inbox delivery.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Custom Domain & DNS Authentication | Reloop",
		description:
			"Automated SPF, DKIM, and DMARC verification for custom sending domains. Verify DNS records and ensure flawless inbox delivery.",
	},
};

export default function DomainLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
