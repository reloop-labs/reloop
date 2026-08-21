import { JsonLd } from "@reloop/web/components/json-ld";
import {
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import { pricingFaqItems } from "@reloop/web/lib/pricing-faq";
import { faqPageJsonLd, pricingProductJsonLd } from "@reloop/web/lib/schema";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { PricingFaq } from "./components/pricing-faq";
import { PricingSection } from "./components/pricing-section";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const siteUrl = getSiteUrl();
const pricingPageUrl = `${siteUrl}/pricing`;
const pricingDescription =
	"Scale your email, control your costs. Start free with 3,000 emails per month (200/day). Upgrade to Individual $10, Startup $20, or Enterprise—or self-host with no Reloop license fee.";

export const metadata: Metadata = {
	title: "Pricing | Reloop",
	description: pricingDescription,
	keywords: [
		"email pricing",
		"email API pricing",
		"free email API",
		"email service pricing",
		"affordable email platform",
		"open source email pricing",
		"self-hosted email cost",
	],
	openGraph: {
		title: "Pricing | Reloop",
		description: pricingDescription,
		type: "website",
		url: pricingPageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Pricing | Reloop",
		description: pricingDescription,
	},
	alternates: {
		canonical: pricingPageUrl,
	},
};

const pricingSchema = [
	pricingProductJsonLd(siteUrl),
	faqPageJsonLd(pricingFaqItems),
];

const PricingPage = () => {
	return (
		<>
			<JsonLd data={pricingSchema} />
			<div className="mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-200 border-x pt-6 pb-16 md:max-w-7xl dark:border-white/10">
				<MarketingPageShell
					titleLines={["Simple, transparent pricing."]}
					description="No hidden fees. No surprises. Just pricing that makes sense."
					compactHero
					tightHeroBottom
				>
					<PageSection flushTop>
						<PricingSection />
					</PageSection>

					<PricingFaq />
				</MarketingPageShell>
			</div>
		</>
	);
};

export default PricingPage;
