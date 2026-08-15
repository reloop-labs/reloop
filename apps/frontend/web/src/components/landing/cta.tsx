"use client";

import { cn } from "@reloop/ui/cn";
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
				<div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-10 border-stroke-soft-200 px-4 pt-12 pb-13 sm:px-6 md:max-w-7xl lg:px-8 xl:border-x dark:border-white/10">
					<div className="mx-auto flex max-w-3xl flex-col items-center text-center">
						<h2 className="font-semibold text-2xl text-balance text-text-strong-950 tracking-tight sm:text-4xl lg:text-5xl dark:text-white">
							{title}
							{titleMuted && (
								<>
									<br />
									<span className="text-primary-base">{titleMuted}</span>
								</>
							)}
						</h2>
						{description && (
							<p className="mt-3 max-w-xl text-[15px] text-balance text-text-sub-600 leading-relaxed dark:text-white/60">
								{description}
							</p>
						)}
					</div>

					<div className="flex flex-wrap items-center justify-center gap-3">
						{secondary && <CtaLink {...secondary} filled={false} isSecondery />}
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
	isSecondery,
	variant: variantProp,
}: {
	label: string;
	href: string;
	external?: boolean;
	filled?: boolean;
	isSecondery?: boolean;
	variant?: "neutral" | "primary" | "basic";
}) {
	const isCrossDomain =
		href.startsWith("/docs") || href.startsWith("/dashboard");

	const variant = filled ? (variantProp ?? "primary") : "basic";

	if (external || isCrossDomain) {
		return (
			<FancyButton.Root
				asChild
				variant={variant}
				size="medium"
				className={cn("rounded-full!", !isSecondery && "px-10!")}
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
			className={cn("rounded-full!", !isSecondery && "px-10!")}
		>
			<Link href={href}>
				<span>{label}</span>
			</Link>
		</FancyButton.Root>
	);
}
