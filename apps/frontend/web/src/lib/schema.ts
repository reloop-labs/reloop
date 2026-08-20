import { pricingPlans, type PricingPlan } from "@reloop/pricing";
import { getSiteUrl, siteDescription, siteName } from "@reloop/web/lib/site";

export type FaqEntry = {
	question: string;
	answer: string;
};

export function faqPageJsonLd(items: FaqEntry[]) {
	return {
		"@context": "https://schema.org" as const,
		"@type": "FAQPage" as const,
		mainEntity: items.map((item) => ({
			"@type": "Question" as const,
			name: item.question,
			acceptedAnswer: {
				"@type": "Answer" as const,
				text: item.answer,
			},
		})),
	};
}

function planDescription(plan: PricingPlan): string {
	const daily =
		plan.comparison.dailyLimit === "No limit"
			? "no daily send cap"
			: `${plan.comparison.dailyLimit} emails per day`;
	const extra = plan.extraEmailsLabel ? ` ${plan.extraEmailsLabel}.` : "";
	return `${plan.description} ${plan.emailsLabel}, ${daily}.${extra}`;
}

export function pricingOfferJsonLd(plan: PricingPlan, siteUrl: string) {
	const pricingUrl = `${siteUrl}/pricing`;
	const ctaUrl = plan.ctaHref.startsWith("http")
		? plan.ctaHref
		: `${siteUrl}${plan.ctaHref}`;

	if (plan.monthlyPrice === null) {
		return {
			"@type": "Offer" as const,
			name: `${plan.name} plan`,
			description: planDescription(plan),
			url: ctaUrl,
			availability: "https://schema.org/InStock" as const,
			priceCurrency: "USD",
		};
	}

	return {
		"@type": "Offer" as const,
		name: `${plan.name} plan`,
		description: planDescription(plan),
		url: pricingUrl,
		availability: "https://schema.org/InStock" as const,
		price: String(plan.monthlyPrice),
		priceCurrency: "USD",
		priceSpecification: {
			"@type": "UnitPriceSpecification" as const,
			price: String(plan.monthlyPrice),
			priceCurrency: "USD",
			unitText: "MONTH",
		},
	};
}

export function pricingOffersJsonLd(siteUrl = getSiteUrl()) {
	return pricingPlans.map((plan) => pricingOfferJsonLd(plan, siteUrl));
}

const PRODUCT_DESCRIPTION =
	"Open-source email infrastructure (Apache 2.0). Hosted Reloop Cloud plans: Free (3,000 emails/month, 200/day), Individual $10/month (25,000 emails, no daily cap), Startup $20/month (50,000 emails, no daily cap), Enterprise custom. Self-host has no Reloop license fee.";

/** Product + Offer JSON-LD driven by `@reloop/pricing`. No reviews or invented plans. */
export function pricingProductJsonLd(siteUrl = getSiteUrl()) {
	return {
		"@context": "https://schema.org" as const,
		"@type": "Product" as const,
		name: "Reloop",
		image: `${siteUrl}/web-app-manifest-512x512.png`,
		description: PRODUCT_DESCRIPTION,
		brand: {
			"@type": "Brand" as const,
			name: "Reloop Labs",
		},
		license: `${siteUrl}/license`,
		offers: pricingOffersJsonLd(siteUrl),
	};
}

export function pricingSoftwareApplicationJsonLd(siteUrl = getSiteUrl()) {
	return {
		"@context": "https://schema.org" as const,
		"@type": "SoftwareApplication" as const,
		name: siteName,
		operatingSystem: "All",
		applicationCategory: "DeveloperApplication",
		description: siteDescription,
		license: `${siteUrl}/license`,
		offers: pricingOffersJsonLd(siteUrl),
	};
}
