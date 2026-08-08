"use client";

import Link from "next/link";
import type { FeatureCtaBand } from "./types";

export function FeatureCta({
	title,
	titleMuted,
	description,
	primary,
	secondary,
}: FeatureCtaBand & { compact?: boolean }) {
	return (
		<section id="cta" className="w-full">
			<div className="relative overflow-hidden border-stroke-soft-200 border-t bg-bg-white-0 dark:border-white/10 dark:bg-black">
				{/* Diagonal hatch line graphic using primary color */}

				<div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-6 border-stroke-soft-200 border-x px-4 py-10 sm:px-6 sm:py-12 md:max-w-7xl lg:flex-row lg:items-center lg:justify-between lg:px-8 dark:border-white/10">
					<div className="max-w-2xl">
						<h2 className="font-serif text-2xl text-text-strong-950 leading-tight tracking-tight sm:text-3xl lg:text-[2.1rem] dark:text-white">
							{title}
							{titleMuted && (
								<span className="ml-2.5 text-primary-base">{titleMuted}</span>
							)}
						</h2>
						{description && (
							<p className="mt-2 text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60">
								{description}
							</p>
						)}
					</div>

					<div className="flex shrink-0 flex-wrap items-center gap-3">
						{secondary && <CtaLink {...secondary} filled={false} />}
						<CtaLink {...primary} filled />
					</div>
				</div>
			</div>
		</section>
	);
}

export function CtaLink({
	label,
	href,
	external,
	filled,
}: {
	label: string;
	href: string;
	external?: boolean;
	filled?: boolean;
}) {
	const className = filled
		? "inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-text-strong-950 px-5 font-semibold text-[13.5px] text-white shadow-sm transition-colors hover:bg-text-strong-950/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
		: "inline-flex h-10 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-weak-50 px-5 font-medium text-[13.5px] text-text-strong-950 transition-colors hover:bg-bg-sub-100 dark:border-white/15 dark:bg-[#141414] dark:text-white dark:hover:bg-white/15";

	const isCrossDomain =
		href.startsWith("/docs") || href.startsWith("/dashboard");

	const content = (
		<>
			<span>{label}</span>
			{filled && (
				<svg
					className="size-3.5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth="2.5"
				>
					<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
				</svg>
			)}
		</>
	);

	if (external || isCrossDomain) {
		return (
			<a
				href={href}
				{...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
				className={className}
			>
				{content}
			</a>
		);
	}

	return (
		<Link href={href} className={className}>
			{content}
		</Link>
	);
}
