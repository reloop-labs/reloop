import { LandingPageView } from "@reloop/web/components/landing/landing-page-view";
import { siteDescription, siteName } from "@reloop/web/lib/site";
import type { Metadata } from "next";

// Non-indexable replica of the landing page
export const metadata: Metadata = {
	title: siteName,
	description: siteDescription,
	robots: {
		index: false,
		follow: false,
		nocache: true,
		googleBot: {
			index: false,
			follow: false,
			noimageindex: true,
			"max-video-preview": -1,
			"max-image-preview": "none",
			"max-snippet": -1,
		},
	},
};

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function HomePage() {
	return <LandingPageView />;
}
