import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";

const pagePath = "/contact";
const pageUrl = `${getSiteUrl()}${pagePath}`;

export const metadata: Metadata = {
	title: "Contact | Reloop",
	description:
		"Get in touch with the Reloop team. Ask about cloud and enterprise plans, request a live demo, or get help with deployment and migration.",
	keywords: [
		"contact Reloop",
		"email platform support",
		"Reloop sales",
		"email infrastructure demo",
		"enterprise email plan",
		"Reloop Labs contact",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Contact | Reloop",
		description:
			"Get in touch with the Reloop team. Ask about plans, request a demo, or get deployment help.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Contact | Reloop",
		description:
			"Get in touch with the Reloop team. Ask about plans, request a demo, or get deployment help.",
	},
};

export default function ContactLayout({
	children,
}: { children: React.ReactNode }) {
	return children;
}
