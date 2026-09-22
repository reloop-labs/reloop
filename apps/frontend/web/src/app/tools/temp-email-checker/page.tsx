import { FaqSection } from "@reloop/web/components/faq-section";
import { JsonLd } from "@reloop/web/components/json-ld";
import { createPageMetadata } from "@reloop/web/lib/metadata";
import { getSiteUrl } from "@reloop/web/lib/site";
import { ApiIntegration } from "./components/api-integration";
import { HowItWorksSteps } from "./components/how-it-works-steps";
import { SimilarTools } from "./components/similar-tools";
import { TempEmailCta } from "./components/temp-email-cta";
import { TempEmailHero } from "./components/temp-email-hero";
import { WasteCalculator } from "./components/waste-calculator";
import { WhoIsItFor } from "./components/who-is-it-for";
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

export default function TempEmailCheckerPage() {
	const siteUrl = getSiteUrl();

	return (
		<div className="relative min-h-screen overflow-x-clip bg-bg-white-0 font-sans text-text-strong-950 dark:bg-black dark:text-white">
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
							"Disposable and temporary email detection",
							"~210,000 throwaway domain catalogue",
							"RFC syntax validation",
							"Role prefix detection",
							"Live DNS MX lookup without SMTP probing",
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

			<TempEmailHero />

			<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<div
					aria-hidden
					className="h-24 border-stroke-soft-100 border-b dark:border-white/10"
				/>
				<HowItWorksSteps />
				<div
					aria-hidden
					className="h-24 border-stroke-soft-100 border-b dark:border-white/10"
				/>
				<WasteCalculator />
				<div
					aria-hidden
					className="h-24 border-stroke-soft-100 border-b dark:border-white/10"
				/>
				<WhoIsItFor />
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
				<TempEmailCta
					headlineLine1="Stop paying for throwaways emails."
					subtext="Reloop automatically flags risky contacts before you waste time or money on them. Start with 3,000 free emails per month."
					primaryLabel="Get started free"
					secondaryLabel="See pricing"
					secondaryHref="/pricing"
					secondaryExternal={false}
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
