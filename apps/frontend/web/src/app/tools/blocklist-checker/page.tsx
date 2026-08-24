import { Icon } from "@reloop/ui/icon";
import { JsonLd } from "@reloop/web/components/json-ld";
import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { createPageMetadata } from "@reloop/web/lib/metadata";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { ReactNode } from "react";
import { ApiSection } from "./api-section";
import { CheckerPanel } from "./checker-panel";
import {
	domainBlocklistCount,
	domainBlocklistNames,
	faqGroups,
	faqs,
	ipBlocklistCount,
	ipBlocklistNames,
	metaDescription,
	metaTitle,
	publicBlocklistCount,
	reasons,
	siteTitle,
	toolDescription,
	toolKeywords,
	toolPath,
} from "./content";
import { FaqGrid } from "./faq-grid";

export const instant = false;

export const metadata = createPageMetadata({
	title: metaTitle,
	description: metaDescription,
	path: toolPath,
	keywords: toolKeywords,
	ogImage: false,
});

function Band({
	children,
	className,
	id,
}: {
	children: ReactNode;
	className?: string;
	id?: string;
}) {
	return (
		<section
			id={id}
			className={`relative border-stroke-soft-200 border-b bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white ${className ?? ""}`}
		>
			<div className="mx-auto w-full max-w-5xl xl:max-w-7xl">{children}</div>
		</section>
	);
}

function SectionIntro({
	lead,
	description,
}: {
	lead: string;
	description: string;
}) {
	return (
		<div className="px-5 pt-8 pb-4 sm:px-6 sm:pt-10 sm:pb-5 md:px-8">
			<h2 className="font-semibold text-[1.65rem] text-text-strong-950 leading-tight tracking-tight sm:text-[2rem] dark:text-white">
				{lead}
			</h2>
			<p className="mt-1.5 max-w-2xl text-[14px] text-text-sub-600 leading-relaxed sm:text-[15.5px] dark:text-white/50">
				{description}
			</p>
		</div>
	);
}

export default function BlocklistCheckerPage() {
	const siteUrl = getSiteUrl();

	return (
		<>
			<JsonLd
				data={[
					{
						"@context": "https://schema.org",
						"@type": "WebApplication",
						name: `${siteTitle} | Reloop`,
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
							`${ipBlocklistCount} IP DNS blocklists (Spamhaus ZEN, Barracuda, SpamCop)`,
							`${domainBlocklistCount} domain URI lists (Spamhaus DBL, URIBL, SURBL)`,
							"Failed and refused queries reported as errors, not clean",
							"Public HTTP API, rate limited per IP",
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
				]}
			/>

			<Band className="relative overflow-hidden pt-8 sm:pt-12">
				<div className="relative px-5 pt-6 pb-10 sm:px-6 sm:pt-8 sm:pb-12 md:px-8">
					<div className="mx-auto max-w-3xl text-center">
						<span className="inline-flex items-center gap-2 rounded-full border border-stroke-soft-200 bg-bg-white-0 px-3 py-1 font-mono text-[11px] text-text-sub-600 uppercase tracking-[0.12em] dark:border-white/12 dark:bg-black dark:text-white/45">
							<span className="size-1.5 rounded-full bg-text-strong-950 dark:bg-white" />
							Free tool — no account
						</span>

						<h1 className="mt-5 font-semibold text-[2.2rem] text-text-strong-950 leading-[1.08] tracking-[-1.2px] sm:text-[3.1rem] dark:text-white">
							IP &amp; domain DNS blocklist checker
						</h1>

						<p className="mx-auto mt-3.5 max-w-xl text-[14.5px] text-text-sub-600 leading-relaxed sm:text-[16px] dark:text-white/50">
							{toolDescription}
						</p>
					</div>

					<div className="mt-7">
						<CheckerPanel />
					</div>
				</div>
			</Band>

			<Band id="why-it-matters">
				<SectionIntro
					lead="What these DNS blocklists are — and are not."
					description="They are public DNS zones of IPs and domain names, not websites we crawl. A clean result on these lists is not a promise that Gmail or Microsoft will accept the mail."
				/>
				<div className="grid grid-cols-1 divide-y divide-stroke-soft-200 border-stroke-soft-200 border-t sm:grid-cols-2 sm:divide-x sm:divide-y-0 dark:divide-white/10 dark:border-white/10">
					<div className="p-5 sm:p-6 md:px-8">
						<p className="font-semibold text-[13.5px] text-text-strong-950 tracking-tight dark:text-white">
							{ipBlocklistCount} IP DNS blocklists
						</p>
						<p className="mt-1 text-[12.5px] text-text-sub-600 dark:text-white/50">
							Queried when you enter a sending IP, or dedicated ip4:/ip6:
							addresses from SPF.
						</p>
						<ul className="mt-3 columns-1 gap-x-6 text-[12.5px] text-text-sub-600 sm:columns-2 dark:text-white/55">
							{ipBlocklistNames.map((name) => (
								<li key={name} className="break-inside-avoid py-0.5">
									{name}
								</li>
							))}
						</ul>
					</div>
					<div className="p-5 sm:p-6 md:px-8">
						<p className="font-semibold text-[13.5px] text-text-strong-950 tracking-tight dark:text-white">
							{domainBlocklistCount} domain URI lists
						</p>
						<p className="mt-1 text-[12.5px] text-text-sub-600 dark:text-white/50">
							The domain name is looked up as a DNS query. We do not crawl the
							site or treat MX as the sending IP.
						</p>
						<ul className="mt-3 text-[12.5px] text-text-sub-600 dark:text-white/55">
							{domainBlocklistNames.map((name) => (
								<li key={name} className="py-0.5">
									{name}
								</li>
							))}
						</ul>
					</div>
				</div>
			</Band>

			<Band>
				<div className="grid grid-cols-1 divide-y divide-stroke-soft-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4 dark:divide-white/10">
					{reasons.map((reason) => (
						<div
							key={reason.title}
							className="flex min-h-[10.5rem] flex-col justify-between p-5 sm:p-6 lg:p-6.5"
						>
							<Icon
								name={reason.icon}
								className="size-5 text-text-sub-600 dark:text-white/40"
							/>
							<div>
								<p className="font-semibold text-[14.5px] text-text-strong-950 tracking-tight dark:text-white">
									{reason.title}
								</p>
								<p className="mt-1 text-[12.5px] text-text-sub-600 leading-relaxed dark:text-white/50">
									{reason.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</Band>

			<Band id="api">
				<SectionIntro
					lead="Call the same lookup over HTTP."
					description={`POST an IP or domain name to the public tools endpoint. No API key. It queries the same ${publicBlocklistCount} DNS blocklists as this page.`}
				/>

				<ApiSection />
			</Band>

			<Band id="faq">
				<SectionIntro
					lead="Frequently asked questions."
					description="What a DNS blocklist is, how a domain lookup differs from a website scan, and how this differs from Gmail or Microsoft reputation."
				/>

				<FaqGrid groups={faqGroups} />
			</Band>

			<Band className="border-b-0">
				<BlogCta />
			</Band>
		</>
	);
}
