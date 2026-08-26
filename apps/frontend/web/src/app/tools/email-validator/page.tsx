import { Icon } from "@reloop/ui/icon";
import { JsonLd } from "@reloop/web/components/json-ld";
import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { createPageMetadata } from "@reloop/web/lib/metadata";
import { getSiteUrl } from "@reloop/web/lib/site";
import { Band, SectionIntro } from "../blocklist-checker/grid";
import { ApiSection } from "./api-section";
import {
	faqGroups,
	faqs,
	metaDescription,
	metaTitle,
	reasons,
	toolDescription,
	toolKeywords,
	toolPath,
	toolTitle,
} from "./content";
import { FaqGrid } from "./faq-grid";
import { TesterPanel } from "./tester-panel";

export const instant = false;

export const metadata = createPageMetadata({
	title: metaTitle,
	description: metaDescription,
	path: toolPath,
	keywords: toolKeywords,
	ogImage: false,
});

export default function EmailValidatorPage() {
	const siteUrl = getSiteUrl();

	return (
		<>
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
							"Bulk email verifier & CSV list cleaning",
							"RFC 5322 syntax validation",
							"210,000+ disposable temporary domain detection",
							"Live DNS MX record lookup and implicit MX detection",
							"Role-based shared account identification",
							"Consumer webmail vs custom corporate provider detection",
							"Automatic duplicate email removal and notice banner",
							"Public unauthenticated REST API and SDKs for batch cleaning",
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

			{/* Hero / Interactive Tool Section */}
			<Band className="relative overflow-hidden pt-16">
				<div className="relative px-5 pt-14 pb-16 sm:px-6 sm:pt-16 md:px-8 lg:pb-20">
					<div className="mx-auto max-w-3xl text-center">
						<span className="inline-flex items-center gap-2 rounded-full border border-stroke-soft-200 bg-bg-white-0 px-3 py-1 font-mono text-[11px] text-text-sub-600 uppercase tracking-[0.12em] dark:border-white/12 dark:bg-black dark:text-white/45">
							<span className="size-1.5 rounded-full bg-emerald-500" />
							Free tool — no sign-up required
						</span>

						<h1 className="mt-6 text-balance font-semibold text-[2.4rem] text-text-strong-950 leading-[1.05] tracking-[-1.4px] sm:text-[3.4rem] dark:text-white">
							Email Validator
						</h1>

						<p className="mx-auto mt-5 max-w-xl text-[15px] text-text-sub-600 leading-relaxed sm:text-[17px] dark:text-white/50">
							{toolDescription}
						</p>
					</div>

					<div className="mt-10">
						<TesterPanel />
					</div>
				</div>
			</Band>

			{/* Section: Why Email Validation Matters (Exact 4-column diagnostic grid) */}
			<Band id="why-it-matters">
				<SectionIntro
					lead="Comprehensive email health diagnostics."
					description="Evaluate technical mail server compliance, disposable domains, and deliverability heuristics before sending campaigns to real customers."
				/>

				<div className="grid grid-cols-1 divide-y divide-stroke-soft-200 border-stroke-soft-200 border-t sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4 dark:divide-white/10 dark:border-white/10">
					{reasons.map((reason) => (
						<div
							key={reason.title}
							className="flex min-h-[14rem] flex-col justify-between p-6 sm:p-7 lg:p-8"
						>
							<Icon
								name={reason.icon}
								className="size-5 text-text-sub-600 dark:text-white/40"
							/>
							<div>
								<p className="font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
									{reason.title}
								</p>
								<p className="mt-1.5 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/50">
									{reason.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</Band>

			{/* Section: Programmatic API Integration */}
			<Band id="api">
				<SectionIntro
					lead="Automate email verification via API."
					description="Integrate automated email validation into your signup flows, onboarding forms, or batch list imports."
				/>

				<ApiSection />
			</Band>

			{/* Section: FAQs */}
			<Band id="faq">
				<SectionIntro
					lead="Frequently asked questions."
					description="Everything you need to know about email health scoring, batch limits, privacy, and deliverability."
				/>

				<FaqGrid groups={faqGroups} />
			</Band>

			{/* Bottom CTA to sign up */}
			<Band className="border-b-0">
				<BlogCta />
			</Band>
		</>
	);
}
