import { Icon } from "@reloop/ui/icon";
import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { hostedSignupHref } from "@reloop/web/lib/site";
import { Check } from "lucide-react";
import { ToolsGrid } from "./components/tools-grid";
import { ToolsHeroBlast } from "./components/tools-hero-blast";

export const instant = false;

export const metadata = createLandingMetadata(
	"Free Email & Developer Tools",
	"Zero-setup online utilities to validate email addresses, analyze deliverability, test subject lines, check SPF/DKIM/DMARC DNS records, generate responsive templates, and preview mobile rendering.",
	"/tools",
	[
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
);

export default function ToolsIndexPage() {
	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-100 border-x [--primary-base:#2563eb] [--primary-dark:#1d4ed8] [--primary-darker:#1e40af] [--primary-link:#1d4ed8] md:max-w-7xl dark:border-white/10 dark:[--primary-base:#60a5fa] dark:[--primary-dark:#3b82f6] dark:[--primary-darker:#2563eb] dark:[--primary-link:#93c5fd]">
			{/* Hero Section — matches pricing / why-open-source */}
			<header className="relative flex w-full flex-col items-center overflow-hidden bg-transparent px-6 pt-[224px] pb-28 text-center sm:px-8 sm:pb-36 lg:px-12">
				<div
					aria-hidden="true"
					className="absolute inset-0 [-webkit-mask-image:linear-gradient(to_right,black_0%,black_28%,transparent_42%,transparent_58%,black_72%,black_100%)] [mask-image:linear-gradient(to_right,black_0%,black_28%,transparent_42%,transparent_58%,black_72%,black_100%)]"
				>
					<ToolsHeroBlast />
				</div>
				<div className="relative z-10 flex w-auto max-w-full flex-col items-center px-8 py-6">
					<div className="mb-5 flex items-center justify-center gap-2 sm:mb-6">
						<span
							aria-hidden
							className="inline-flex size-5 shrink-0 items-center justify-center rounded-[5px] bg-primary-dark p-px pb-[2px] dark:bg-[#1e3a8a]"
						>
							<span className="flex size-full items-center justify-center rounded-[4px] bg-primary-base text-white shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:text-white dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]">
								<Icon name="zap" className="size-[11px]" />
							</span>
						</span>
						<span className="font-medium text-[13.5px] text-text-strong-950 tracking-tight dark:text-white">
							Tools
						</span>
					</div>

					<h1 className="max-w-3xl text-balance text-center font-semibold text-[2.5rem] text-text-strong-950 leading-[1.06] tracking-[-0.04em] sm:text-[3.5rem] lg:text-[4.25rem] dark:text-white">
						Free{" "}
						<span className="bg-gradient-to-b from-primary-base to-primary-base bg-clip-text text-transparent">
							email tools
						</span>
						<br className="hidden sm:block" /> by{" "}
						<span className="bg-gradient-to-b from-primary-base to-primary-base bg-clip-text text-transparent">
							Reloop
						</span>
					</h1>

					<div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:mt-7">
						<span className="inline-flex items-center gap-2 rounded-full border border-stroke-soft-200 bg-bg-white-0 px-3.5 py-1.5 font-medium text-[13px] text-text-sub-600 shadow-2xs dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70">
							<Check
								className="size-3.5 text-blue-600 dark:text-blue-400"
								strokeWidth={2.5}
							/>
							No sign up required
						</span>
						<span className="inline-flex items-center gap-2 rounded-full border border-stroke-soft-200 bg-bg-white-0 px-3.5 py-1.5 font-medium text-[13px] text-text-sub-600 shadow-2xs dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70">
							<Check
								className="size-3.5 text-blue-600 dark:text-blue-400"
								strokeWidth={2.5}
							/>
							Free for lifetime
						</span>
					</div>
				</div>
			</header>

			{/* Tools Grid */}
			<ToolsGrid />

			{/* Global Upsell / Platform CTA */}
			<div className="border-stroke-soft-100 border-t dark:border-white/10">
				<BlogCta
					headline={
						<span className="block font-semibold text-[3rem] leading-[1.04] tracking-[-0.04em] sm:text-[4.25rem] lg:text-[5.25rem]">
							Start now
							<br />
							<span className="text-primary-base">$0 / mo.</span>
						</span>
					}
					sub="No credit card required. 3,000 emails for free."
					primaryLabel="Get started"
					primaryHref={hostedSignupHref}
					primaryVariant="primary"
					secondaryLabel="View pricing"
					secondaryHref="/pricing"
					accentColor="blue"
					blast={{ light: "#2563eb", dark: "#93c5fd" }}
					flush
					align="center"
					pill={false}
					showTopRule={false}
				/>
			</div>
		</div>
	);
}
