import { Icon } from "@reloop/ui/icon";
import { FaqSection } from "@reloop/web/components/faq-section";
import { JsonLd } from "@reloop/web/components/json-ld";
import {
	cardGridClass,
	FeatureCta,
	MarketingPageShell,
	PageSection,
	SectionHeading,
} from "@reloop/web/components/page-shell";
import { createPageMetadata } from "@reloop/web/lib/metadata";
import { getSiteUrl } from "@reloop/web/lib/site";
import { CheckerPanel } from "./checker-panel";
import {
	cta,
	faqs,
	reasons,
	signals,
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

			<MarketingPageShell
				titleLines={["Is that a temporary", "email address?"]}
				description="Paste an address or a domain to see whether it comes from a throwaway mailbox provider — before it lands in your database and starts bouncing."
				compactHero
				tightHeroBottom
				heroLeading={
					<span className="mb-5 inline-flex items-center gap-2 rounded-full border border-stroke-soft-200 px-3 py-1 font-medium text-[12px] text-text-sub-600 dark:border-white/12 dark:text-white/50">
						<span className="size-1.5 rounded-full bg-primary-base" />
						Free tool — no account needed
					</span>
				}
			>
				<PageSection narrow flushTop>
					<CheckerPanel />
				</PageSection>

				<PageSection alt>
					<SectionHeading
						title="Why throwaway signups cost you."
						description="A burner address is not just a junk row in your database. It actively degrades the deliverability of every other message you send."
					/>
					<div className="grid gap-6 sm:grid-cols-2">
						{reasons.map((item) => (
							<div
								key={item.title}
								className="rounded-2xl border border-stroke-soft-200 p-8 dark:border-white/10"
							>
								<p className="font-medium text-[11px] text-primary-base uppercase tracking-[0.16em]">
									{item.stat}
								</p>
								<h3 className="mt-3 mb-3 font-semibold text-lg text-text-strong-950 dark:text-white">
									{item.title}
								</h3>
								<p className="text-sm text-text-sub-600 leading-relaxed dark:text-white/50">
									{item.description}
								</p>
							</div>
						))}
					</div>
				</PageSection>

				<PageSection>
					<SectionHeading
						title="What the check looks at."
						description="A verdict is only useful if you can see how it was reached. Every signal behind the result is reported on its own."
					/>
					<div className={cardGridClass}>
						{signals.map((item) => (
							<div
								key={item.title}
								className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-8 dark:border-white/10 dark:bg-[#111]"
							>
								<span className="flex size-9 items-center justify-center rounded-full bg-bg-weak-50 text-text-strong-950 dark:bg-white/5 dark:text-white">
									<Icon name={item.icon} className="size-[18px]" />
								</span>
								<h3 className="mt-5 mb-3 font-semibold text-lg text-text-strong-950 dark:text-white">
									{item.title}
								</h3>
								<p className="text-sm text-text-sub-600 leading-relaxed dark:text-white/50">
									{item.description}
								</p>
							</div>
						))}
					</div>
				</PageSection>

				<FaqSection items={faqs} eyebrow="Temp email checker" />

				<FeatureCta {...cta} />
			</MarketingPageShell>
		</>
	);
}
