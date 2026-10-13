import { FaqSection } from "@reloop/web/components/faq-section";
import { JsonLd } from "@reloop/web/components/json-ld";
import { BlueprintCta } from "@reloop/web/components/landing/blueprint-cta";
import { createPageMetadata } from "@reloop/web/lib/metadata";
import { getSiteUrl } from "@reloop/web/lib/site";
import { Gift, Inbox, Lock, ScanSearch } from "lucide-react";
import { SimilarTools } from "../components/similar-tools";
import { FeatureGrid } from "../domain-age/components/feature-grid";
import { WhoIsItFor } from "../domain-age/components/who-is-it-for";
import { ApiIntegration } from "./components/api-integration";
import { SpoofHero } from "./components/spoof-hero";
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

export default function SpoofCheckerPage() {
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
						offers: {
							"@type": "Offer",
							price: "0",
							priceCurrency: "USD",
						},
						featureList: [
							"Instant Yes/No spoofing verdict in plain English",
							"Gmail and Outlook inbox delivery simulation",
							"DMARC p=none monitoring blindspot detection",
							"SPF +all loophole and subdomain hole audit",
							"Public unauthenticated JSON API",
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

			<SpoofHero />

			<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<Spacer />
				<FeatureGrid
					id="best-features"
					eyebrow="Best features"
					icon="star"
					title={["Why choose Reloop's", "email spoofing checker?"]}
					description="Free, no account needed, and read straight from your domain's public DNS."
					features={[
						{
							icon: Gift,
							title: "100% Free & No limits",
							description:
								"This checker is free. It needs no signup and has no credits or expiry.",
						},
						{
							icon: Inbox,
							title: "See what a fake would do",
							description:
								"We show whether a forged email from your domain lands in the inbox, goes to spam, or gets blocked.",
						},
						{
							icon: ScanSearch,
							title: "Plain-English reasons",
							description:
								"Every finding from DMARC, SPF and DKIM is explained, with the raw records one click away.",
						},
						{
							icon: Lock,
							title: "No Account Needed",
							description:
								"Use the checker or the API without an account or an API key. We never send email.",
						},
					]}
				/>
				<Spacer />
				<WhoIsItFor
					title={["Where can I use Reloop's", "email spoofing checker?"]}
					description="Anyone who needs to know if a domain can be impersonated over email."
					columns={[
						{
							title: "Security teams",
							items: [
								"Phishing risk reviews",
								"CEO fraud prevention",
								"Invoice fraud defense",
								"Vendor risk audits",
								"Pen test prep",
								"Compliance evidence",
								"Incident follow-up",
							],
						},
						{
							title: "Email admins",
							items: [
								"DMARC rollout",
								"Moving off p=none",
								"Subdomain policy checks",
								"SPF cleanup",
								"New domain setup",
								"Migration checks",
								"Parked domain lockdown",
							],
						},
						{
							title: "Founders & IT",
							items: [
								"Company domain checks",
								"Brand protection",
								"Customer trust",
								"Board security reports",
								"Insurance questionnaires",
								"M&A due diligence",
								"Agency client audits",
							],
						},
						{
							title: "Developers",
							items: [
								"Customer domain onboarding",
								"Custom sending domains",
								"Multi-tenant sending",
								"Signup risk scoring",
								"Security dashboards",
								"Automated audits",
								"Internal tooling",
							],
						},
					]}
				/>
				<Spacer />
				<ApiIntegration
					title={["Integrate today", "in your code"]}
					description="One request tells you whether a domain can be spoofed and why. No API key or account needed."
				/>
				<Spacer edge="y" />
				<SimilarTools currentPath={toolPath} />
				<div aria-hidden className="h-12 sm:h-16" />
				<BlueprintCta
					headlineLine1="Lock down your domain."
					headlineLine2="Send with Reloop."
					subtext="Reloop sets up SPF, DKIM and DMARC for your sending domain so fakes get rejected and real mail lands. Start with 3,000 free emails per month."
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
