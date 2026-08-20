import { JsonLd } from "@reloop/web/components/json-ld";
import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { createPageMetadata } from "@reloop/web/lib/metadata";
import { getSiteUrl } from "@reloop/web/lib/site";
import { ApiSection } from "./api-section";
import { CheckerPanel } from "./checker-panel";
import {
	faqGroups,
	faqs,
	reasons,
	signals,
	toolDescription,
	toolKeywords,
	toolPath,
	toolTitle,
} from "./content";
import { FaqGrid } from "./faq-grid";
import {
	Band,
	Cell,
	CellCopy,
	CellGrid,
	CellLabel,
	SectionIntro,
	SectionRule,
} from "./grid";

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
		<>
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

			<Band className="relative overflow-hidden pt-16">
				<div className="relative px-5 pt-14 pb-16 sm:px-6 sm:pt-16 md:px-8 lg:pb-20">
					<div className="mx-auto max-w-2xl text-center">
						<span className="inline-flex items-center gap-2 rounded-full border border-stroke-soft-200 bg-bg-white-0 px-3 py-1 font-mono text-[11px] text-text-sub-600 uppercase tracking-[0.12em] dark:border-white/12 dark:bg-black dark:text-white/45">
							<span className="size-1.5 rounded-full bg-primary-base" />
							Free tool — no account
						</span>

						<h1 className="mt-6 font-semibold text-[2.4rem] text-text-strong-950 leading-[1.05] tracking-[-1.4px] sm:text-[3.4rem] dark:text-white">
							Is that a temporary
							<br />
							<span className="text-primary-base">email address?</span>
						</h1>

						<p className="mx-auto mt-5 max-w-xl text-[15px] text-text-sub-600 leading-relaxed sm:text-[17px] dark:text-white/50">
							Paste an address or a domain to see whether it comes from a
							throwaway mailbox provider — before it lands in your database and
							starts bouncing.
						</p>
					</div>

					<div className="mt-10">
						<CheckerPanel />
					</div>
				</div>
			</Band>

			<SectionRule index="01" total="04" label="Why it matters" />
			<Band>
				<SectionIntro
					eyebrow="Sender reputation"
					eyebrowIcon="shield"
					lead="Why throwaway signups"
					accent="cost you"
					description="A burner address is not just a junk row in your database. It actively degrades the deliverability of every other message you send."
				/>
				<CellGrid columns={2}>
					{reasons.map((item) => (
						<Cell key={item.title}>
							<CellLabel icon={item.icon} label={item.stat} />
							<CellCopy title={item.title} description={item.description} />
						</Cell>
					))}
				</CellGrid>
			</Band>

			<SectionRule index="02" total="04" label="Signals" />
			<Band>
				<SectionIntro
					eyebrow="Nothing hidden"
					eyebrowIcon="check-circle"
					lead="What the check"
					accent="looks at"
					description="A verdict is only useful if you can see how it was reached. Every signal behind the result is reported on its own."
				/>
				<CellGrid columns={3}>
					{signals.map((item) => (
						<Cell key={item.title}>
							<CellLabel icon={item.icon} label={item.tag} />
							<CellCopy title={item.title} description={item.description} />
						</Cell>
					))}
				</CellGrid>
			</Band>

			<SectionRule index="03" total="04" label="API" />
			<ApiSection />

			<SectionRule index="04" total="04" label="Questions" />
			<Band>
				<SectionIntro lead="Frequently asked" accent="questions" />
				<FaqGrid groups={faqGroups} />
			</Band>

			<BlogCta />
		</>
	);
}
