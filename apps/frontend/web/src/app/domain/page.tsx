import { JsonLd } from "@reloop/web/components/json-ld";
import { getSiteUrl, siteName } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import CTA from "../(home)/components/cta";
import { SectionSeparator } from "../(home)/components/section-separator";
import DomainHero from "./components/domain-hero";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const siteUrl = getSiteUrl();
const pageUrl = `${siteUrl}/domain`;

export const metadata: Metadata = {
	title: "Domain Authentication | SPF, DKIM & DMARC",
	description:
		"Add a sending domain and verify SPF, DKIM, and DMARC so every Reloop email authenticates and lands in the inbox.",
	keywords: [
		"domain authentication",
		"SPF",
		"DKIM",
		"DMARC",
		"email domain verification",
		"custom sending domain",
		"email authentication",
		"inbox placement",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Domain Authentication | Reloop",
		description:
			"Add a sending domain and verify SPF, DKIM, and DMARC so every email authenticates.",
		type: "website",
		url: pageUrl,
		siteName,
	},
	twitter: {
		card: "summary_large_image",
		title: "Domain Authentication | Reloop",
		description:
			"Add a sending domain and verify SPF, DKIM, and DMARC so every email authenticates.",
	},
};

const pageSchema = {
	"@context": "https://schema.org" as const,
	"@type": "WebPage" as const,
	name: "Domain Authentication",
	url: pageUrl,
	description:
		"Add a sending domain and verify SPF, DKIM, and DMARC so every Reloop email authenticates and lands in the inbox.",
};

export default function DomainPage() {
	return (
		<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
			<JsonLd data={pageSchema} />
			<DomainHero />
			<SectionSeparator />
			<CTA />
		</div>
	);
}
