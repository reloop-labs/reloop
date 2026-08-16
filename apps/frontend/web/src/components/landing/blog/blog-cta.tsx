import { CtaLink } from "@reloop/web/components/landing/cta";
import type { ReactNode } from "react";

type CategoryVariant = {
	headline: string;
	sub: string;
	primaryLabel: string;
	secondaryLabel?: string;
};

const DEFAULT_VARIANT: CategoryVariant = {
	headline: "Ship your first email in minutes",
	sub: "Open-source, deliverability-focused, and yours to self-host or run on Reloop Cloud. No lock-in, no rewrite later.",
	primaryLabel: "Get started free",
};

const CATEGORY_VARIANTS: Record<string, CategoryVariant> = {
	Careers: {
		headline: "Your commits are your résumé.",
		sub: "Reloop is fully open-source. Contribute code, fix bugs, or ship features — and if you're good, we'll find you.",
		primaryLabel: "Start Contributing",
		secondaryLabel: "Browse Good First Issues",
	},
	Engineering: {
		headline: "Ready to ship email?",
		sub: "Drop-in SMTP + REST API. Reloop handles queuing, retries, and observability so you don't have to.",
		primaryLabel: "Start building free",
	},
	"AI & Automation": {
		headline: "Ready to connect your agents?",
		sub: "Fire transactional emails straight from your LLM workflows — with built-in rate limiting and full logs.",
		primaryLabel: "Try it free",
	},
	Growth: {
		headline: "Ready to grow with email?",
		sub: "Activation flows, re-engagement sequences, and product-led drips — all from one open-source platform.",
		primaryLabel: "Get started free",
	},
	"Self-Hosting": {
		headline: "Ready to deploy?",
		sub: "Self-host Reloop in minutes. Full control over data, routing, and compliance — forever.",
		primaryLabel: "Deploy today",
	},
	Deliverability: {
		headline: "Ready to reach the inbox?",
		sub: "Built-in SPF/DKIM/DMARC setup, IP warming guidance, and real-time deliverability signals.",
		primaryLabel: "Get started free",
	},
	Tutorials: {
		headline: "Ready to integrate?",
		sub: "SDKs for Node.js, Python, Go, and more. Send your first email in under five minutes.",
		primaryLabel: "Start building",
	},
	"Open Source": {
		headline: "Ready to contribute?",
		sub: "Reloop is MIT-licensed, community-driven, and free to self-host. Star us on GitHub or start on the hosted tier.",
		primaryLabel: "Get started free",
	},
	Migration: {
		headline: "Ready to switch?",
		sub: "Move from SendGrid, Mailgun, or Resend with compatible APIs, clear docs, and a free tier to test before you cut over.",
		primaryLabel: "Start migrating free",
	},
	Comparison: {
		headline: "Ready to choose?",
		sub: "Reloop is open source, self-hostable, and priced for builders — compare plans and features before you commit.",
		primaryLabel: "Get started free",
	},
	Glossary: {
		headline: "Ready to reach the inbox?",
		sub: "Built-in SPF/DKIM/DMARC setup, IP warming guidance, and real-time deliverability signals.",
		primaryLabel: "Get started free",
	},
};

export type CtaAccentColor =
	| "blue"
	| "indigo"
	| "emerald"
	| "violet"
	| "amber"
	| "primary";

type Rgb = [number, number, number];

const ACCENT_RGB: Record<CtaAccentColor, { primary: Rgb; secondary: Rgb }> = {
	blue: { primary: [56, 189, 248], secondary: [99, 102, 241] },
	indigo: { primary: [129, 140, 248], secondary: [192, 132, 252] },
	emerald: { primary: [52, 211, 153], secondary: [45, 212, 191] },
	violet: { primary: [167, 139, 250], secondary: [232, 121, 249] },
	amber: { primary: [251, 191, 36], secondary: [251, 146, 60] },
	primary: { primary: [0, 111, 254], secondary: [56, 189, 248] },
};

function rgba(rgb: Rgb, alpha: number): string {
	return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

function atmosphere(primary: Rgb, secondary: Rgb) {
	return {
		glow: `radial-gradient(ellipse 110% 160% at 82% 100%, ${rgba(primary, 0.3)} 0%, transparent 62%)`,
		glowAlt: `radial-gradient(ellipse 90% 140% at 6% 0%, ${rgba(secondary, 0.22)} 0%, transparent 60%)`,
		line: rgba(primary, 0.16),
	};
}

function normalizeHex(hex: string): string {
	return hex.replace("#", "").toUpperCase();
}

function hexToRgb(hex: string): Rgb {
	const h = normalizeHex(hex);
	return [
		Number.parseInt(h.slice(0, 2), 16),
		Number.parseInt(h.slice(2, 4), 16),
		Number.parseInt(h.slice(4, 6), 16),
	];
}

function isDimHex(hex: string): boolean {
	const [r, g, b] = hexToRgb(hex);
	if (normalizeHex(hex) === "000000" || normalizeHex(hex) === "000") {
		return true;
	}
	return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.25;
}

/** Black brand marks need a lift so the bloom still reads. */
function glowRgb(hex: string): Rgb {
	return isDimHex(hex) ? [212, 212, 216] : hexToRgb(hex);
}

const CATEGORY_ACCENTS: Record<string, CtaAccentColor> = {
	Engineering: "indigo",
	"AI & Automation": "blue",
	Growth: "emerald",
	"Self-Hosting": "violet",
	Deliverability: "amber",
	Tutorials: "blue",
	"Open Source": "indigo",
	Migration: "emerald",
	Comparison: "blue",
	Glossary: "amber",
};

export function BlogCta({
	category,
	headline,
	sub,
	primaryLabel,
	primaryHref = "/dashboard/signup",
	primaryExternal,
	secondaryLabel,
	secondaryHref = "/docs",
	secondaryExternal,
	tertiaryLabel,
	tertiaryHref,
	tertiaryExternal,
	accentColor,
	accentHex,
	flush = false,
	align = "split",
	pill = true,
	showTopRule = true,
}: {
	category?: string;
	headline?: ReactNode;
	sub?: string;
	primaryLabel?: string;
	primaryHref?: string;
	primaryExternal?: boolean;
	secondaryLabel?: string;
	secondaryHref?: string;
	secondaryExternal?: boolean;
	tertiaryLabel?: string;
	tertiaryHref?: string;
	tertiaryExternal?: boolean;
	accentColor?: CtaAccentColor;
	/** Brand hex (e.g. NestJS red) — tints the CTA glow and lines */
	accentHex?: string;
	/** Skip inner max-width rails when the page already has a frame. */
	flush?: boolean;
	/** `center` stacks copy and buttons. `split` keeps copy left / buttons right on large screens. */
	align?: "split" | "center";
	/** Pill-shaped buttons. Set false for the default FancyButton radius. */
	pill?: boolean;
	/** Hairline above the CTA. Turn off when a page-level separator already draws it. */
	showTopRule?: boolean;
}) {
	const categoryVariant = category ? CATEGORY_VARIANTS[category] : undefined;
	const variant = {
		headline: headline ?? categoryVariant?.headline ?? DEFAULT_VARIANT.headline,
		sub: sub ?? categoryVariant?.sub ?? DEFAULT_VARIANT.sub,
		primaryLabel:
			primaryLabel ??
			categoryVariant?.primaryLabel ??
			DEFAULT_VARIANT.primaryLabel,
		secondaryLabel:
			secondaryLabel !== undefined
				? secondaryLabel
				: (categoryVariant?.secondaryLabel ??
					(headline ? undefined : "Documentation")),
	};

	const resolvedAccent =
		accentColor ??
		(category ? CATEGORY_ACCENTS[category] : undefined) ??
		"blue";
	const named = ACCENT_RGB[resolvedAccent] ?? ACCENT_RGB.blue;
	const brandRgb = accentHex ? glowRgb(accentHex) : null;
	const fx = atmosphere(brandRgb ?? named.primary, brandRgb ?? named.secondary);
	const lineMask =
		"radial-gradient(ellipse 85% 95% at 88% 110%, black 0%, transparent 68%), radial-gradient(ellipse 70% 90% at 4% -5%, black 0%, transparent 62%)";

	return (
		<section className="w-full">
			<div
				className={`relative overflow-hidden bg-bg-white-0 dark:bg-black ${showTopRule ? "border-stroke-soft-200 border-t dark:border-white/10" : ""}`}
			>
				<div
					className={`relative z-10 mx-auto flex w-full flex-col items-center border-stroke-soft-200 px-6 text-center sm:px-10 lg:px-12 dark:border-white/10 ${
						align === "split"
							? "gap-6 py-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between lg:text-left"
							: "gap-8 py-20 sm:py-24 lg:py-28"
					} ${flush ? "" : "max-w-5xl md:max-w-7xl xl:border-x"}`}
				>
					<div aria-hidden className="pointer-events-none absolute inset-0 z-0">
						<div
							className="absolute inset-0"
							style={{ backgroundImage: fx.glow }}
						/>
						<div
							className="absolute inset-0"
							style={{ backgroundImage: fx.glowAlt }}
						/>
						<div
							className="absolute inset-0"
							style={{
								backgroundImage: `repeating-linear-gradient(-45deg, transparent 0, transparent 3px, ${fx.line} 3px, ${fx.line} 3.55px)`,
								maskImage: lineMask,
								WebkitMaskImage: lineMask,
							}}
						/>
					</div>

					<div
						className={`relative z-10 ${align === "center" ? "mx-auto max-w-5xl" : "max-w-3xl"}`}
					>
						<h2
							className={
								align === "center"
									? "font-semibold text-[40px] text-text-strong-950 leading-[1.12] tracking-tight sm:text-[48px] lg:text-[56px] dark:text-white"
									: "text-balance font-semibold text-text-strong-950 text-xl leading-snug tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white"
							}
						>
							{variant.headline}
						</h2>
						{variant.sub ? (
							<p
								className={
									align === "center"
										? "mx-auto mt-5 max-w-sm text-balance text-[13px] text-text-sub-600 leading-6 dark:text-white/55"
										: "mt-3 max-w-xl text-balance text-[14px] text-text-sub-600 leading-relaxed sm:text-[14.5px] dark:text-white/70"
								}
							>
								{variant.sub}
							</p>
						) : null}
					</div>

					<div
						className={`relative z-10 flex shrink-0 flex-wrap items-center justify-center gap-3 ${
							align === "split" ? "lg:justify-start" : ""
						}`}
					>
						<CtaLink
							label={variant.primaryLabel}
							href={primaryHref}
							external={primaryExternal}
							filled
							variant="neutral"
							pill={pill}
						/>
						{variant.secondaryLabel && (
							<CtaLink
								label={variant.secondaryLabel}
								href={secondaryHref}
								external={secondaryExternal}
								filled={false}
								isSecondery
								pill={pill}
							/>
						)}
						{tertiaryLabel && tertiaryHref ? (
							<CtaLink
								label={tertiaryLabel}
								href={tertiaryHref}
								external={tertiaryExternal}
								filled={false}
								isSecondery
								pill={pill}
							/>
						) : null}
					</div>
				</div>
			</div>
		</section>
	);
}
