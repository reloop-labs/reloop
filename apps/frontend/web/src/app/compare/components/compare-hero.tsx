"use client";

import { cn } from "@reloop/ui/cn";
import { Logo } from "@reloop/ui/logo";
import { HeroCtaLink } from "@reloop/web/components/landing/hero";
import type { FeatureCtaLink } from "@reloop/web/components/landing/types";
import Link from "next/link";
import type { SimpleIcon } from "simple-icons";
import { BrandIcon } from "./brand-icon";

function isDarkBrandHex(hex: string) {
	const clean = hex.replace("#", "").toLowerCase();
	if (clean === "000" || clean === "000000") return true;
	if (clean.length !== 6) return false;
	const r = Number.parseInt(clean.slice(0, 2), 16);
	const g = Number.parseInt(clean.slice(2, 4), 16);
	const b = Number.parseInt(clean.slice(4, 6), 16);
	return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.25;
}

function VsBadge() {
	return (
		<span className="relative z-10 inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-white-0 font-mono font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.14em] dark:border-white/10 dark:bg-black dark:text-white/50">
			vs
		</span>
	);
}

function HatchGutter({ side }: { side: "left" | "right" }) {
	return (
		<div
			aria-hidden
			className={cn(
				"w-6 shrink-0 self-stretch text-stroke-soft-200/80 sm:w-10 lg:w-12 dark:text-white/[0.08]",
				side === "left"
					? "border-stroke-soft-200 border-r dark:border-white/10"
					: "border-stroke-soft-200 border-l dark:border-white/10",
			)}
			style={{
				backgroundImage:
					"repeating-linear-gradient(-45deg, transparent 0, transparent 6px, currentColor 6px, currentColor 6.75px)",
			}}
		/>
	);
}

/**
 * Compare top fold — SDK details header language, split around a center vs.
 * Dashed rules frame the brand row top and bottom.
 */
export function CompareHero({
	titleLines,
	competitorName,
	description,
	primaryCta,
	secondaryCta,
	icon,
}: {
	titleLines: string[];
	competitorName?: string;
	description?: string;
	primaryCta?: FeatureCtaLink;
	secondaryCta?: FeatureCtaLink;
	icon?: Pick<SimpleIcon, "hex" | "path">;
}) {
	const parsed =
		competitorName ??
		titleLines
			.join(" ")
			.match(/\bvs\s+(.+)$/i)?.[1]
			?.trim() ??
		"Competitor";
	const title = titleLines.join(" ");
	const competitorIsDark = icon ? isDarkBrandHex(icon.hex) : false;

	return (
		<section className="relative w-full border-stroke-soft-200 bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			{/* Top meta row — same chrome as SDK details */}
			<div className="flex items-center justify-between gap-4 border-stroke-soft-200 border-b border-dashed px-6 pt-28 pb-4 sm:px-10 sm:pt-32 lg:px-12 dark:border-white/10">
				<nav
					aria-label="Breadcrumb"
					className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] text-text-sub-600 uppercase tracking-[0.14em] dark:text-white/45"
				>
					<Link
						href="/compare"
						className="transition-colors hover:text-text-strong-950 dark:hover:text-white"
					>
						Compare
					</Link>
					<span className="text-text-soft-400 dark:text-white/25">/</span>
					<span className="text-text-sub-600 dark:text-white/50">{parsed}</span>
				</nav>
				<span className="shrink-0 font-mono text-[10px] text-text-sub-600 uppercase tracking-[0.12em] dark:text-white/40">
					[Comparison]
				</span>
			</div>

			<h1 className="sr-only">{title}</h1>

			{/* Divided brand row: larger tiles, titles centered underneath */}
			<div className="relative flex border-stroke-soft-200 border-b border-dashed dark:border-white/10">
				<HatchGutter side="left" />

				<div className="relative min-w-0 flex-1">
					<div
						aria-hidden
						className="-translate-x-1/2 pointer-events-none absolute inset-y-0 left-1/2 border-stroke-soft-200 border-l border-dashed dark:border-white/10"
					/>

					<div className="relative mx-auto flex items-start justify-center gap-5 py-10 sm:gap-7 sm:py-12 md:gap-8">
						<div className="flex w-32 flex-col items-center gap-3 sm:w-36 md:w-44">
							<div className="flex size-28 items-center justify-center overflow-visible sm:size-32 md:size-40">
								{/* Logo viewBox is padded — scale so the mark matches the other brand. */}
								<Logo className="size-full origin-center scale-[1.85]" />
							</div>
							<p className="text-center font-semibold text-[17px] text-text-strong-950 tracking-tight sm:text-xl md:text-2xl dark:text-white">
								Reloop
							</p>
						</div>

						<div className="flex h-28 shrink-0 items-center sm:h-32 md:h-40">
							<VsBadge />
						</div>

						<div className="flex w-32 flex-col items-center gap-3 sm:w-36 md:w-44">
							{icon ? (
								<BrandIcon
									icon={icon}
									fill={competitorIsDark ? "currentColor" : `#${icon.hex}`}
									className={cn(
										"size-28 sm:size-32 md:size-40",
										competitorIsDark && "text-text-strong-950 dark:text-white",
									)}
								/>
							) : null}
							<p className="text-center font-semibold text-[17px] text-text-strong-950 tracking-tight sm:text-xl md:text-2xl dark:text-white">
								{parsed}
							</p>
						</div>
					</div>
				</div>

				<HatchGutter side="right" />
			</div>

			{/* Copy + CTAs — SDK details body, left-aligned under the fold */}
			{(description || primaryCta) && (
				<div className="px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
					{description ? (
						<p className="max-w-xl text-[15px] text-text-sub-600 leading-relaxed sm:text-[16px] dark:text-white/60">
							{description}
						</p>
					) : null}
					{primaryCta ? (
						<div className="mt-6 flex flex-wrap items-center gap-3">
							<HeroCtaLink
								href={primaryCta.href}
								label={primaryCta.label}
								external={primaryCta.external}
								variant="primary"
							/>
							{secondaryCta ? (
								<HeroCtaLink
									href={secondaryCta.href}
									label={secondaryCta.label}
									external={secondaryCta.external}
									variant="secondary"
								/>
							) : null}
						</div>
					) : null}
				</div>
			)}
		</section>
	);
}
