import { JsonLd } from "@reloop/web/components/json-ld";
import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { FaqSection } from "@reloop/web/components/faq-section";
import { createPageMetadata } from "@reloop/web/lib/metadata";
import { getSiteUrl } from "@reloop/web/lib/site";
import { ApiSection } from "./api-section";
import { AiAgentsSection } from "./components/ai-agents-section";
import { HowItWorksSteps } from "./components/how-it-works-steps";
import { SectionMark } from "./components/section-mark";
import { WhoIsItFor } from "./components/who-is-it-for";
import { RecentChecksSection } from "./components/recent-checks-section";
import { TempEmailHero } from "./components/temp-email-hero";
import {
	faqGroups,
	faqs,
	toolDescription,
	toolKeywords,
	toolPath,
	toolTitle,
} from "./content";

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

export default function TempEmailCheckerPage() {
	const siteUrl = getSiteUrl();

	return (
			<div className="relative min-h-screen overflow-x-clip bg-bg-white-0 font-sans text-text-strong-950 selection:bg-neutral-200 dark:bg-black dark:text-white dark:selection:bg-neutral-800">
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

			<TempEmailHero />

			<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<div aria-hidden className="h-24" />
				<SectionMark index="01" label="How it works" />
				<HowItWorksSteps />
				<div aria-hidden className="h-24" />
				<SectionMark index="02" label="Who is it for" />
				<WhoIsItFor />
				<RecentChecksSection />
				<div aria-hidden className="h-24" />
				<SectionMark index="03" label="Check from code" />
				<ApiSection />
				<div aria-hidden className="h-24" />
				<SectionMark index="04" label="AI agents" />
				<AiAgentsSection />
				<div aria-hidden className="h-24" />
				<SectionMark index="05" label="FAQ" />
				<div className="border-stroke-soft-100 border-b dark:border-white/10 [&_.t-acc:last-child]:border-b-0">
					<FaqSection
						items={faqGroups.flatMap((g) => g.items)}
						id="faq-section"
						compact
						plain
						flush
					/>
				</div>
				<div aria-hidden className="h-24" />
				<div className="w-full border-stroke-soft-100 border-y [--primary-base:#f43f5e] [--primary-dark:#e11d48] [--primary-darker:#be123c] [--primary-link:#e11d48] dark:border-white/10 dark:[--primary-base:#fb7185] dark:[--primary-dark:#fb7185] dark:[--primary-darker:#e11d48] dark:[--primary-link:#fda4af]">
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
						secondaryLabel="Schedule call"
						secondaryHref="https://cal.com/pranavp/30"
						secondaryExternal
						accentColor="primary"
						blast={{ light: "#f43f5e", dark: "#fda4af" }}
						flush
						align="center"
						pill={false}
						showTopRule={false}
					/>
				</div>
			</div>
		</div>
	);
}
