"use client";

import * as Button from "@reloop/ui/button";
import Link from "next/link";
import type { LanguageDefinition } from "../languages";
import { LanguageIcon } from "./language-icon";

function BlueprintGrid({ id }: { id: string }) {
	const patternId = `lang-hero-grid-${id}`;
	return (
		<svg
			className="pointer-events-none absolute inset-0 size-full text-stroke-soft-200/70 dark:text-white/[0.06]"
			width="100%"
			height="100%"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<defs>
				<pattern
					id={patternId}
					width="20"
					height="20"
					patternUnits="userSpaceOnUse"
				>
					<path
						d="M 20 0 L 0 0 0 20"
						fill="none"
						stroke="currentColor"
						strokeWidth="0.75"
					/>
				</pattern>
			</defs>
			<rect width="100%" height="100%" fill={`url(#${patternId})`} />
		</svg>
	);
}

export default function LanguageHero({
	language,
}: {
	language: LanguageDefinition;
}) {
	const brandColor = `#${language.icon.hex}`;

	return (
		<section className="relative w-full border-stroke-soft-200 bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/[0.04] via-sky-400/[0.02] to-transparent dark:from-blue-500/[0.08] dark:via-transparent" />

			<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				{/* Copy */}
				<div className="flex flex-col items-center px-6 pt-28 pb-10 text-center sm:px-10 sm:pt-32 sm:pb-12 lg:px-12">
					<nav
						aria-label="Breadcrumb"
						className="mb-5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.6px]"
					>
						<Link
							href="/sdks"
							className="text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white"
						>
							SDKs
						</Link>
						<span className="text-text-soft-400 dark:text-white/30">/</span>
						<span className="text-text-strong-950 dark:text-white">
							{language.name}
						</span>
					</nav>

					<h1 className="max-w-2xl font-semibold text-3xl text-text-strong-950 leading-[1.12] tracking-tight sm:text-4xl lg:text-[2.6rem] dark:text-white">
						Integrate with Reloop using {language.name}
					</h1>

					<p className="mt-4 max-w-lg text-[15px] text-text-sub-600 leading-relaxed sm:text-[16px] dark:text-white/60">
						Official {language.name} SDK for Reloop. A few lines of code to
						send production email.
					</p>

					<div className="mt-7 flex flex-wrap items-center justify-center gap-3">
						<a
							href="#code"
							className={`${Button.buttonVariants({
								variant: "neutral",
								mode: "filled",
							}).root()} inline-flex h-10! rounded-full! px-6! font-medium text-sm! dark:bg-white dark:text-black dark:hover:bg-white/90`}
						>
							View code
						</a>
						<Link
							href={language.docsPath}
							className={`${Button.buttonVariants({
								variant: "neutral",
								mode: "stroke",
							}).root()} inline-flex h-10! rounded-full! px-6! font-medium text-sm!`}
						>
							Documentation →
						</Link>
					</div>
				</div>

				{/* Language mark */}
				<div className="relative flex min-h-[180px] items-center justify-center overflow-hidden border-stroke-soft-200 border-t bg-[#fafafa] sm:min-h-[220px] dark:border-white/10 dark:bg-white/[0.02]">
					<BlueprintGrid id={language.slug} />
					<div
						aria-hidden
						className="pointer-events-none absolute inset-0"
						style={{
							background: `radial-gradient(ellipse 45% 50% at 50% 55%, ${brandColor}12 0%, transparent 70%)`,
						}}
					/>
					<div
						className="relative z-10 flex size-20 items-center justify-center rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-[0_12px_36px_-12px_rgba(0,0,0,0.16)] sm:size-24 dark:border-white/10 dark:bg-bg-black-950 dark:shadow-[0_12px_36px_-12px_rgba(0,0,0,0.5)]"
						style={{ color: brandColor }}
					>
						<LanguageIcon icon={language.icon} className="size-10 sm:size-12" />
					</div>
				</div>
			</div>
		</section>
	);
}
