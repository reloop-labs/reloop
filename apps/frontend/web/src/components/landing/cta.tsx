"use client";

import * as FancyButton from "@reloop/ui/fancy-button";
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
				<div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-6 border-stroke-soft-200 border-x px-4 py-10 sm:px-6 sm:py-20 md:max-w-7xl lg:flex-row lg:items-center lg:justify-between lg:px-8 dark:border-white/10">
					<div className="max-w-2xl">
						<h2 className="font-semibold text-2xl text-text-strong-950 leading-tight tracking-tight sm:text-3xl lg:text-[2.1rem] dark:text-white">
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
	filled = true,
}: {
	label: string;
	href: string;
	external?: boolean;
	filled?: boolean;
}) {
	const isCrossDomain =
		href.startsWith("/docs") || href.startsWith("/dashboard");

	const variant = filled ? "neutral" : "basic";

	if (external || isCrossDomain) {
		return (
			<FancyButton.Root
				asChild
				variant={variant}
				size="medium"
				className="rounded-full! px-10!"
			>
				<a
					href={href}
					{...(external
						? { target: "_blank", rel: "noopener noreferrer" }
						: {})}
				>
					<span>{label}</span>
				</a>
			</FancyButton.Root>
		);
	}

	return (
		<FancyButton.Root
			asChild
			variant={variant}
			size="medium"
			className="rounded-lg! px-5!"
		>
			<Link href={href}>
				<span>{label}</span>
			</Link>
		</FancyButton.Root>
	);
}
