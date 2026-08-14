import { Icon, type IconName } from "@reloop/ui/icon";
import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { toolConfigs } from "@reloop/web/lib/landing/tools";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import Link from "next/link";

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

interface ToolVisualMeta {
	icon: IconName;
	badge: string;
	badgeColor: string;
	glowColor: string;
	features: string[];
}

const TOOL_VISUAL_MAP: Record<string, ToolVisualMeta> = {
	"email-validator": {
		icon: "mail-check",
		badge: "Validation",
		badgeColor:
			"bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
		glowColor: "group-hover:border-emerald-500/40",
		features: [
			"Syntax & format verification",
			"Disposable provider detection",
			"DNS MX record lookups",
		],
	},
	"deliverability-tester": {
		icon: "shield-check",
		badge: "Deliverability",
		badgeColor:
			"bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
		glowColor: "group-hover:border-blue-500/40",
		features: [
			"Spam trigger word analysis",
			"Link density & formatting scan",
			"Real-time deliverability score",
		],
	},
	"template-generator": {
		icon: "layout",
		badge: "Templates",
		badgeColor:
			"bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
		glowColor: "group-hover:border-violet-500/40",
		features: [
			"Table-based responsive HTML",
			"Outlook & Gmail compatible",
			"Ready-to-copy code snippets",
		],
	},
	"auth-checker": {
		icon: "lock",
		badge: "DNS & Auth",
		badgeColor:
			"bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
		glowColor: "group-hover:border-amber-500/40",
		features: [
			"SPF policy record check",
			"DKIM signature verification",
			"DMARC enforcement status",
		],
	},
	"subject-tester": {
		icon: "sparkles",
		badge: "Optimization",
		badgeColor:
			"bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
		glowColor: "group-hover:border-rose-500/40",
		features: [
			"Character & word count grading",
			"Mobile inbox preview length",
			"Spam & urgency signal audit",
		],
	},
	"mobile-preview": {
		icon: "device-mobile",
		badge: "Preview",
		badgeColor:
			"bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
		glowColor: "group-hover:border-indigo-500/40",
		features: [
			"iPhone & Android device frames",
			"Live interactive HTML editor",
			"Instant responsive rendering",
		],
	},
};

export default function ToolsIndexPage() {
	return (
		<div className="min-h-screen bg-[#fafafa] dark:bg-black">
			{/* Top Hero Section */}
			<div className="border-stroke-soft-200 border-b bg-white px-4 py-16 text-center sm:px-6 lg:py-20 dark:border-white/10 dark:bg-[#0a0a0a]">
				<div className="mx-auto max-w-3xl">
					<div className="mb-4 inline-flex items-center gap-2 rounded-full border border-stroke-soft-200 bg-bg-weak-50 px-3 py-1 font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.14em] dark:border-white/10 dark:bg-white/[0.05] dark:text-white/60">
						<span className="size-1.5 rounded-full bg-emerald-500" />
						Free Developer & Marketer Utilities
					</div>
					<h1 className="font-semibold text-3xl text-text-strong-950 tracking-tight sm:text-4xl lg:text-5xl dark:text-white">
						Essential email tools, 100% free
					</h1>
					<p className="mt-4 text-[16px] text-text-sub-600 leading-relaxed sm:text-[18px] dark:text-white/60">
						Zero signup required. Browser-based utilities to validate addresses,
						inspect DNS auth records, calculate deliverability scores, and preview
						responsive templates.
					</p>

					{/* Fast Highlights Bar */}
					<div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-[13px] text-text-sub-600 dark:text-white/50">
						<div className="flex items-center gap-2">
							<Icon name="check" className="size-4 text-emerald-500" />
							<span>No account required</span>
						</div>
						<div className="flex items-center gap-2">
							<Icon name="check" className="size-4 text-emerald-500" />
							<span>Instant browser evaluation</span>
						</div>
						<div className="flex items-center gap-2">
							<Icon name="check" className="size-4 text-emerald-500" />
							<span>Production-grade heuristics</span>
						</div>
					</div>
				</div>
			</div>

			{/* Tools Grid */}
			<div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{toolConfigs.map((tool) => {
						const visual = TOOL_VISUAL_MAP[tool.slug] ?? {
							icon: "zap" as IconName,
							badge: "Tool",
							badgeColor:
								"bg-neutral-500/10 text-neutral-700 dark:text-neutral-400 border-neutral-500/20",
							glowColor: "group-hover:border-primary-base/40",
							features: [],
						};
						const title = tool.titleLines.join(" ");

						return (
							<Link
								key={tool.path}
								href={tool.path}
								className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-stroke-soft-200 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-[#0d0d0f] ${visual.glowColor}`}
							>
								<div>
									<div className="flex items-center justify-between gap-3">
										<div className="flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-weak-50 text-text-strong-950 transition-colors group-hover:bg-primary-base group-hover:text-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:group-hover:bg-primary-base">
											<Icon name={visual.icon} className="size-5" />
										</div>
										<span
											className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold text-[10px] uppercase tracking-wider ${visual.badgeColor}`}
										>
											{visual.badge}
										</span>
									</div>

									<h2 className="mt-4 font-semibold text-[18px] text-text-strong-950 tracking-tight transition-colors group-hover:text-primary-base dark:text-white dark:group-hover:text-primary-base">
										{title}
									</h2>
									<p className="mt-2 line-clamp-3 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/55">
										{tool.description}
									</p>

									{visual.features.length > 0 && (
										<ul className="mt-4 space-y-2 border-stroke-soft-200/80 border-t pt-4 text-[12.5px] text-text-sub-600 dark:border-white/10 dark:text-white/50">
											{visual.features.map((feature) => (
												<li key={feature} className="flex items-center gap-2">
													<Icon
														name="check"
														className="size-3.5 shrink-0 text-emerald-500"
													/>
													<span>{feature}</span>
												</li>
											))}
										</ul>
									)}
								</div>

								<div className="mt-6 flex items-center justify-between border-stroke-soft-200/80 border-t pt-4 dark:border-white/10">
									<span className="font-semibold text-[13px] text-primary-base">
										Launch tool
									</span>
									<span className="text-[13px] text-primary-base transition-transform group-hover:translate-x-1">
										→
									</span>
								</div>
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
