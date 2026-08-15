import { CtaLink } from "@reloop/web/components/landing/cta";

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

const ACCENT_STYLES: Record<
	CtaAccentColor,
	{
		bg: string;
		pattern: string;
		/** Soft blooms used only in dark mode — no hatch through the type */
		darkGlow: string;
		darkGlowAlt: string;
	}
> = {
	blue: {
		bg: "from-transparent via-sky-100/75 to-blue-100/90",
		pattern: "text-sky-500/35",
		darkGlow:
			"radial-gradient(ellipse 110% 160% at 82% 100%, rgba(56,189,248,0.28) 0%, transparent 62%)",
		darkGlowAlt:
			"radial-gradient(ellipse 90% 140% at 6% 0%, rgba(99,102,241,0.22) 0%, transparent 60%)",
	},
	indigo: {
		bg: "from-transparent via-indigo-100/75 to-purple-100/90",
		pattern: "text-indigo-500/35",
		darkGlow:
			"radial-gradient(ellipse 110% 160% at 82% 100%, rgba(129,140,248,0.28) 0%, transparent 62%)",
		darkGlowAlt:
			"radial-gradient(ellipse 90% 140% at 6% 0%, rgba(192,132,252,0.22) 0%, transparent 60%)",
	},
	emerald: {
		bg: "from-transparent via-emerald-100/75 to-teal-100/90",
		pattern: "text-emerald-500/35",
		darkGlow:
			"radial-gradient(ellipse 110% 160% at 82% 100%, rgba(52,211,153,0.24) 0%, transparent 62%)",
		darkGlowAlt:
			"radial-gradient(ellipse 90% 140% at 6% 0%, rgba(45,212,191,0.18) 0%, transparent 60%)",
	},
	violet: {
		bg: "from-transparent via-violet-100/75 to-fuchsia-100/90",
		pattern: "text-violet-500/35",
		darkGlow:
			"radial-gradient(ellipse 110% 160% at 82% 100%, rgba(167,139,250,0.28) 0%, transparent 62%)",
		darkGlowAlt:
			"radial-gradient(ellipse 90% 140% at 6% 0%, rgba(232,121,249,0.20) 0%, transparent 60%)",
	},
	amber: {
		bg: "from-transparent via-amber-100/75 to-orange-100/90",
		pattern: "text-amber-500/35",
		darkGlow:
			"radial-gradient(ellipse 110% 160% at 82% 100%, rgba(251,191,36,0.22) 0%, transparent 62%)",
		darkGlowAlt:
			"radial-gradient(ellipse 90% 140% at 6% 0%, rgba(251,146,60,0.18) 0%, transparent 60%)",
	},
	primary: {
		bg: "from-transparent via-primary-base/15 to-primary-base/25",
		pattern: "text-primary-base/35",
		darkGlow:
			"radial-gradient(ellipse 110% 160% at 82% 100%, rgba(0,111,254,0.30) 0%, transparent 62%)",
		darkGlowAlt:
			"radial-gradient(ellipse 90% 140% at 6% 0%, rgba(56,189,248,0.20) 0%, transparent 60%)",
	},
};

function normalizeHex(hex: string): string {
	return hex.replace("#", "").toUpperCase();
}

function hexToRgba(hex: string, alpha: number): string {
	const h = normalizeHex(hex);
	const r = Number.parseInt(h.slice(0, 2), 16);
	const g = Number.parseInt(h.slice(2, 4), 16);
	const b = Number.parseInt(h.slice(4, 6), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function isDimHex(hex: string): boolean {
	const h = normalizeHex(hex);
	if (h === "000000" || h === "000" || h === "111111" || h === "333333") {
		return true;
	}
	if (h.length !== 6) return false;
	const r = Number.parseInt(h.slice(0, 2), 16);
	const g = Number.parseInt(h.slice(2, 4), 16);
	const b = Number.parseInt(h.slice(4, 6), 16);
	return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.25;
}

/** Dark-mode glows need a lift when the brand mark is black. */
function glowHex(hex: string): string {
	return isDimHex(hex) ? "D4D4D8" : normalizeHex(hex);
}

function brandAtmosphere(hex: string) {
	const h = glowHex(hex);
	return {
		darkGlow: `radial-gradient(ellipse 110% 160% at 82% 100%, ${hexToRgba(h, 0.34)} 0%, transparent 62%)`,
		darkGlowAlt: `radial-gradient(ellipse 90% 140% at 6% 0%, ${hexToRgba(h, 0.24)} 0%, transparent 60%)`,
		darkLine: hexToRgba(h, 0.18),
		lightGradient: `linear-gradient(to right, transparent 0%, ${hexToRgba(h, 0.18)} 45%, ${hexToRgba(h, 0.3)} 100%)`,
		lightLine: hexToRgba(h, 0.28),
	};
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
	accentColor,
	accentHex,
}: {
	category?: string;
	headline?: string;
	sub?: string;
	primaryLabel?: string;
	primaryHref?: string;
	primaryExternal?: boolean;
	secondaryLabel?: string;
	secondaryHref?: string;
	secondaryExternal?: boolean;
	accentColor?: CtaAccentColor;
	/** Brand hex (e.g. NestJS red) — tints the CTA glow and lines */
	accentHex?: string;
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
	const colorStyle = ACCENT_STYLES[resolvedAccent] ?? ACCENT_STYLES.blue;
	const brand = accentHex ? brandAtmosphere(accentHex) : null;

	return (
		<section className="w-full">
			<div className="relative overflow-hidden border-stroke-soft-200 border-t bg-bg-white-0 dark:border-white/10 dark:bg-black">
				<div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-6 border-stroke-soft-200 px-6 py-10 text-center sm:px-10 sm:py-12 md:max-w-7xl lg:flex-row lg:items-center lg:justify-between lg:px-12 lg:text-left xl:border-x dark:border-white/10">
					{/* Light: tinted hatch on the right */}
					<div
						aria-hidden
						className="pointer-events-none absolute top-0 right-0 bottom-0 z-0 w-full sm:w-7/12 dark:hidden"
					>
						<div
							className={
								brand ? "absolute inset-0" : `absolute inset-0 bg-gradient-to-r ${colorStyle.bg}`
							}
							style={{
								backgroundImage: brand?.lightGradient,
								maskImage:
									"linear-gradient(to right, transparent 0%, black 35%, black 100%)",
								WebkitMaskImage:
									"linear-gradient(to right, transparent 0%, black 35%, black 100%)",
							}}
						/>
						<div
							className={
								brand ? "absolute inset-0" : `absolute inset-0 ${colorStyle.pattern}`
							}
							style={{
								backgroundImage: brand
									? `repeating-linear-gradient(-45deg, transparent 0, transparent 2px, ${brand.lightLine} 2px, ${brand.lightLine} 2.8px)`
									: "repeating-linear-gradient(-45deg, transparent 0, transparent 2px, currentColor 2px, currentColor 2.8px)",
								maskImage:
									"linear-gradient(to right, transparent 0%, black 30%, black 100%)",
								WebkitMaskImage:
									"linear-gradient(to right, transparent 0%, black 30%, black 100%)",
							}}
						/>
					</div>

					{/* Dark: brand blooms + lighter hatch, kept off the type */}
					<div
						aria-hidden
						className="pointer-events-none absolute inset-0 z-0 hidden dark:block"
					>
						<div
							className="absolute inset-0"
							style={{
								backgroundImage: brand?.darkGlow ?? colorStyle.darkGlow,
							}}
						/>
						<div
							className="absolute inset-0"
							style={{
								backgroundImage: brand?.darkGlowAlt ?? colorStyle.darkGlowAlt,
							}}
						/>
						<div
							className="absolute inset-0"
							style={{
								backgroundImage: `repeating-linear-gradient(-45deg, transparent 0, transparent 3px, ${brand?.darkLine ?? "rgba(255,255,255,0.08)"} 3px, ${brand?.darkLine ?? "rgba(255,255,255,0.08)"} 3.55px)`,
								maskImage:
									"radial-gradient(ellipse 85% 95% at 88% 110%, black 0%, transparent 68%), radial-gradient(ellipse 70% 90% at 4% -5%, black 0%, transparent 62%)",
								WebkitMaskImage:
									"radial-gradient(ellipse 85% 95% at 88% 110%, black 0%, transparent 68%), radial-gradient(ellipse 70% 90% at 4% -5%, black 0%, transparent 62%)",
							}}
						/>
					</div>

					<div className="relative z-10 max-w-3xl">
						<h2 className="font-semibold text-text-strong-950 text-xl text-balance leading-snug tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
							{variant.headline}
						</h2>
						<p className="mt-3 max-w-xl text-[14px] text-balance text-text-sub-600 leading-relaxed sm:text-[14.5px] dark:text-white/70">
							{variant.sub}
						</p>
					</div>

					<div className="relative z-10 flex shrink-0 flex-wrap items-center justify-center gap-3 lg:justify-start">
						{variant.secondaryLabel && (
							<CtaLink
								label={variant.secondaryLabel}
								href={secondaryHref}
								external={secondaryExternal}
								filled={false}
								isSecondery
							/>
						)}
						<CtaLink
							label={variant.primaryLabel}
							href={primaryHref}
							external={primaryExternal}
							filled
							variant="neutral"
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
