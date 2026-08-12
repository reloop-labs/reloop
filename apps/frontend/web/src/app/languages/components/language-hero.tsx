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
			{/* Soft ambient wash — same language as Careers values */}
			<div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/[0.04] via-sky-400/[0.02] to-transparent dark:from-blue-500/[0.08] dark:via-transparent" />

			<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				{/* Copy block */}
				<div className="flex flex-col items-center px-6 pt-28 pb-12 text-center sm:px-10 sm:pt-32 sm:pb-14 lg:px-12">
					{/* Breadcrumb */}
					<nav
						aria-label="Breadcrumb"
						className="mb-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.6px]"
					>
						<Link
							href="/languages"
							className="text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white"
						>
							Languages
						</Link>
						<span className="text-text-soft-400 dark:text-white/30">/</span>
						<span className="inline-flex items-center gap-1.5 text-text-strong-950 dark:text-white">
							<span style={{ color: brandColor }}>
								<LanguageIcon icon={language.icon} className="size-3.5" />
							</span>
							{language.name}
						</span>
					</nav>

					{/* Headline — Dub structure, careers type scale */}
					<h1 className="max-w-3xl font-semibold text-3xl text-text-strong-950 leading-[1.12] tracking-tight sm:text-4xl lg:text-[2.75rem] dark:text-white">
						Integrate with Reloop using {language.name}
					</h1>

					<p className="mt-4 max-w-xl text-[15px] text-text-sub-600 leading-relaxed sm:text-[16px] dark:text-white/60">
						Integrate Reloop&apos;s email infrastructure in your {language.name}{" "}
						application with just a few lines of code.
					</p>

					{/* CTAs */}
					<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
						<a
							href="/dashboard/signup"
							className={`${Button.buttonVariants({
								variant: "neutral",
								mode: "filled",
							}).root()} inline-flex h-10! rounded-full! px-6! font-medium text-sm! dark:bg-white dark:text-black dark:hover:bg-white/90`}
						>
							Get Started
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

				{/* Language icon stage — Dub floating logo, careers blueprint frame */}
				<div className="relative flex min-h-[220px] items-center justify-center overflow-hidden border-stroke-soft-200 border-t bg-[#fafafa] sm:min-h-[280px] dark:border-white/10 dark:bg-white/[0.02]">
					<BlueprintGrid id={language.slug} />

					{/* Soft brand glow behind the tile */}
					<div
						aria-hidden
						className="pointer-events-none absolute inset-0"
						style={{
							background: `radial-gradient(ellipse 50% 55% at 50% 55%, ${brandColor}14 0%, transparent 70%)`,
						}}
					/>

					<div className="relative z-10 flex flex-col items-center gap-4 py-12 sm:py-16">
						<div
							className="flex size-24 items-center justify-center rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.18)] sm:size-28 dark:border-white/10 dark:bg-bg-black-950 dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.55)]"
							style={{ color: brandColor }}
						>
							<LanguageIcon
								icon={language.icon}
								className="size-12 sm:size-14"
							/>
						</div>
						<p className="font-mono text-[11px] text-text-sub-600 uppercase tracking-[0.14em] dark:text-white/45">
							{language.packageName}
						</p>
					</div>
				</div>

				{/* Spec strip */}
				<div className="grid grid-cols-2 border-stroke-soft-200 border-t sm:grid-cols-4 dark:border-white/10">
					{[
						{ label: "Package", value: language.packageName },
						{ label: "Type safety", value: language.typeSafety },
						{ label: "Concurrency", value: language.concurrency },
						{ label: "Frameworks", value: language.primaryFramework },
					].map((spec, i) => {
						const isLastColMobile = i % 2 === 1;
						const isLastRowMobile = i >= 2;
						const isLastColDesktop = i === 3;
						return (
							<div
								key={spec.label}
								className={[
									"flex flex-col gap-1 px-5 py-5 sm:px-6 sm:py-6",
									!isLastColMobile
										? "border-stroke-soft-200 border-r dark:border-white/10"
										: "sm:border-stroke-soft-200 sm:border-r dark:sm:border-white/10",
									!isLastRowMobile
										? "border-stroke-soft-200 border-b sm:border-b-0 dark:border-white/10"
										: "",
									isLastColDesktop ? "sm:border-r-0" : "",
								]
									.filter(Boolean)
									.join(" ")}
							>
								<span className="font-mono text-[10px] text-text-sub-600 uppercase tracking-[0.12em] dark:text-white/45">
									{spec.label}
								</span>
								<span className="truncate font-medium text-[13px] text-text-strong-950 sm:text-sm dark:text-white">
									{spec.value}
								</span>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
