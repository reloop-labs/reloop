import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import { getSiteUrl, hostedSignupHref } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { PricingFaq } from "./components/pricing-faq";
import { PricingSection } from "./components/pricing-section";

const siteUrl = getSiteUrl();
const pricingPageUrl = `${siteUrl}/pricing`;

export const metadata: Metadata = {
	title: "Pricing | Reloop",
	description:
		"Simple, transparent email pricing. Start free with 3,000 emails per month. Upgrade to Essentials or Enterprise—hosted or self-hosted.",
	openGraph: {
		title: "Pricing | Reloop",
		description:
			"Simple, transparent email pricing. Start free with 3,000 emails per month.",
		type: "website",
		url: pricingPageUrl,
		siteName: "Reloop",
	},
	alternates: {
		canonical: pricingPageUrl,
	},
};

const PricingPage = () => {
	return (
		<MarketingPageShell
			titleLines={["Simple, transparent", "pricing."]}
			compactHero
		>
			<PageSection flushTop>
				<PricingSection />
			</PageSection>
			<FeatureCta
				title="3,000 emails for free"
				titleMuted="per month."
				description="No credit card required. Join developers building the future of email on Reloop—hosted or self-hosted."
				primary={{ label: "Get started", href: hostedSignupHref }}
				secondary={{
					label: "Talk to us",
					href: "/company/contact-us",
				}}
				compact
			/>

			<PricingFaq />
		</MarketingPageShell>
	);
};

export default PricingPage;
