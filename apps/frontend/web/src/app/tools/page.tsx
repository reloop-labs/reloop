import { Icon } from "@reloop/ui/icon";
import { BlueprintCta } from "@reloop/web/components/landing/blueprint-cta";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
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
		<div className="mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-100 border-x [--primary-base:#2563eb] [--primary-dark:#1d4ed8] [--primary-darker:#1e40af] [--primary-link:#1d4ed8] md:max-w-7xl dark:border-white/10 dark:[--primary-base:#ffffff] dark:[--primary-dark:#ffffff] dark:[--primary-darker:#e6edf3] dark:[--primary-link:#ffffff]">
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
							className="inline-flex size-5 shrink-0 items-center justify-center rounded-[5px] bg-primary-dark p-px pb-[2px] dark:bg-[#30363d]"
						>
							<span className="flex size-full items-center justify-center rounded-[4px] bg-primary-base text-white shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:text-black dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]">
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

					<p className="mt-5 max-w-[46rem] text-balance text-center text-[16.5px] text-text-sub-600 leading-relaxed sm:mt-6 sm:text-[18.5px] lg:text-[20px] dark:text-white/60">
						No sign up required · Free for lifetime
					</p>
				</div>
			</header>

			{/* Tools Grid */}
			<ToolsGrid />

			{/* Global Upsell / Platform CTA — same as temp-email-checker */}
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
