import { FaqSection } from "@reloop/web/components/faq-section";
import { JsonLd } from "@reloop/web/components/json-ld";
import { createPageMetadata } from "@reloop/web/lib/metadata";
import { getSiteUrl } from "@reloop/web/lib/site";
import { ApiIntegration } from "./components/api-integration";
import { BimiCta } from "./components/bimi-cta";
import { BimiDnsRecords } from "./components/bimi-dns-records";
import { BimiHero } from "./components/bimi-hero";
import { HowItWorksSteps } from "./components/how-it-works-steps";
import { SimilarTools } from "./components/similar-tools";
import { WhatIsBimi } from "./components/what-is-bimi";
import { WhatItChecks } from "./components/what-it-checks";
import {
	faqGroups,
	faqs,
	metaDescription,
	metaTitle,
	toolKeywords,
	toolPath,
	toolTitle,
} from "./content";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = createPageMetadata({
	title: metaTitle,
	description: metaDescription,
	path: toolPath,
	keywords: toolKeywords,
	ogImage: false,
});

export default function BimiCheckerPage() {
	const siteUrl = getSiteUrl();

	return (
		<div className="relative min-h-screen overflow-x-clip bg-bg-white-0 font-sans text-text-strong-950 [--primary-base:#2563eb] [--primary-dark:#1d4ed8] [--primary-darker:#1e40af] [--primary-link:#1d4ed8] dark:bg-black dark:text-white dark:[--primary-base:#ffffff] dark:[--primary-dark:#ffffff] dark:[--primary-darker:#e6edf3] dark:[--primary-link:#ffffff]">
			<JsonLd
				data={[
					{
						"@context": "https://schema.org",
						"@type": "WebApplication",
						name: `${toolTitle} | Reloop`,
						url: `${siteUrl}${toolPath}`,
						description: metaDescription,
						applicationCategory: "DeveloperApplication",
						operatingSystem: "Any",
						offers: {
							"@type": "Offer",
							price: "0",
							priceCurrency: "USD",
						},
						featureList: [
							"Lookup default._bimi TXT",
							"Validate v=BIMI1, l=, and a=",
							"Confirm DMARC p=quarantine or p=reject with pct=100",
							"Fetch HTTPS SVG Tiny PS heuristics",
							"Public unauthenticated API",
						],
						publisher: {
							"@type": "Organization",
							name: "Reloop",
							url: siteUrl,
						},
					},
					{
						"@context": "https://schema.org",
						"@type": "FAQPage",
						mainEntity: faqs.map((faq) => ({
							"@type": "Question",
							name: faq.question,
							acceptedAnswer: {
								"@type": "Answer",
								text: faq.answer,
							},
						})),
					},
					{
						"@context": "https://schema.org",
						"@type": "BreadcrumbList",
						itemListElement: [
							{
								"@type": "ListItem",
								position: 1,
								name: "Tools",
								item: `${siteUrl}/tools`,
							},
							{
								"@type": "ListItem",
								position: 2,
								name: toolTitle,
								item: `${siteUrl}${toolPath}`,
							},
						],
					},
				]}
			/>

			<BimiHero />

			<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<div
					aria-hidden
					className="h-24 border-stroke-soft-100 border-b dark:border-white/10"
				/>
				<WhatIsBimi />
				<div
					aria-hidden
					className="h-24 border-stroke-soft-100 border-b dark:border-white/10"
				/>
				<HowItWorksSteps />
				<div
					aria-hidden
					className="h-24 border-stroke-soft-100 border-b dark:border-white/10"
				/>
				<WhatItChecks />
				<div
					aria-hidden
					className="h-24 border-stroke-soft-100 border-b dark:border-white/10"
				/>
				<BimiDnsRecords />
				<div
					aria-hidden
					className="h-24 border-stroke-soft-100 border-b dark:border-white/10"
				/>
				<ApiIntegration />
				<div
					aria-hidden
					className="h-24 border-stroke-soft-100 border-b dark:border-white/10"
				/>
				<SimilarTools />
				<div aria-hidden className="h-12 sm:h-16" />
				<BimiCta
					headlineLine1="Show your logo in every inbox."
					subtext="Reloop checks your BIMI record, DMARC enforcement, and SVG logo in one lookup. Start with the free checker, then enforce DMARC."
					primaryLabel="Get started free"
					secondaryLabel="Talk to founder"
				/>
				<div aria-hidden className="h-12 sm:h-16" />
				<div className="border-stroke-soft-100 border-y dark:border-white/10 [&_.t-acc:last-child]:border-b-0">
					<FaqSection
						items={faqGroups.flatMap((g) => g.items)}
						id="faq-section"
						eyebrow="FAQ"
						compact
						plain
						flush
					/>
				</div>
			</div>
		</div>
	);
}
