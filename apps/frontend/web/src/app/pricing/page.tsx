import { JsonLd } from "@reloop/web/components/json-ld";
import { pricingFaqItems } from "@reloop/web/lib/pricing-faq";
import { faqPageJsonLd, pricingProductJsonLd } from "@reloop/web/lib/schema";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { PricingExplorer } from "./components/pricing-explorer";
import { PricingFaq } from "./components/pricing-faq";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const siteUrl = getSiteUrl();
const pricingPageUrl = `${siteUrl}/pricing`;
const pricingDescription =
	"Scale your email, control your costs. Start free with 3,000 emails per month (200/day). Upgrade to Individual $10, Startup $20, or Enterprise—or self-host with no Reloop license fee.";

export const metadata: Metadata = {
	title: "Pricing | Reloop",
	description: pricingDescription,
	keywords: [
		"email pricing",
		"email API pricing",
		"free email API",
		"email service pricing",
		"affordable email platform",
		"open source email pricing",
		"self-hosted email cost",
	],
	openGraph: {
		title: "Pricing | Reloop",
		description: pricingDescription,
		type: "website",
		url: pricingPageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Pricing | Reloop",
		description: pricingDescription,
	},
	alternates: {
		canonical: pricingPageUrl,
	},
};

const pricingSchema = [
	pricingProductJsonLd(siteUrl),
	faqPageJsonLd(pricingFaqItems),
];

const PricingPage = () => {
	return (
		<>
			<JsonLd data={pricingSchema} />
			<div className="mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<header className="relative flex w-full flex-col items-center overflow-hidden bg-transparent px-6 pt-[224px] pb-40 text-center sm:px-8 lg:px-12">
					{/* Square grid background */}
					<div aria-hidden className="pointer-events-none absolute inset-0">
						<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:80px_80px] dark:bg-[linear-gradient(to_right,#ffffff0f_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0f_1px,transparent_1px)]" />
					</div>
					<div className="relative z-10 flex w-auto max-w-full flex-col items-center border border-stroke-soft-100 bg-bg-white-0 px-8 py-6 dark:border-white/10 dark:bg-black">
						<div className="mb-5 flex items-center justify-center gap-2 sm:mb-6">
							<span
								aria-hidden
								className="inline-flex size-5 shrink-0 items-center justify-center rounded-[5px] bg-primary-dark p-px pb-[2px] dark:bg-[#003a8c]"
							>
								<span className="flex size-full items-center justify-center rounded-[4px] bg-primary-base text-white shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]">
									<span className="font-semibold text-[11px] text-white leading-none">
										$
									</span>
								</span>
							</span>
							<span className="font-medium text-[13.5px] text-text-strong-950 tracking-tight dark:text-white">
								Transparency
							</span>
						</div>

						<h1 className="max-w-3xl text-balance text-center font-semibold text-[2.5rem] text-text-strong-950 leading-[1.06] tracking-[-0.04em] sm:text-[3.5rem] lg:text-[4.25rem] dark:text-white">
							Flexible{" "}
							<span className="bg-gradient-to-b from-[#2f86ff] to-primary-base bg-clip-text text-transparent dark:from-[#7ab8ff] dark:to-[#4ea1ff]">
								pricing.
							</span>
						</h1>

						<p className="mt-5 max-w-[46rem] text-balance text-center text-[16.5px] text-text-sub-600 leading-relaxed sm:mt-6 sm:text-[18.5px] lg:text-[20px] dark:text-white/60">
							Start for free, then scale as you grow.
						</p>
					</div>
				</header>

				<PricingExplorer />

				<PricingFaq />
			</div>
		</>
	);
};

export default PricingPage;
