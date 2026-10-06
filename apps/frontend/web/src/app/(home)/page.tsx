import { LandingPageView } from "@reloop/web/components/landing/landing-page-view";
import { getSiteUrl, siteDescription, siteName } from "@reloop/web/lib/site";
import type { Metadata } from "next";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
	title: {
		absolute: "Reloop: Open-Source Email API & Infrastructure for Developers",
	},
	description: siteDescription,
	alternates: { canonical: siteUrl },
	openGraph: {
		title: "Reloop: Open-Source Email API & Infrastructure for Developers",
		description: siteDescription,
		url: siteUrl,
		type: "website",
		siteName,
	},
};

export default function Home() {
	return <LandingPageView />;
}
