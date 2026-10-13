import { FaqSection } from "@reloop/web/components/faq-section";
import { JsonLd } from "@reloop/web/components/json-ld";
import { BlueprintCta } from "@reloop/web/components/landing/blueprint-cta";
import { createPageMetadata } from "@reloop/web/lib/metadata";
import { getSiteUrl } from "@reloop/web/lib/site";
import { Gift, Layers, Lock, ScanSearch } from "lucide-react";
import { SimilarTools } from "../components/similar-tools";
import { FeatureGrid } from "../domain-age/components/feature-grid";
import { McpSection } from "../domain-age/components/mcp-section";
import { WhoIsItFor } from "../domain-age/components/who-is-it-for";
import { ApiIntegration } from "./components/api-integration";
import { WhoSendsHero } from "./components/who-sends-hero";
import {
	faqGroups,
	faqs,
	metaDescription,
	toolKeywords,
	toolPath,
	toolTitle,
} from "./content";

export const instant = false;

export const metadata = createPageMetadata({
	title: toolTitle,
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

export default function WhoSendsPage() {
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

			<WhoSendsHero />

			<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<Spacer />
				<FeatureGrid
					id="best-features"
					eyebrow="Best features"
					icon="star"
					title={["Why choose Reloop's", "email sender lookup?"]}
					description="Free, no account needed, and read straight from the domain's public DNS."
					features={[
						{
							icon: Gift,
							title: "100% Free & No limits",
							description:
								"This lookup is free. It needs no signup and has no credits or expiry.",
						},
						{
							icon: ScanSearch,
							title: "Unrolls nested SPF",
							description:
								"We follow branded includes like spf.acme.com down to the real provider underneath.",
						},
						{
							icon: Layers,
							title: "Flags leftover vendors",
							description:
								"Providers still in SPF with no DKIM key are marked as likely leftovers you can remove.",
						},
						{
							icon: Lock,
							title: "No Account Needed",
							description:
								"Use the lookup or the API without an account or an API key. We never send email.",
						},
					]}
				/>
				<Spacer />
				<WhoIsItFor
					title={["Where can I use Reloop's", "email sender lookup?"]}
					description="Anyone who needs to know which services can send email as a domain."
					columns={[
						{
							title: "Email admins",
							items: [
								"SPF cleanup",
								"10-lookup limit fixes",
								"Vendor offboarding",
								"DMARC rollout prep",
								"Migration planning",
								"Inbox vs. sender audits",
								"Subdomain policy checks",
							],
						},
						{
							title: "Security teams",
							items: [
								"Shadow IT discovery",
								"Spoofing exposure",
								"+all misconfigurations",
								"Vendor risk reviews",
								"Phishing triage",
								"M&A due diligence",
								"Compliance audits",
							],
						},
						{
							title: "Sales & Growth",
							items: [
								"Tech stack research",
								"Competitor ESP lookup",
								"Lead enrichment",
								"Account qualification",
								"Migration prospecting",
								"Partner vetting",
								"Market mapping",
							],
						},
						{
							title: "Developers",
							items: [
								"Onboarding checks",
								"Custom domain setup",
								"Multi-tenant sending",
								"Customer DNS support",
								"Deliverability debugging",
								"ESP detection APIs",
								"Internal tooling",
							],
						},
					]}
				/>
				<Spacer />
				<ApiIntegration
					title={["Integrate today", "in your code"]}
					description="One request returns the inbox provider, every authorized sender and the SPF policy for any domain. No API key or account needed."
				/>
				<Spacer />
				<McpSection
					title={["Look up email senders", "from your AI agent"]}
					description="Connect Claude, Cursor, or any MCP client to Reloop and let your agent see who sends email for a domain on its own."
					mcpDescription="Let Claude, Cursor, or Codex check a domain's sending stack before they act."
				/>
				<Spacer edge="y" />
				<SimilarTools currentPath={toolPath} />
				<div aria-hidden className="h-12 sm:h-16" />
				<BlueprintCta
					headlineLine1="Too many senders?"
					headlineLine2="Send it all through Reloop."
					subtext="Replace scattered sending vendors with one SPF include and one API. Start with 3,000 free emails per month."
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
