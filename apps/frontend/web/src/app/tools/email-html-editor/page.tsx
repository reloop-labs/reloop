import { Icon } from "@reloop/ui/icon";
import { FaqSection } from "@reloop/web/components/faq-section";
import { JsonLd } from "@reloop/web/components/json-ld";
import { createPageMetadata } from "@reloop/web/lib/metadata";
import { getSiteUrl } from "@reloop/web/lib/site";
import { EmailHtmlEditorHero } from "./components/email-html-editor-hero";
import {
	faqGroups,
	faqs,
	metaDescription,
	metaTitle,
	reasons,
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
	ogImage: "/tools/opengraph-image",
});

export default function EmailHtmlEditorPage() {
	const siteUrl = getSiteUrl();

	return (
		<div className="relative min-h-screen overflow-x-clip bg-bg-white-0 font-sans text-text-strong-950 [--primary-base:#2563eb] [--primary-dark:#1d4ed8] [--primary-darker:#1e40af] [--primary-link:#1d4ed8] dark:bg-black dark:text-white dark:[--primary-base:#ffffff] dark:[--primary-dark:#ffffff] dark:[--primary-darker:#e6edf3] dark:[--primary-link:#ffffff]">
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

			<EmailHtmlEditorHero />

			<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<div
					aria-hidden
					className="h-24 border-stroke-soft-100 border-b dark:border-white/10"
				/>
				<div className="grid grid-cols-1 divide-y divide-stroke-soft-100 border-stroke-soft-100 border-b sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4 dark:divide-white/10 dark:border-white/10">
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
				<div aria-hidden className="h-12 sm:h-16" />
			</div>
		</div>
	);
}
