import { Icon } from "@reloop/ui/icon";
import { JsonLd } from "@reloop/web/components/json-ld";
import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { createPageMetadata } from "@reloop/web/lib/metadata";
import { getSiteUrl } from "@reloop/web/lib/site";
import { Band, SectionIntro } from "../blocklist-checker/grid";
import { ApiSection } from "./api-section";
import { CheckerPanel } from "./checker-panel";
import {
	faqGroups,
	faqs,
	metaDescription,
	reasons,
	toolDescription,
	toolKeywords,
	toolPath,
	toolTitle,
} from "./content";
import { FaqGrid } from "./faq-grid";

export const instant = false;

export const metadata = createPageMetadata({
	title: toolTitle,
	description: metaDescription,
	path: toolPath,
	keywords: toolKeywords,
	ogImage: false,
});

export default function WhoSendsPage() {
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
							"Discover authorized third-party email sending providers (ESPs)",
							"Inspect MX inbound mailbox host routing",
							"Recursive nested SPF delegation unrolling (depth 2)",
							"Detect abandoned and leftover vendor records",
							"Public unauthenticated JSON REST API",
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
							Email Infrastructure &amp; ESP Fingerprint
						</span>

						<h1 className="mt-6 font-semibold text-[2.4rem] text-text-strong-950 leading-[1.05] tracking-[-1.4px] sm:text-[3.4rem] dark:text-white">
							Who Sends Email From This Domain?
						</h1>

						<p className="mx-auto mt-5 max-w-xl text-[15px] text-text-sub-600 leading-relaxed sm:text-[17px] dark:text-white/50">
							{toolDescription}
						</p>
					</div>

					<div className="mt-10">
						<CheckerPanel />
					</div>
				</div>
			</Band>

			{/* Section: Why ESP Fingerprinting Matters */}
			<Band id="why-it-matters">
				<SectionIntro
					lead="Why analyzing your sending roster matters."
					description="Clean up vendor sprawl, prevent SPF lookup limit errors, and understand your company's true email sending footprint."
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
					lead="Identify email senders via API."
					description="Integrate automated vendor discovery and SPF permission mapping into your security audits or customer onboarding flows."
				/>

				<ApiSection />
			</Band>

			{/* Section: FAQs */}
			<Band id="faq">
				<SectionIntro
					lead="Frequently asked questions."
					description="Everything you need to know about SPF includes, nested unrolling, DKIM selectors, and inbox/outbound separation."
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
