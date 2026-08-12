"use client";

import * as Button from "@reloop/ui/button";
import Link from "next/link";
import type { LanguageDefinition } from "../languages";
import { LanguageIcon } from "./language-icon";

export default function LanguageHero({
	language,
}: {
	language: LanguageDefinition;
}) {
	return (
		<section className="relative flex flex-col items-center justify-center pt-28 pb-16 sm:pt-36 sm:pb-20">
			<div className="mx-auto flex max-w-4xl flex-col px-4 text-center sm:px-6 lg:px-8">
				{/* Breadcrumb & Masthead Context */}
				<div className="mx-auto mb-6 flex items-center gap-2">
					<Link
						href="/languages"
						className="font-mono text-text-sub-600 text-xs transition-colors hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white"
					>
						Languages
					</Link>
					<span className="font-mono text-text-sub-600 text-xs dark:text-white/30">
						/
					</span>
					<div className="inline-flex items-center gap-1.5 rounded-full border border-stroke-soft-200 bg-bg-weak-50 px-3 py-0.5 font-mono text-text-sub-600 text-xs dark:border-white/10 dark:bg-white/[0.03] dark:text-white/70">
						<span style={{ color: `#${language.icon.hex}` }}>
							<LanguageIcon icon={language.icon} className="size-3.5" />
						</span>
						<span>{language.name} SDK Specification</span>
					</div>
				</div>

				{/* Title */}
				<h1 className="font-bold font-sans text-4xl text-text-strong-950 leading-[1.08] tracking-tight sm:text-6xl dark:text-white">
					Send email with {language.name}.
				</h1>

				{/* Description */}
				<p className="mx-auto mt-6 max-w-2xl text-base text-text-sub-600 leading-relaxed sm:text-lg dark:text-white/60">
					{language.shortDescription}
				</p>

				{/* Primary Actions */}
				<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
					<a
						href="/dashboard/signup"
						className={`${Button.buttonVariants({
							variant: "neutral",
							mode: "filled",
						}).root()} h-11! rounded-full! px-7! font-medium text-sm`}
					>
						Get API Key
					</a>
					<a
						href="#code"
						className={`${Button.buttonVariants({
							variant: "neutral",
							mode: "stroke",
						}).root()} h-11! rounded-full! px-7! font-medium text-sm`}
					>
						View Sample Code &rarr;
					</a>
				</div>

				{/* 4-Column Spec Bar */}
				<div className="mt-14 grid grid-cols-2 gap-4 border-stroke-soft-200 border-y py-6 sm:grid-cols-4 dark:border-white/10">
					<div className="flex flex-col items-center">
						<span className="font-mono text-text-sub-600 text-xs dark:text-white/50">
							Package
						</span>
						<span className="mt-1 font-mono font-semibold text-sm text-text-strong-950 dark:text-white">
							{language.packageName}
						</span>
					</div>
					<div className="flex flex-col items-center">
						<span className="font-mono text-text-sub-600 text-xs dark:text-white/50">
							Type Safety
						</span>
						<span className="mt-1 font-sans font-semibold text-sm text-text-strong-950 dark:text-white">
							{language.typeSafety}
						</span>
					</div>
					<div className="flex flex-col items-center">
						<span className="font-mono text-text-sub-600 text-xs dark:text-white/50">
							Concurrency
						</span>
						<span className="mt-1 font-sans font-semibold text-sm text-text-strong-950 dark:text-white">
							{language.concurrency}
						</span>
					</div>
					<div className="flex flex-col items-center">
						<span className="font-mono text-text-sub-600 text-xs dark:text-white/50">
							Frameworks
						</span>
						<span className="mt-1 font-sans font-semibold text-sm text-text-strong-950 dark:text-white">
							{language.primaryFramework}
						</span>
					</div>
				</div>
			</div>
		</section>
	);
}
