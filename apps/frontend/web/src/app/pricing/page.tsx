import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
	SectionHeading,
} from "@reloop/web/components/page-shell";
import { getSiteUrl, hostedSignupHref } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { PricingFaq } from "./components/pricing-faq";
import { PricingSection } from "./components/pricing-section";

const siteUrl = getSiteUrl();
const pricingPageUrl = `${siteUrl}/pricing`;

export const metadata: Metadata = {
	title: "Pricing | Reloop",
	description:
		"Simple, transparent email pricing. Start free with 3,000 emails per month. Scale on Pro, Scale, or Enterprise—hosted or self-hosted.",
	openGraph: {
		title: "Pricing | Reloop",
		description:
			"Simple, transparent email pricing. Start free with 3,000 emails per month.",
		type: "website",
		url: pricingPageUrl,
		siteName: "Reloop",
	},
	alternates: {
		canonical: pricingPageUrl,
	},
};

const PricingPage = () => {
	return (
		<MarketingPageShell
			titleLines={["Simple, transparent", "pricing."]}
			description="Start free with 3,000 emails per month. Scale when you need to—same fair pricing whether Reloop hosts your stack or you self-host."
			primaryCta={{ label: "Get started", href: hostedSignupHref }}
			secondaryCta={{
				label: "Self-hosting guide",
				href: "/resources/self-hosting-guide",
			}}
			compactHero
		>
			<PageSection flushTop>
				<PricingSection />
			</PageSection>

			<PageSection alt narrow>
				<div className="mx-auto max-w-3xl text-center">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
						Pricing parity
					</p>
					<h2 className="mt-3 font-serif text-[2rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[2.6rem] dark:text-white">
						Hosted or self-hosted,{" "}
						<span className="text-primary-base">same philosophy.</span>
					</h2>
					<p className="mx-auto mt-4 max-w-2xl text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
						Reloop is open source. Use our hosted service or deploy on your own
						infrastructure—no opaque platform fees for choosing how you run
						email.
					</p>
					<div className="mt-8 flex flex-wrap items-center justify-center gap-4">
						<Link
							href={hostedSignupHref}
							className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#0a0d12] px-8 font-semibold text-[15px] text-white transition-colors hover:bg-[#0a0d12]/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
						>
							Start hosted
						</Link>
						<Link
							href="/resources/self-hosting-guide"
							className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#0a0d12]/10 px-8 font-semibold text-[#0a0d12] text-[15px] transition-colors hover:bg-[#0a0d12]/10 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
						>
							Self-hosting guide
						</Link>
					</div>
				</div>
			</PageSection>

			<PageSection narrow>
				<SectionHeading
					title="Every plan includes"
					description="Core email infrastructure—no feature gating on the essentials."
					compact
				/>
				<div className="grid gap-4 sm:grid-cols-2">
					{[
						"Transactional & campaign email",
						"SMTP relay & REST API",
						"Webhooks & delivery events",
						"Email analytics & logs",
						"Agent inbox & AI workflows",
						"Custom domains & DKIM",
					].map((item) => (
						<div
							key={item}
							className="flex items-center gap-3 rounded-2xl border border-stroke-soft-200 px-5 py-4 dark:border-white/10"
						>
							<span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-base/10 text-primary-base">
								<svg
									width="12"
									height="12"
									viewBox="0 0 12 12"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									aria-hidden
								>
									<path d="M2 6l3 3 5-5" />
								</svg>
							</span>
							<span className="font-medium text-[15px] text-text-strong-950 dark:text-white">
								{item}
							</span>
						</div>
					))}
				</div>
			</PageSection>

			<PricingFaq />

			<FeatureCta
				title="3,000 emails for free"
				titleMuted="per month."
				description="No credit card required. Join developers building the future of email on Reloop—hosted or self-hosted."
				primary={{ label: "Get started", href: hostedSignupHref }}
				secondary={{
					label: "Talk to us",
					href: "/company/contact-us",
				}}
				compact
			/>
		</MarketingPageShell>
	);
};

export default PricingPage;
