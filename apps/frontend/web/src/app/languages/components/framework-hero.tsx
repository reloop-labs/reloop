"use client";

import * as Button from "@reloop/ui/button";
import Link from "next/link";
import type { FrameworkDefinition } from "../frameworks";
import { LanguageIcon } from "./language-icon";

export default function FrameworkHero({
	framework,
}: {
	framework: FrameworkDefinition;
}) {
	const brandColor = `#${framework.icon.hex}`;

	return (
		<section className="relative w-full border-stroke-soft-200 bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				{/* Top meta row: breadcrumb + version */}
				<div className="flex items-center justify-between gap-4 border-stroke-soft-200 border-b border-dashed px-6 pt-28 pb-4 sm:px-10 sm:pt-32 lg:px-12 dark:border-white/10">
					<nav
						aria-label="Breadcrumb"
						className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] text-text-sub-600 uppercase tracking-[0.14em] dark:text-white/45"
					>
						<Link
							href="/languages"
							className="transition-colors hover:text-text-strong-950 dark:hover:text-white"
						>
							Languages
						</Link>
						<span className="text-text-soft-400 dark:text-white/25">/</span>
						<Link
							href="/languages#frameworks"
							className="transition-colors hover:text-text-strong-950 dark:hover:text-white"
						>
							Frameworks
						</Link>
						<span className="text-text-soft-400 dark:text-white/25">/</span>
						<span className="text-text-sub-600 dark:text-white/50">
							{framework.name}
						</span>
					</nav>
					<span className="shrink-0 font-mono text-[10px] text-text-sub-600 uppercase tracking-[0.12em] dark:text-white/40">
						[{framework.languageName} SDK]
					</span>
				</div>

				{/* Product fold: icon + title + sub + CTA */}
				<div className="relative overflow-hidden px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
					{/* Right-side dotted panel (reference) */}
					<div
						aria-hidden
						className="pointer-events-none absolute inset-y-0 right-0 hidden w-[28%] border-stroke-soft-200 border-l border-dashed sm:block dark:border-white/10 dark:opacity-40"
						style={{
							backgroundImage:
								"radial-gradient(circle, #d4d4d8 0.55px, transparent 0.6px)",
							backgroundSize: "12px 12px",
						}}
					/>

					<div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-5">
						{/* App icon tile */}
						<div
							className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)] sm:size-16 dark:border-white/10 dark:bg-bg-black-950 dark:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)]"
							style={{ color: brandColor }}
						>
							<LanguageIcon
								icon={framework.icon}
								className="size-7 sm:size-8"
							/>
						</div>

						<div className="min-w-0 flex-1">
							<h1 className="font-semibold text-3xl text-text-strong-950 tracking-tight sm:text-4xl lg:text-[2.5rem] dark:text-white">
								{framework.name}
							</h1>
							<p className="mt-2 max-w-xl text-[15px] text-text-sub-600 leading-relaxed sm:text-[16px] dark:text-white/60">
								{framework.shortDescription}
							</p>

							<div className="mt-6 flex flex-wrap items-center gap-3">
								<a
									href="#steps"
									className={`${Button.buttonVariants({
										variant: "neutral",
										mode: "filled",
									}).root()} inline-flex h-9! rounded-full! px-5! font-medium text-sm! dark:bg-white dark:text-black dark:hover:bg-white/90`}
								>
									Start integration
								</a>
								<Link
									href={`/languages/${framework.languageSlug}`}
									className="font-medium text-[13px] text-text-sub-600 underline decoration-text-sub-600/30 underline-offset-2 transition-colors hover:text-text-strong-950 hover:decoration-text-strong-950 dark:text-white/50 dark:hover:text-white dark:hover:decoration-white"
								>
									{framework.languageName} SDK →
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
