import { BlueprintCta } from "@reloop/web/components/landing/blueprint-cta";
import { createPageMetadata } from "@reloop/web/lib/metadata";
import { ToolsGrid } from "./components/tools-grid";

export const instant = false;

// createLandingMetadata always attaches the site-wide image; this page has its own.
export const metadata = createPageMetadata({
	title: "Free Email & Developer Tools",
	description:
		"Zero-setup online utilities to validate email addresses, analyze deliverability, test subject lines, check SPF/DKIM/DMARC DNS records, generate responsive templates, and preview mobile rendering.",
	path: "/tools",
	keywords: [
		"free email tools",
		"email validator",
		"deliverability tester",
		"SPF checker",
		"DKIM checker",
		"DMARC lookup",
		"subject line tester",
		"email template generator",
		"mobile email preview",
	],
	ogImage: false,
});

export default function ToolsIndexPage() {
	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-100 border-x [--primary-base:#171717] [--primary-dark:#000000] [--primary-darker:#000000] [--primary-link:#171717] md:max-w-7xl dark:border-white/10 dark:[--primary-base:#ffffff] dark:[--primary-dark:#ffffff] dark:[--primary-darker:#e6edf3] dark:[--primary-link:#ffffff]">
			{/* Hero, same structure as the tool page heroes */}
			<header className="relative mt-14 w-full min-[1280px]:mt-[72px]">
				<div
					aria-hidden
					className="h-10 border-stroke-soft-100 border-t sm:h-24 dark:border-white/10"
				/>
				<div className="flex flex-col items-start border-stroke-soft-100 border-b px-4 pt-0 pb-16 text-left sm:items-center sm:px-8 sm:pb-20 sm:text-center lg:px-12 dark:border-white/10">
					<h1 className="max-w-4xl text-balance font-semibold text-[2rem] text-text-strong-950 leading-[1.06] tracking-[-0.04em] sm:text-[3.5rem] lg:text-[4.1rem] dark:text-white">
						Free email tools <br className="hidden sm:block" />
						by Reloop
					</h1>

					<p className="mt-4 max-w-[40rem] text-balance text-[15px] text-text-sub-600 leading-relaxed sm:mt-6 sm:text-[18.5px] dark:text-white/60">
						Validate addresses, check DNS and authentication, and design
						templates. No signup, free forever.
					</p>
				</div>
			</header>

			{/* Tools Grid */}
			<ToolsGrid />

			{/* Global Upsell / Platform CTA, same as temp-email-checker */}
			<BlueprintCta
				headlineLine1="Start sending email today"
				headlineLine2="$0 / mo."
				subtext="No credit card required. 3,000 emails for free."
				primaryLabel="Get started free"
				secondaryLabel="Talk to founder"
				className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
			/>
		</div>
	);
}
