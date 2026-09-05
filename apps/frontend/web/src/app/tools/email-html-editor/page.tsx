import { Icon } from "@reloop/ui/icon";
import { JsonLd } from "@reloop/web/components/json-ld";
import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { createPageMetadata } from "@reloop/web/lib/metadata";
import { getSiteUrl } from "@reloop/web/lib/site";
import { FaqGrid } from "../blocklist-checker/faq-grid";
import { Band, SectionIntro } from "../blocklist-checker/grid";
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
import { EditorPanel } from "./editor-panel";

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
							"Paste React Email or raw HTML",
							"Visual canvas with inspect",
							"Source stays in sync with canvas edits",
							"No account, save, or send",
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
							Free tool — no account
						</span>
						<h1 className="mt-6 font-semibold text-[2.4rem] text-text-strong-950 leading-[1.05] tracking-[-1.4px] sm:text-[3.4rem] dark:text-white">
							Email HTML editor
						</h1>
						<p className="mx-auto mt-5 max-w-xl text-[15px] text-text-sub-600 leading-relaxed sm:text-[17px] dark:text-white/50">
							{toolDescription}
						</p>
					</div>
					<div className="mt-10">
						<EditorPanel />
					</div>
				</div>
			</Band>

			<Band id="why-it-matters">
				<SectionIntro
					lead="Paste once. Edit visually. Keep the source."
					description="A browser-only loop for React Email and table HTML — no login and no send."
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

			<Band id="faq">
				<SectionIntro
					lead="Frequently asked questions."
					description="What this editor does, and what it leaves out."
				/>
				<FaqGrid groups={faqGroups} />
			</Band>

			<Band className="border-b-0">
				<BlogCta />
			</Band>
		</>
	);
}
