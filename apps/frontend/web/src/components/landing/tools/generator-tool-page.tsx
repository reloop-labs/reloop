import { FaqGrid } from "@reloop/web/app/tools/blocklist-checker/faq-grid";
import {
	Band,
	SectionIntro,
} from "@reloop/web/app/tools/blocklist-checker/grid";
import type { FaqItem } from "@reloop/web/components/faq-section";
import { JsonLd } from "@reloop/web/components/json-ld";
import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { CompactApi } from "@reloop/web/components/landing/tools/compact-api";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { ReactNode } from "react";

export function GeneratorToolPage({
	title,
	description,
	path,
	panel,
	faqGroups,
	faqs,
	apiPath,
	apiBody,
	apiLead,
}: {
	title: string;
	description: string;
	path: string;
	panel: ReactNode;
	faqGroups: { title: string; items: FaqItem[] }[];
	faqs: FaqItem[];
	apiPath: string;
	apiBody: string;
	apiLead: string;
}) {
	const siteUrl = getSiteUrl();

	return (
		<>
			<JsonLd
				data={[
					{
						"@context": "https://schema.org",
						"@type": "WebApplication",
						name: `${title} | Reloop`,
						url: `${siteUrl}${path}`,
						description,
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
								name: title,
								item: `${siteUrl}${path}`,
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
							Free tool — no account
						</span>
						<h1 className="mt-6 font-semibold text-[2.4rem] text-text-strong-950 leading-[1.05] tracking-[-1.4px] sm:text-[3.4rem] dark:text-white">
							{title}
						</h1>
						<p className="mx-auto mt-5 max-w-xl text-[15px] text-text-sub-600 leading-relaxed sm:text-[17px] dark:text-white/50">
							{description}
						</p>
					</div>
					<div className="mt-10">{panel}</div>
				</div>
			</Band>

			<Band id="api">
				<SectionIntro lead={apiLead} />
				<CompactApi path={apiPath} body={apiBody} />
			</Band>

			<Band id="faq">
				<SectionIntro lead="Frequently asked questions." />
				<FaqGrid groups={faqGroups} />
			</Band>

			<Band className="border-b-0">
				<BlogCta />
			</Band>
		</>
	);
}
