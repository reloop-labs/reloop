import { FaqSection } from "@reloop/web/components/faq-section";
import { JsonLd } from "@reloop/web/components/json-ld";
import { createPageMetadata } from "@reloop/web/lib/metadata";
import { getSiteUrl } from "@reloop/web/lib/site";
import { BestFeatures } from "./components/best-features";
import { EmailHtmlEditorCta } from "./components/email-html-editor-cta";
import { EmailHtmlEditorHero } from "./components/email-html-editor-hero";
import { PixelPerfectSection } from "./components/pixel-perfect-section";
import { SimilarTools } from "./components/similar-tools";
import { TemplatesSection } from "./components/templates-section";
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

export const instant = false;

export const metadata = createPageMetadata({
	title: metaTitle,
	description: metaDescription,
	path: toolPath,
	keywords: toolKeywords,
	ogImage: false,
});

export default function EmailHtmlEditorPage() {
	const siteUrl = getSiteUrl();

	return (
		<div className="relative min-h-screen overflow-x-clip bg-bg-white-0 font-sans text-text-strong-950 [--primary-base:#171717] [--primary-dark:#000000] [--primary-darker:#000000] [--primary-link:#171717] dark:bg-black dark:text-white dark:[--primary-base:#ffffff] dark:[--primary-dark:#ffffff] dark:[--primary-darker:#e6edf3] dark:[--primary-link:#ffffff]">
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
							"Free email templates to start from",
							"Visual canvas with inspector and variables",
							"Source stays in sync with canvas edits",
							"No account needed to edit; save to Reloop for free",
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

			<EmailHtmlEditorHero />

			<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<div
					aria-hidden
					className="h-24 border-stroke-soft-100 border-y dark:border-white/10"
				/>
				<BestFeatures />
				<div
					aria-hidden
					className="h-24 border-stroke-soft-100 border-b dark:border-white/10"
				/>
				<TemplatesSection />
				<div
					aria-hidden
					className="h-24 border-stroke-soft-100 border-y dark:border-white/10"
				/>
				<PixelPerfectSection />
				<div
					aria-hidden
					className="h-24 border-stroke-soft-100 border-y dark:border-white/10"
				/>
				<WhoIsItFor />
				<div
					aria-hidden
					className="h-24 border-stroke-soft-100 border-b dark:border-white/10"
				/>
				<SimilarTools />
				<div
					aria-hidden
					className="h-24 border-stroke-soft-100 border-b dark:border-white/10"
				/>
				<div className="border-stroke-soft-100 border-b dark:border-white/10 [&_.t-acc:last-child]:border-b-0">
					<FaqSection
						items={faqGroups.flatMap((g) => g.items)}
						id="faq-section"
						eyebrow="FAQ"
						compact
						plain
						flush
					/>
				</div>
				<div
					aria-hidden
					className="h-24 border-stroke-soft-100 border-b dark:border-white/10"
				/>
				<EmailHtmlEditorCta />
			</div>
		</div>
	);
}
