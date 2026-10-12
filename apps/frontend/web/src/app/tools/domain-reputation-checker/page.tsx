import { FaqSection } from "@reloop/web/components/faq-section";
import { JsonLd } from "@reloop/web/components/json-ld";
import { BlueprintCta } from "@reloop/web/components/landing/blueprint-cta";
import { createPageMetadata } from "@reloop/web/lib/metadata";
import { getSiteUrl } from "@reloop/web/lib/site";
import { SimilarTools } from "../components/similar-tools";
import { ApiIntegration } from "./components/api-integration";
import { ReputationHero } from "./components/hero";
import { McpSection } from "./components/mcp-section";
import { HowWeScore, WhatYouGet, WhoIsItFor } from "./components/sections";
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

function Spacer({ edge = "b" }: { edge?: "b" | "y" }) {
	return (
		<div
			aria-hidden
			className={
				edge === "y"
					? "h-24 border-stroke-soft-100 border-y dark:border-white/10"
					: "h-24 border-stroke-soft-100 border-b dark:border-white/10"
			}
		/>
	);
}

export default function DomainReputationCheckerPage() {
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
						offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
						featureList: [
							"Composite domain reputation score (0–100) with A+ to F grade",
							"SPF, DKIM, and DMARC auditing",
							"Live checks on 7 domain blocklists",
							"Domain age and DNS health",
							"Copy-paste DNS records to fix each issue",
							"Gmail, Yahoo, Outlook, and iCloud sender requirements check",
							"Shareable reports and embeddable reputation badge",
							"Public REST API",
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
							acceptedAnswer: { "@type": "Answer", text: faq.answer },
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

			<ReputationHero />

			<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<Spacer />
				<WhatYouGet />
				<Spacer />
				<HowWeScore />
				<Spacer />
				<WhoIsItFor />
				<Spacer />
				<ApiIntegration />
				<Spacer />
				<McpSection />
				<Spacer edge="y" />
				<SimilarTools currentPath={toolPath} />
				<div aria-hidden className="h-12 sm:h-16" />
				<BlueprintCta
					headlineLine1="Keep your reputation high."
					headlineLine2="Send with Reloop."
					subtext="Authenticated sending, bounce handling, and deliverability analytics built in. Start with 3,000 free emails a month."
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
