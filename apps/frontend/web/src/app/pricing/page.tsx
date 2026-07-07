import { JsonLd } from "@reloop/web/components/json-ld";
import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import { getSiteUrl, hostedSignupHref } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { PricingFaq } from "./components/pricing-faq";
import { PricingSection } from "./components/pricing-section";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const siteUrl = getSiteUrl();
const pricingPageUrl = `${siteUrl}/pricing`;

export const metadata: Metadata = {
	title: "Pricing | Reloop",
	description:
		"Scale your Email, control your costs. Start free with 3,000 emails per month. Upgrade to Individual, Startup, or Enterprise—hosted or self-hosted.",
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
		description:
			"Scale your Email, control your costs. Start free with 3,000 emails per month.",
		type: "website",
		url: pricingPageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Pricing | Reloop",
		description:
			"Scale your Email, control your costs. Start free with 3,000 emails per month.",
	},
	alternates: {
		canonical: pricingPageUrl,
	},
};

const pricingSchema = [
	{
		"@context": "https://schema.org" as const,
		"@type": "Product" as const,
		name: "Reloop Subscription",
		description:
			"Simple, transparent email pricing. Start free with 3,000 emails per month. Upgrade to Essentials or Enterprise—hosted or self-hosted.",
		offers: [
			{
				"@type": "Offer" as const,
				name: "Free Plan",
				price: "0",
				priceCurrency: "USD",
				priceSpecification: {
					"@type": "UnitPriceSpecification" as const,
					price: "0",
					priceCurrency: "USD",
					unitText: "MONTH",
				},
			},
			{
				"@type": "Offer" as const,
				name: "Essentials Plan",
				price: "9",
				priceCurrency: "USD",
				priceSpecification: {
					"@type": "UnitPriceSpecification" as const,
					price: "9",
					priceCurrency: "USD",
					unitText: "MONTH",
				},
			},
		],
	},
	{
		"@context": "https://schema.org" as const,
		"@type": "FAQPage" as const,
		mainEntity: [
			{
				"@type": "Question" as const,
				name: "What counts as an email?",
				acceptedAnswer: {
					"@type": "Answer" as const,
					text: "Each successfully sent email counts toward your monthly quota—transactional messages, campaign sends, and SMTP relay deliveries all use credits the same way.",
				},
			},
			{
				"@type": "Question" as const,
				name: "Do I need a credit card to start?",
				acceptedAnswer: {
					"@type": "Answer" as const,
					text: "No. The Free plan includes 3,000 emails per month with no credit card required. Upgrade when your volume grows.",
				},
			},
			{
				"@type": "Question" as const,
				name: "What happens if I exceed my monthly limit?",
				acceptedAnswer: {
					"@type": "Answer" as const,
					text: "On paid plans, overage emails are billed at the per-thousand rate listed for your tier. On the Free plan, sending pauses until the next billing period unless you upgrade.",
				},
			},
			{
				"@type": "Question" as const,
				name: "Is self-hosting really free?",
				acceptedAnswer: {
					"@type": "Answer" as const,
					text: "Yes. Reloop is open source under Apache 2.0 with Reloop Labs use restrictions. You can deploy on your own infrastructure at no license cost—you pay only for your servers and email delivery infrastructure.",
				},
			},
			{
				"@type": "Question" as const,
				name: "Is hosted pricing different from self-hosted?",
				acceptedAnswer: {
					"@type": "Answer" as const,
					text: "We believe in pricing parity: the same transparent tiers apply whether Reloop hosts your stack or you run it yourself. No hidden platform fees for choosing one deployment path over the other.",
				},
			},
			{
				"@type": "Question" as const,
				name: "Can I switch plans at any time?",
				acceptedAnswer: {
					"@type": "Answer" as const,
					text: "Yes. Upgrade or downgrade from your dashboard. Plan changes apply to the current billing period according to your subscription settings.",
				},
			},
		],
	},
];

const PricingPage = () => {
	return (
		<>
			<JsonLd data={pricingSchema} />
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
						href: "/contact",
					}}
					compact
				/>

				<PricingFaq />
			</MarketingPageShell>
		</>
	);
};

export default PricingPage;
