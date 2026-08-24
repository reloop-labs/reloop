import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { Icon } from "@reloop/ui/icon";
import type { Metadata } from "next";
import { ApiSection } from "./api-section";
import { CheckerPanel } from "./checker-panel";
import {
	faqGroups,
	metaDescription,
	metaTitle,
	reasons,
	siteTitle,
	toolDescription,
} from "./content";
import { FaqGrid } from "./faq-grid";

export const metadata: Metadata = {
	title: metaTitle,
	description: metaDescription,
	keywords: [
		"email blocklist checker",
		"dnsbl lookup",
		"ip blacklist checker",
		"spamhaus check",
		"barracuda rbl check",
		"email deliverability diagnostic",
		"rbl lookup",
	],
	alternates: {
		canonical: "https://reloop.sh/tools/blocklist-checker",
	},
	openGraph: {
		title: metaTitle,
		description: metaDescription,
		url: "https://reloop.sh/tools/blocklist-checker",
		siteName: "Reloop",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: metaTitle,
		description: metaDescription,
	},
};

function Band({
	children,
	className,
	id,
}: {
	children: React.ReactNode;
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
		<div className="px-5 pt-8 pb-4 sm:px-6 md:px-8 sm:pt-10 sm:pb-5">
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
	const structuredData = {
		"@context": "https://schema.org",
		"@type": "WebApplication",
		name: siteTitle,
		description: metaDescription,
		applicationCategory: "BusinessApplication",
		operatingSystem: "All",
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "USD",
		},
		featureList: [
			"Real-time DNSBL query across 20+ major security databases",
			"Spamhaus ZEN, Barracuda, SpamCop, and SORBS support",
			"Automated MX and A record IP resolution",
			"Direct official delisting links",
			"Public HTTP API for CI/CD and automated monitoring",
		],
	};

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
			/>

			{/* Hero & Interactive Search Panel */}
			<Band className="relative overflow-hidden pt-8 sm:pt-12">
				<div className="relative px-5 pt-6 pb-10 sm:px-6 sm:pt-8 sm:pb-12 md:px-8">
					<div className="mx-auto max-w-3xl text-center">
						<span className="inline-flex items-center gap-2 rounded-full border border-stroke-soft-200 bg-bg-white-0 px-3 py-1 font-mono text-[11px] text-text-sub-600 uppercase tracking-[0.12em] dark:border-white/12 dark:bg-black dark:text-white/45">
							<span className="size-1.5 rounded-full bg-text-strong-950 dark:bg-white" />
							Free tool — no account
						</span>

						<h1 className="mt-5 font-semibold text-[2.2rem] text-text-strong-950 leading-[1.08] tracking-[-1.2px] sm:text-[3.1rem] dark:text-white">
							Email Domain &amp; IP Blocklist Checker
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

			{/* Section: Why Blocklists Matter */}
			<Band id="why-it-matters">
				<SectionIntro
					lead="Why checking global blocklists protects your reputation."
					description="Being listed on major DNSBL databases causes mailbox providers like Gmail and Microsoft 365 to immediately reject or junk your outbound emails."
				/>
			</Band>

			<Band>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-stroke-soft-200 dark:divide-white/10">
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

			{/* Section: Programmatic API Integration */}
			<Band id="api">
				<SectionIntro
					lead="Automate blocklist checks via code."
					description="Integrate real-time IP and domain reputation lookups into your CI/CD pipelines, staging environments, and monitoring alerts."
				/>

				<ApiSection />
			</Band>

			{/* Section: FAQs */}
			<Band id="faq">
				<SectionIntro
					lead="Frequently asked questions."
					description="Answers to common questions regarding email blacklists, DNSBL zones, and reputation recovery."
				/>

				<FaqGrid groups={faqGroups} />
			</Band>

			{/* Bottom CTA */}
			<Band className="border-b-0">
				<BlogCta />
			</Band>
		</>
	);
}
