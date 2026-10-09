import { JsonLd } from "@reloop/web/components/json-ld";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { StartupApplySection } from "./components/startup-apply-section";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const siteUrl = getSiteUrl();
const pageUrl = `${siteUrl}/startups`;
const pageTitle = "Reloop for Startups — $1,000 in Email Credits";
const pageDescription =
	"Early-stage startups get $1,000 in Reloop Cloud credits for 12 months. Transactional + campaign email, no signup needed to apply, decision in 2 business days.";

export const metadata: Metadata = {
	title: pageTitle,
	description: pageDescription,
	keywords: [
		"startup email credits",
		"startup program",
		"free email API startup",
		"transactional email startup",
		"YC email credits",
		"open source email startup",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: `${pageTitle} | Reloop`,
		description: pageDescription,
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: `${pageTitle} | Reloop`,
		description: pageDescription,
	},
};

const StartupsPage = () => {
	const schema = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: pageTitle,
		description: pageDescription,
		url: pageUrl,
		mainEntity: {
			"@type": "Offer",
			name: "Reloop Startup Program",
			description: pageDescription,
			price: "0",
			priceCurrency: "USD",
		},
	};

	return (
		<>
			<JsonLd data={schema} />
			<div className="mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<div aria-hidden className="h-[72px] max-[1279px]:h-14" />
				<StartupApplySection />
			</div>
		</>
	);
};

export default StartupsPage;
