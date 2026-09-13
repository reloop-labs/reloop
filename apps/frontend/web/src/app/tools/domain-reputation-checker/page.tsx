import { Icon } from "@reloop/ui/icon";
import { JsonLd } from "@reloop/web/components/json-ld";
import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { createPageMetadata } from "@reloop/web/lib/metadata";
import { getSiteUrl } from "@reloop/web/lib/site";
import { FaqGrid } from "../blocklist-checker/faq-grid";
import { Band, SectionIntro } from "../blocklist-checker/grid";
import { ApiSection } from "./api-section";
import { CheckerPanel } from "./checker-panel";
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

export const instant = false;

export const metadata = createPageMetadata({
	title: metaTitle,
	description: metaDescription,
	path: toolPath,
	keywords: toolKeywords,
	ogImage: false,
});

export default function DomainReputationCheckerPage() {
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
							"Composite domain reputation score (0–100)",
							"Letter grade evaluation (A+ to F)",
							"SPF, DKIM, and DMARC enforcement auditing",
							"Real-time domain blocklist checks (Spamhaus DBL, URIBL, SURBL)",
							"Domain age and registration maturity analysis",
							"DNS and mail exchange infrastructure diagnostics",
							"Public REST JSON API with cURL, Node.js, and Python SDKs",
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

			<Band className="relative overflow-hidden pt-16">
				<div className="relative px-5 pt-14 pb-16 sm:px-6 sm:pt-16 md:px-8 lg:pb-20">
					<div className="mx-auto max-w-3xl text-center">
						<span className="inline-flex items-center gap-2 rounded-full border border-stroke-soft-200 bg-bg-white-0 px-3 py-1 font-mono text-[11px] text-text-sub-600 uppercase tracking-[0.12em] dark:border-white/12 dark:bg-black dark:text-white/45">
							<span className="size-1.5 rounded-full bg-text-strong-950 dark:bg-white" />
							Free tool — no account needed
						</span>
						<h1 className="mt-6 font-semibold text-[2.4rem] text-text-strong-950 leading-[1.05] tracking-[-1.4px] sm:text-[3.4rem] dark:text-white">
							Domain reputation checker
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

			<Band id="why-it-matters">
				<SectionIntro
					lead="The 4 pillars of sender reputation."
					description="Mailbox algorithms evaluate authentication, domain age, blocklist presence, and DNS health together."
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

			<Band id="api">
				<SectionIntro
					lead="Check domain reputation programmatically."
					description="Call the same reputation lookup from Node, Python, Go, and the other SDKs — or POST a domain to our public REST endpoint."
				/>
				<ApiSection />
			</Band>

			<Band id="faq">
				<SectionIntro
					lead="Frequently asked questions."
					description="Learn how domain reputation impacts deliverability, how scoring works, and how to recover from blocklists."
				/>
				<FaqGrid groups={faqGroups} />
			</Band>

			<Band className="border-b-0">
				<BlogCta />
			</Band>
		</>
	);
}
