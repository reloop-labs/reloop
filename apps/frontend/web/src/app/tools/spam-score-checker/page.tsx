import { JsonLd } from "@reloop/web/components/json-ld";
import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { createPageMetadata } from "@reloop/web/lib/metadata";
import { getSiteUrl } from "@reloop/web/lib/site";
import { SectionSeparator } from "../../(home)/components/section-separator";
import { ApiSection } from "./api-section";
import { AiAgentsSection } from "./components/ai-agents-section";
import { HowItWorksSection } from "./components/how-it-works-section";
import { SpamScoreHero } from "./components/spam-score-hero";
import {
	faqGroups,
	faqs,
	toolDescription,
	toolKeywords,
	toolPath,
	toolTitle,
} from "./content";
import { FaqGrid } from "./faq-grid";
import { SectionIntro } from "./grid";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = createPageMetadata({
	title: toolTitle,
	description: toolDescription,
	path: toolPath,
	keywords: toolKeywords,
	ogImage: false,
});

export default function SpamScoreCheckerPage() {
	const siteUrl = getSiteUrl();

	return (
		<div className="relative min-h-screen overflow-x-hidden bg-bg-white-0 font-sans text-text-strong-950 selection:bg-neutral-200 dark:bg-black dark:text-white dark:selection:bg-neutral-800">
			<JsonLd
				data={[
					{
						"@context": "https://schema.org",
						"@type": "WebApplication",
						name: `${toolTitle} | Reloop`,
						url: `${siteUrl}${toolPath}`,
						description: toolDescription,
						applicationCategory: "DeveloperApplication",
						operatingSystem: "Any",
						offers: {
							"@type": "Offer",
							price: "0",
							priceCurrency: "USD",
						},
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

			<SpamScoreHero />

			<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				<HowItWorksSection />
				<SectionSeparator />
				<ApiSection />
				<SectionSeparator />
				<AiAgentsSection />
				<SectionSeparator />
				<section id="faq-section" className="w-full">
					<SectionIntro lead="Frequently asked questions" align="left" />
					<FaqGrid groups={faqGroups} />
				</section>
				<SectionSeparator />
				<BlogCta
					headline={
						<>
							Email API
							<br />
							for Developers
						</>
					}
					sub="Free plan: 3,000 emails a month. No credit card."
					primaryLabel="Get started free"
					primaryHref="/dashboard/signup"
					primaryVariant="primary"
					secondaryLabel="Contact us"
					secondaryHref="/contact"
					accentColor="primary"
					flush
					align="center"
					pill={false}
					showTopRule={false}
				/>
			</div>
		</div>
	);
}
