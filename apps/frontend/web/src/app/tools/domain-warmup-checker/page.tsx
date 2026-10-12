import { FaqSection } from "@reloop/web/components/faq-section";
import { JsonLd } from "@reloop/web/components/json-ld";
import { createPageMetadata } from "@reloop/web/lib/metadata";
import { getSiteUrl } from "@reloop/web/lib/site";
import { Gauge, Gift, Lock, ShieldCheck } from "lucide-react";
import { SimilarTools } from "../components/similar-tools";
import { ApiIntegration } from "../domain-age/components/api-integration";
import { DomainAgeCta } from "../domain-age/components/domain-age-cta";
import { FeatureGrid } from "../domain-age/components/feature-grid";
import { McpSection } from "../domain-age/components/mcp-section";
import { ToolHero } from "../domain-age/components/tool-hero";
import { WhoIsItFor } from "../domain-age/components/who-is-it-for";
import { WarmupSchedule } from "./components/warmup-schedule";
import {
	faqGroups,
	faqs,
	metaDescription,
	toolDescription,
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

export default function DomainWarmupCheckerPage() {
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
						offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
						featureList: [
							"Domain warmup stage (Too New, Cold, Warming, Established)",
							"Newly registered domain (NRD) spam filter risk",
							"SPF, DMARC and MX readiness check",
							"Safe daily sending caps by domain age",
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
							acceptedAnswer: { "@type": "Answer", text: faq.answer },
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

			<ToolHero
				highlight="Domain Warmup"
				rest="Checker"
				description={toolDescription}
				icon="shield-check"
				variant="warmup"
			/>

			<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<Spacer />
				<FeatureGrid
					id="best-features"
					eyebrow="Best features"
					icon="star"
					title={["Why choose Reloop's", "domain warmup checker?"]}
					description="Free, no account needed, and based on the same warmup caps Reloop enforces for every new domain."
					features={[
						{
							icon: Gift,
							title: "100% Free & No limits",
							description:
								"This checker is free. It needs no signup and has no credits or expiry.",
						},
						{
							icon: Gauge,
							title: "Clear warmup stage",
							description:
								"Know exactly where you are: Too New (0–7 days), Cold (8–30 days), Warming (31–90 days), or Established (90+ days).",
						},
						{
							icon: ShieldCheck,
							title: "Setup readiness",
							description:
								"See whether SPF, DMARC and MX are published, because age alone won't get you to the inbox.",
						},
						{
							icon: Lock,
							title: "No Account Needed",
							description:
								"Use the checker or the API without an account or an API key.",
						},
					]}
				/>
				<Spacer />
				<WarmupSchedule />
				<Spacer />
				<WhoIsItFor
					title={["Where can I use Reloop's", "domain warmup checker?"]}
					description="Anyone sending from a new domain who wants to reach the inbox, not the spam folder."
					columns={[
						{
							title: "Founders & startups",
							items: [
								"Launch announcements",
								"First product emails",
								"Waitlist invites",
								"Transactional email setup",
								"New brand domains",
								"Rebrand migrations",
								"Investor updates",
							],
						},
						{
							title: "Sales & outreach",
							items: [
								"Cold email domains",
								"Secondary sending domains",
								"SDR inbox rollout",
								"Sequence go-live checks",
								"Domain rotation",
								"Volume ramp planning",
								"Reply rate drops",
							],
						},
						{
							title: "Marketing teams",
							items: [
								"Newsletter launches",
								"Campaign domains",
								"Event invitations",
								"Lifecycle emails",
								"ESP migrations",
								"List re-engagement",
								"Promo sends",
							],
						},
						{
							title: "Agencies & developers",
							items: [
								"Client domain onboarding",
								"Pre-launch audits",
								"DNS setup reviews",
								"Deliverability tickets",
								"Staging to prod cutover",
								"Multi-tenant sending",
								"Automated go-live gates",
							],
						},
					]}
				/>
				<Spacer />
				<ApiIntegration
					title={["Integrate today", "in your code"]}
					description="One request returns the warmup stage, deliverability risk and SPF, DMARC and MX readiness for any domain. No API key or account needed."
				/>
				<Spacer />
				<McpSection
					title={["Check warmup stage", "from your AI agent"]}
					description="Connect Claude, Cursor, or any MCP client to Reloop and let your agent check if a domain is ready before it sends."
					mcpDescription="Let Claude, Cursor, or Codex check a domain's warmup stage before they send."
				/>
				<Spacer edge="y" />
				<SimilarTools currentPath={toolPath} />
				<div aria-hidden className="h-12 sm:h-16" />
				<DomainAgeCta
					headlineLine1="Stop warming up manually."
					headlineLine2="Let's talk."
					subtext="Reloop handles your domain warmup and watches for bounce and spam signals automatically. Start with 3,000 free emails per month."
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
