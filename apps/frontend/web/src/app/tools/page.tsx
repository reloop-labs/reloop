import { Icon } from "@reloop/ui/icon";
import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { toolConfigs } from "@reloop/web/lib/landing/tools";
import Link from "next/link";
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
		<div className="mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-100 border-x [--primary-base:#10b981] [--primary-dark:#059669] [--primary-darker:#047857] [--primary-link:#059669] md:max-w-7xl dark:border-white/10 dark:[--primary-base:#6ee7b7] dark:[--primary-dark:#6ee7b7] dark:[--primary-darker:#a7f3d0] dark:[--primary-link:#6ee7b7]">
			{/* Hero Section — matches pricing / why-open-source */}
			<header className="relative flex w-full flex-col items-center overflow-hidden bg-transparent px-6 pt-[224px] pb-40 text-center sm:px-8 lg:px-12">
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
							className="inline-flex size-5 shrink-0 items-center justify-center rounded-[5px] bg-primary-dark p-px pb-[2px] dark:bg-[#065f46]"
						>
							<span className="flex size-full items-center justify-center rounded-[4px] bg-primary-base text-white shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:text-black dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]">
								<Icon name="zap" className="size-[11px]" />
							</span>
						</span>
						<span className="font-medium text-[13.5px] text-text-strong-950 tracking-tight dark:text-white">
							Free Tools
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
						Zero signup required. Validate addresses, inspect DNS auth records,
						score deliverability, and preview templates.
					</p>
				</div>
			</header>

			{/* Tools Grid — minimal Firecrawl-style cards */}
			<div className="w-full px-6 py-12 sm:px-8 lg:px-12 lg:py-16">
				<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{toolConfigs.map((tool) => {
						const title = tool.titleLines.join(" ");

						return (
							<Link
								key={tool.path}
								href={tool.path}
								className="group hover:-translate-y-0.5 rounded-[20px] border border-stroke-soft-200 bg-white p-8 transition-all duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
							>
								<h2 className="font-medium text-[18px] text-text-strong-950 tracking-tight dark:text-white">
									{title}
								</h2>
								<p className="mt-2 line-clamp-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/55">
									{tool.description}
								</p>
							</Link>
						);
					})}
				</div>
			</div>

			{/* Global Upsell / Platform CTA */}
			<BlogCta
				category="Deliverability"
				headline="Ready for an email platform built for scale?"
				sub="Send transactional & marketing emails with high deliverability, drop-in SDKs, and deep observability. Free forever to get started."
				primaryLabel="Start sending free"
				secondaryLabel="Documentation"
			/>
		</div>
	);
}
