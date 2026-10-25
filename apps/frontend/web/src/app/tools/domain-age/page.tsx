import { FaqSection } from "@reloop/web/components/faq-section";
import { JsonLd } from "@reloop/web/components/json-ld";
import { createPageMetadata } from "@reloop/web/lib/metadata";
import { getSiteUrl } from "@reloop/web/lib/site";
import { CalendarSearch, Gift, Hourglass, Lock } from "lucide-react";
import { connection } from "next/server";
import { Suspense } from "react";
import { SimilarTools } from "../components/similar-tools";
import { ApiIntegration } from "./components/api-integration";
import { DomainAgeCta } from "./components/domain-age-cta";
import { FeatureGrid } from "./components/feature-grid";
import { McpSection } from "./components/mcp-section";
import { ToolHero } from "./components/tool-hero";
import { WhoIsItFor } from "./components/who-is-it-for";
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

async function DynamicMetadataMarker() {
	// Opts this route into dynamic rendering so generateMetadata can read
	// ?domainName= for per-domain OG tags. Rendered inside <Suspense> below.
	await connection();
	return null;
}

function normalizeDomainParam(
	raw: string | string[] | undefined,
): string | null {
	const first = Array.isArray(raw) ? raw[0] : raw;
	if (!first) return null;
	let v = first.trim().toLowerCase();
	if (!v) return null;
	v = v.replace(/^https?:\/\//, "").split("/")[0] ?? "";
	v = v.split("?")[0] ?? "";
	v = v.split("#")[0] ?? "";
	v = v.split(":")[0] ?? "";
	v = v.replace(/[^a-z0-9.-]/g, "");
	if (!v.includes(".") || v.length < 3 || v.length > 253) return null;
	return v;
}

type PageProps = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: PageProps) {
	const params = await searchParams;
	const domain =
		normalizeDomainParam(params.domainName) ??
		normalizeDomainParam(params.domain);

	if (!domain) {
		return createPageMetadata({
			title: toolTitle,
			description: metaDescription,
			path: toolPath,
			keywords: toolKeywords,
			// Not a domain, so the og/[domain] route renders the default card. A
			// file-based opengraph-image here would override per-domain images.
			ogImage: "/tools/domain-age/og/default/opengraph-image",
		});
	}

	return createPageMetadata({
		title: `${domain} — Domain Age, Registration Date & Expiry`,
		description: `How old is ${domain}? See its registration date, exact age, expiry date and registrar. Free, no sign-up.`,
		path: toolPath,
		keywords: toolKeywords,
		ogImage: `/tools/domain-age/og/${encodeURIComponent(domain)}/opengraph-image`,
	});
}

export default function DomainAgePage() {
	const siteUrl = getSiteUrl();

	return (
		<div className="relative min-h-screen overflow-x-clip bg-bg-white-0 font-sans text-text-strong-950 [--primary-base:#171717] [--primary-dark:#000000] [--primary-darker:#000000] [--primary-link:#171717] dark:bg-black dark:text-white dark:[--primary-base:#ffffff] dark:[--primary-dark:#ffffff] dark:[--primary-darker:#e6edf3] dark:[--primary-link:#ffffff]">
			<Suspense>
				<DynamicMetadataMarker />
			</Suspense>
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
							"Official RDAP domain registration date lookup",
							"Exact domain age in years, months and days",
							"Domain expiry date and registrar",
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
					{
						"@context": "https://schema.org",
						"@type": "HowTo",
						name: "How to check how old a domain is",
						description:
							"Check any domain's registration date and age using the free Reloop Domain Age Calculator.",
						step: [
							{
								"@type": "HowToStep",
								position: 1,
								name: "Enter your domain",
								text: "Paste your domain or URL into the search box.",
							},
							{
								"@type": "HowToStep",
								position: 2,
								name: "View domain age",
								text: "See the exact registration date pulled from RDAP and the age in years, months and days.",
							},
							{
								"@type": "HowToStep",
								position: 3,
								name: "Check expiry and registrar",
								text: "See when the domain expires and which registrar holds it.",
							},
						],
					},
				]}
			/>

			<ToolHero
				highlight="Domain Age"
				rest="Calculator"
				description={toolDescription}
				icon="hourglass"
				variant="age"
			/>

			<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<Spacer />
				<FeatureGrid
					id="best-features"
					eyebrow="Best features"
					icon="star"
					title={["Why choose Reloop's", "domain age calculator?"]}
					description="Free, no account needed, and read straight from the official domain registries."
					features={[
						{
							icon: Gift,
							title: "100% Free & No limits",
							description:
								"This calculator is free. It needs no signup and has no credits or expiry.",
						},
						{
							icon: CalendarSearch,
							title: "Official registry dates",
							description:
								"We read the creation date over RDAP from the registry itself, not from stale WHOIS caches.",
						},
						{
							icon: Hourglass,
							title: "Exact age, to the day",
							description:
								"See the age in years, months and days, plus the expiry date and the registrar.",
						},
						{
							icon: Lock,
							title: "No Account Needed",
							description:
								"Use the calculator or the API without an account or an API key.",
						},
					]}
				/>
				<Spacer />
				<WhoIsItFor
					title={["Where can I use Reloop's", "domain age calculator?"]}
					description="Anyone who needs to know how long a domain has existed before trusting it."
					columns={[
						{
							title: "Email senders",
							items: [
								"New sending domains",
								"Cold outreach domains",
								"Pre-campaign checks",
								"Agency client onboarding",
								"Subdomain planning",
								"Domain purchase checks",
								"Deliverability audits",
							],
						},
						{
							title: "Fraud & Security",
							items: [
								"Phishing domain triage",
								"Signup domain screening",
								"Vendor due diligence",
								"Lookalike domain checks",
								"Payment fraud review",
								"Abuse report triage",
								"Brand protection",
							],
						},
						{
							title: "Domain investors",
							items: [
								"Aged domain purchases",
								"Expired domain drops",
								"Registrar transfers",
								"Renewal tracking",
								"Portfolio audits",
								"Valuation research",
								"Expiry monitoring",
							],
						},
						{
							title: "SEO & Marketing",
							items: [
								"Competitor research",
								"Backlink vetting",
								"Website age checks",
								"Partner site review",
								"Affiliate vetting",
								"Guest post outreach",
								"Link building audits",
							],
						},
					]}
				/>
				<Spacer />
				<ApiIntegration
					title={["Integrate today", "in your code"]}
					description="One request returns the registration date, age, expiry and registrar for any domain. No API key or account needed."
				/>
				<Spacer />
				<McpSection
					title={["Check domain age", "from your AI agent"]}
					description="Connect Claude, Cursor, or any MCP client to Reloop and let your agent look up how old a domain is on its own."
					mcpDescription="Let Claude, Cursor, or Codex check a domain's age before they trust it."
				/>
				<Spacer edge="y" />
				<SimilarTools currentPath={toolPath} />
				<div aria-hidden className="h-12 sm:h-16" />
				<DomainAgeCta
					headlineLine1="New domain? Send safely."
					headlineLine2="Let Reloop warm it up."
					subtext="Reloop warms up new domains for you and watches for bounce and spam signals automatically. Start with 6,000 free emails per month."
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
