import { Icon } from "@reloop/ui/icon";
import { FaqSection } from "@reloop/web/components/faq-section";
import { JsonLd } from "@reloop/web/components/json-ld";
import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { createPageMetadata } from "@reloop/web/lib/metadata";
import { getSiteUrl } from "@reloop/web/lib/site";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { SimilarTools } from "../temp-email-checker/components/similar-tools";
import { CheckerPanel } from "./checker-panel";
import { ApiIntegration } from "./components/api-integration";
import { DomainAgeCta } from "./components/domain-age-cta";
import { WarmupSchedule } from "./components/warmup-schedule";
import { WhyDomainAgeMatters } from "./components/why-domain-age-matters";
import {
	faqGroups,
	faqs,
	metaDescription,
	reasons,
	toolDescription,
	toolKeywords,
	toolPath,
	toolTitle,
} from "./content";
export const instant = false;

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
			ogImage: "/tools/opengraph-image",
		});
	}

	return createPageMetadata({
		title: `${domain} — Domain Age, Registration Date & Warmup Check`,
		description: `How old is ${domain}? Check its registration date, warmup stage (Too New → Established) and email deliverability risk — free, no sign-up.`,
		path: toolPath,
		keywords: toolKeywords,
		ogImage: `/tools/domain-age/og/${encodeURIComponent(domain)}/opengraph-image`,
	});
}

export default function DomainAgePage() {
	const siteUrl = getSiteUrl();

	return (
		<div className="relative min-h-screen overflow-x-clip bg-bg-white-0 font-sans text-text-strong-950 [--primary-base:#2563eb] [--primary-dark:#1d4ed8] [--primary-darker:#1e40af] [--primary-link:#1d4ed8] dark:bg-black dark:text-white dark:[--primary-base:#ffffff] dark:[--primary-dark:#ffffff] dark:[--primary-darker:#e6edf3] dark:[--primary-link:#ffffff]">
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
							"Official RDAP domain registration age query",
							"Newly registered domain (NRD) spam filter risk detection",
							"Visual domain warmup progress timeline (Too New, Cold, Warming, Established)",
							"SPF and DMARC email authentication readiness audit",
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
						name: "How to check your domain age for email deliverability",
						description:
							"Check any domain registration date and warmup stage using the free Reloop Domain Age Checker.",
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
								text: "See the exact registration date pulled from RDAP, more reliable than WHOIS.",
							},
							{
								"@type": "HowToStep",
								position: 3,
								name: "Check warmup stage",
								text: "See whether your domain is Too New, Cold, Warming, or Established.",
							},
							{
								"@type": "HowToStep",
								position: 4,
								name: "Review SPF and DMARC",
								text: "Verify email authentication records are published before sending.",
							},
						],
					},
				]}
			/>

			<div className="relative w-full overflow-hidden">
				<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
					<header className="relative flex w-full flex-col items-center bg-transparent px-6 pt-[224px] pb-16 text-center sm:px-8 sm:pb-20 lg:px-12 lg:pb-24">
						<div className="relative z-10 flex w-auto max-w-full flex-col items-center px-8 py-6">
							<Link
								href="/tools"
								className="mb-5 flex items-center justify-center gap-2 sm:mb-6"
							>
								<span
									aria-hidden
									className="inline-flex size-5 shrink-0 items-center justify-center rounded-[5px] bg-primary-dark p-px pb-[2px] dark:bg-[#30363d]"
								>
									<span className="flex size-full items-center justify-center rounded-[4px] bg-primary-base text-white shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:text-black dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]">
										<Icon name="shield-check" className="size-[11px]" />
									</span>
								</span>
								<span className="font-medium text-[13.5px] text-text-strong-950 tracking-tight underline decoration-dotted underline-offset-4 dark:text-white">
									Free Tools
								</span>
							</Link>
							<h1 className="max-w-3xl text-balance text-center font-semibold text-[2.5rem] text-text-strong-950 leading-[1.06] tracking-[-0.04em] sm:text-[3.5rem] lg:text-[4.25rem] dark:text-white">
								Free{" "}
								<span className="bg-gradient-to-b from-primary-base to-primary-base bg-clip-text text-transparent">
									Domain Age
								</span>{" "}
								& Warmup Checker
							</h1>
							<p className="mt-5 max-w-[46rem] text-balance text-center text-[13px] text-text-sub-600 leading-relaxed sm:mt-6 sm:text-base dark:text-white/60">
								{toolDescription}
							</p>
							<div
								id="checker"
								className="mt-10 w-full max-w-xl scroll-mt-24 text-left sm:mt-12"
							>
								<CheckerPanel />
							</div>
						</div>
					</header>
				</div>
			</div>

			<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<div
					aria-hidden
					className="h-24 border-stroke-soft-100 border-b dark:border-white/10"
				/>
				<WhyDomainAgeMatters />
				<div
					aria-hidden
					className="h-24 border-stroke-soft-100 border-b dark:border-white/10"
				/>
				<WarmupSchedule />
				<div
					aria-hidden
					className="h-24 border-stroke-soft-100 border-b dark:border-white/10"
				/>
				<ApiIntegration />
				<div
					aria-hidden
					className="h-24 border-stroke-soft-100 border-b dark:border-white/10"
				/>
				<SimilarTools />
				<div aria-hidden className="h-12 sm:h-16" />
				<DomainAgeCta
					headlineLine1="Stop warming up manually."
					headlineLine2="Let's talk."
					subtext={
						"Reloop handles your domain warmup and watches for bounce and spam signals automatically. Start with 3,000 free emails per month."
					}
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
				<div aria-hidden className="h-12 sm:h-16" />
				<BlogCta />
				<div aria-hidden className="h-12 sm:h-16" />
			</div>
		</div>
	);
}
