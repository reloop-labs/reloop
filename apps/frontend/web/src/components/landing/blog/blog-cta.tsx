import { cn } from "@reloop/ui/cn";
import { BlueprintEmailIllustration } from "@reloop/web/components/landing/blueprint-cta";
import { hostedSignupHref } from "@reloop/web/lib/site";
import Link from "next/link";
import type { ReactNode } from "react";

export type CtaAccentColor =
	| "blue"
	| "indigo"
	| "emerald"
	| "violet"
	| "amber"
	| "primary";

export type BlastColors = { light: string; dark: string };

type CategoryVariant = {
	headlineLine1?: string;
	headlineLine2?: string;
	headline?: string;
	sub: string;
	primaryLabel: string;
	secondaryLabel?: string;
	secondaryHref?: string;
};

const DEFAULT_VARIANT: CategoryVariant = {
	headlineLine1: "Ready to scale your email?",
	headlineLine2: "Let's talk.",
	sub: "3,000 free emails every month. Modern email infrastructure and deliverability built for developers.",
	primaryLabel: "Get started free",
	secondaryLabel: "Schedule call",
	secondaryHref: "https://cal.com/pranavp/30",
};

const CATEGORY_VARIANTS: Record<string, CategoryVariant> = {
	Careers: {
		headlineLine1: "Your commits are your résumé.",
		headlineLine2: "Build with us.",
		sub: "Reloop is fully open-source. Contribute code, fix bugs, or ship features, and if you're good, we'll find you.",
		primaryLabel: "Start Contributing",
		secondaryLabel: "Browse Good First Issues",
		secondaryHref: "https://github.com/reloop-labs/reloop/issues",
	},
	Engineering: {
		headlineLine1: "Ready to ship email?",
		headlineLine2: "Let's talk.",
		sub: "Drop-in SMTP + REST API. Reloop handles queuing, retries, and observability so you don't have to.",
		primaryLabel: "Start building free",
		secondaryLabel: "Schedule call",
		secondaryHref: "https://cal.com/pranavp/30",
	},
	"AI & Automation": {
		headlineLine1: "Ready to connect your agents?",
		headlineLine2: "Let's talk.",
		sub: "Fire transactional emails straight from your LLM workflows, with built-in rate limiting and full logs.",
		primaryLabel: "Try it free",
		secondaryLabel: "Schedule call",
		secondaryHref: "https://cal.com/pranavp/30",
	},
	Growth: {
		headlineLine1: "Ready to grow with email?",
		headlineLine2: "Let's talk.",
		sub: "Activation flows, re-engagement sequences, and product-led drips, all from one open-source platform.",
		primaryLabel: "Get started free",
		secondaryLabel: "Schedule call",
		secondaryHref: "https://cal.com/pranavp/30",
	},
	"Self-Hosting": {
		headlineLine1: "Ready to deploy?",
		headlineLine2: "Take full control.",
		sub: "Self-host Reloop in minutes. Full control over data, routing, and compliance, forever.",
		primaryLabel: "Deploy today",
		secondaryLabel: "View Docs",
		secondaryHref: "/docs",
	},
	Deliverability: {
		headlineLine1: "Ready to reach the inbox?",
		headlineLine2: "Let's talk.",
		sub: "Built-in SPF/DKIM/DMARC setup, IP warming guidance, and real-time deliverability signals.",
		primaryLabel: "Get started free",
		secondaryLabel: "Schedule call",
		secondaryHref: "https://cal.com/pranavp/30",
	},
	Tutorials: {
		headlineLine1: "Ready to integrate?",
		headlineLine2: "Start building today.",
		sub: "SDKs for Node.js, Python, Go, and more. Send your first email in under five minutes.",
		primaryLabel: "Start building",
		secondaryLabel: "View Docs",
		secondaryHref: "/docs",
	},
	"Open Source": {
		headlineLine1: "Ready to contribute?",
		headlineLine2: "Join the community.",
		sub: "Reloop is Apache 2.0, community-driven, and free to self-host. Star us on GitHub or start on the hosted tier.",
		primaryLabel: "Get started free",
		secondaryLabel: "GitHub Repo",
		secondaryHref: "https://github.com/reloop-labs/reloop",
	},
	Migration: {
		headlineLine1: "Ready to switch?",
		headlineLine2: "Let's talk.",
		sub: "Move from SendGrid, Mailgun, or Resend with compatible APIs, clear docs, and a free tier to test before you cut over.",
		primaryLabel: "Start migrating free",
		secondaryLabel: "Schedule call",
		secondaryHref: "https://cal.com/pranavp/30",
	},
	Comparison: {
		headlineLine1: "Ready to choose?",
		headlineLine2: "Let's talk.",
		sub: "Reloop is open source, self-hostable, and priced for builders. Compare plans and features before you commit.",
		primaryLabel: "Get started free",
		secondaryLabel: "Schedule call",
		secondaryHref: "https://cal.com/pranavp/30",
	},
	Glossary: {
		headlineLine1: "Ready to reach the inbox?",
		headlineLine2: "Let's talk.",
		sub: "Built-in SPF/DKIM/DMARC setup, IP warming guidance, and real-time deliverability signals.",
		primaryLabel: "Get started free",
		secondaryLabel: "Schedule call",
		secondaryHref: "https://cal.com/pranavp/30",
	},
};

export interface BlogCtaProps {
	id?: string;
	className?: string;
	category?: string;
	headline?: ReactNode;
	headlineLine1?: string;
	headlineLine2?: string;
	sub?: string;
	subtext?: string;
	primaryLabel?: string;
	primaryHref?: string;
	primaryExternal?: boolean;
	primaryVariant?: "neutral" | "primary";
	secondaryLabel?: string;
	secondaryHref?: string;
	secondaryExternal?: boolean;
	tertiaryLabel?: string;
	tertiaryHref?: string;
	tertiaryExternal?: boolean;
	accentColor?: CtaAccentColor;
	accentHex?: string;
	flush?: boolean;
	align?: "split" | "center";
	pill?: boolean;
	showTopRule?: boolean;
	blast?: boolean | BlastColors;
	illustrationPosition?: "left" | "right";
	insetBorder?: boolean;
}

export function BlogCta({
	id,
	className,
	category,
	headline,
	headlineLine1,
	headlineLine2,
	sub,
	subtext,
	primaryLabel,
	primaryHref = hostedSignupHref,
	primaryExternal = false,
	secondaryLabel,
	secondaryHref,
	secondaryExternal,
	tertiaryLabel,
	tertiaryHref,
	tertiaryExternal,
	flush = false,
	showTopRule = true,
	illustrationPosition = "right",
	insetBorder = true,
}: BlogCtaProps) {
	const categoryVariant = category ? CATEGORY_VARIANTS[category] : undefined;

	let resolvedHeadline1 = headlineLine1;
	let resolvedHeadline2 = headlineLine2;

	if (!resolvedHeadline1 && typeof headline === "string") {
		if (headline.includes("?")) {
			const parts = headline.split("?");
			resolvedHeadline1 = `${parts[0]}?`;
			resolvedHeadline2 = parts.slice(1).join("?").trim() || undefined;
		} else {
			resolvedHeadline1 = headline;
		}
	} else if (!resolvedHeadline1) {
		resolvedHeadline1 =
			categoryVariant?.headlineLine1 ??
			categoryVariant?.headline ??
			DEFAULT_VARIANT.headlineLine1;
		resolvedHeadline2 =
			headlineLine2 ??
			categoryVariant?.headlineLine2 ??
			DEFAULT_VARIANT.headlineLine2;
	}

	const resolvedSubtext =
		sub ?? subtext ?? categoryVariant?.sub ?? DEFAULT_VARIANT.sub;

	const resolvedPrimaryLabel =
		primaryLabel ??
		categoryVariant?.primaryLabel ??
		DEFAULT_VARIANT.primaryLabel;

	const resolvedSecondaryLabel =
		secondaryLabel ??
		categoryVariant?.secondaryLabel ??
		DEFAULT_VARIANT.secondaryLabel;

	const resolvedSecondaryHref =
		secondaryHref ??
		categoryVariant?.secondaryHref ??
		DEFAULT_VARIANT.secondaryHref ??
		"https://cal.com/pranavp/30";

	const isSecondaryExternal =
		secondaryExternal !== undefined
			? secondaryExternal
			: resolvedSecondaryHref.startsWith("http://") ||
				resolvedSecondaryHref.startsWith("https://");

	return (
		<section
			{...(id ? { id } : {})}
			className={cn(
				"w-full",
				showTopRule
					? "border-stroke-soft-200 border-t dark:border-white/10"
					: "",
				className,
			)}
		>
			<div
				className={cn(
					"mx-auto w-full px-4 py-8 sm:px-6 sm:py-12 lg:px-8",
					flush
						? ""
						: "max-w-5xl border-stroke-soft-100 md:max-w-7xl xl:border-x dark:border-white/10",
				)}
			>
				<div className="group relative mx-auto w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/20 bg-[#246BF5] px-8 py-8 transition-all duration-300 sm:rounded-[32px] sm:px-12 sm:py-10 lg:px-14 lg:py-12 dark:border-white/10 dark:bg-[#000]">
					{/* 8px Inset white border matching landing page */}
					{insetBorder ? (
						<div
							aria-hidden="true"
							className="pointer-events-none absolute inset-[8px] rounded-[20px] border border-white/25 sm:rounded-[24px] dark:border-white/10"
						/>
					) : null}

					<div className="relative z-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8 xl:gap-12">
						{/* Blueprint Email CAD Illustration */}
						<div
							className={`relative flex items-center justify-center lg:col-span-5 ${
								illustrationPosition === "left"
									? "order-2 lg:order-1 lg:justify-start"
									: "order-2 lg:order-2 lg:justify-end"
							}`}
						>
							<BlueprintEmailIllustration />
						</div>

						{/* Heading, Subtext, and Action Buttons */}
						<div
							className={`flex flex-col items-start text-left lg:col-span-7 ${
								illustrationPosition === "left"
									? "order-1 lg:order-2"
									: "order-1 lg:order-1"
							}`}
						>
							<h2 className="font-medium text-2xl text-white tracking-[-0.025em] sm:text-3xl lg:text-[32px] lg:leading-[1.2]">
								{headline && typeof headline !== "string" ? (
									headline
								) : (
									<>
										<span>{resolvedHeadline1}</span>
										{resolvedHeadline2 && (
											<>
												<br />
												<span className="font-medium text-white">
													{resolvedHeadline2}
												</span>
											</>
										)}
									</>
								)}
							</h2>

							{resolvedSubtext && (
								<p className="mt-4 max-w-lg text-[14.5px] text-white/85 leading-relaxed sm:text-[15.5px] dark:text-white/60">
									{resolvedSubtext}
								</p>
							)}

							<div className="mt-8 flex flex-wrap items-center gap-3.5 sm:mt-10">
								{/* Primary Button */}
								{primaryExternal ? (
									<a
										href={primaryHref}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-2.5 font-medium text-[#0f172a] text-[14.5px] transition-all duration-200 hover:bg-neutral-100 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-white/90"
									>
										{resolvedPrimaryLabel}
									</a>
								) : (
									<Link
										href={primaryHref}
										className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-2.5 font-medium text-[#0f172a] text-[14.5px] transition-all duration-200 hover:bg-neutral-100 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-white/90"
									>
										{resolvedPrimaryLabel}
									</Link>
								)}

								{/* Secondary Button */}
								{resolvedSecondaryLabel &&
									(isSecondaryExternal ? (
										<a
											href={resolvedSecondaryHref}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/12 px-6 py-2.5 font-medium text-[14.5px] text-white backdrop-blur-xs transition-all duration-200 hover:border-white/40 hover:bg-white/20 active:scale-[0.98] dark:border-white/15 dark:bg-white/[0.06] dark:hover:border-white/30 dark:hover:bg-white/[0.1]"
										>
											{resolvedSecondaryLabel}
										</a>
									) : (
										<Link
											href={resolvedSecondaryHref}
											className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/12 px-6 py-2.5 font-medium text-[14.5px] text-white backdrop-blur-xs transition-all duration-200 hover:border-white/40 hover:bg-white/20 active:scale-[0.98] dark:border-white/15 dark:bg-white/[0.06] dark:hover:border-white/30 dark:hover:bg-white/[0.1]"
										>
											{resolvedSecondaryLabel}
										</Link>
									))}

								{/* Tertiary Button */}
								{tertiaryLabel &&
									tertiaryHref &&
									(tertiaryExternal ? (
										<a
											href={tertiaryHref}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/12 px-6 py-2.5 font-medium text-[14.5px] text-white backdrop-blur-xs transition-all duration-200 hover:border-white/40 hover:bg-white/20 active:scale-[0.98] dark:border-white/15 dark:bg-white/[0.06] dark:hover:border-white/30 dark:hover:bg-white/[0.1]"
										>
											{tertiaryLabel}
										</a>
									) : (
										<Link
											href={tertiaryHref}
											className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/12 px-6 py-2.5 font-medium text-[14.5px] text-white backdrop-blur-xs transition-all duration-200 hover:border-white/40 hover:bg-white/20 active:scale-[0.98] dark:border-white/15 dark:bg-white/[0.06] dark:hover:border-white/30 dark:hover:bg-white/[0.1]"
										>
											{tertiaryLabel}
										</Link>
									))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
