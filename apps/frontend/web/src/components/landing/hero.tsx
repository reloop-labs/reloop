"use client";

import * as Button from "@reloop/ui/button";
import type React from "react";
import type { FeatureCtaLink } from "./types";

export function FeatureHero({
	titleLines,
	description,
	primaryCta,
	secondaryCta,
	compact = false,
	leading,
}: {
	titleLines: string[];
	description?: string;
	primaryCta?: FeatureCtaLink;
	secondaryCta?: FeatureCtaLink;
	compact?: boolean;
	leading?: React.ReactNode;
}) {
	return (
		<div
			className={
				compact
					? "relative overflow-hidden bg-transparent pt-40 pb-8 sm:pt-44 sm:pb-10"
					: "relative flex min-h-dvh items-center justify-center overflow-hidden bg-transparent pt-48 pb-28 sm:pt-52"
			}
		>
			<main className="relative z-10">
				<section
					className={
						compact
							? "mx-auto flex max-w-4xl flex-col px-4 sm:px-6 lg:px-8"
							: "mx-auto flex max-w-4xl flex-col px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24"
					}
				>
					<div className="mx-auto max-w-[1020px] text-center">
						{leading}
						<h1 className="font-serif text-[2.8rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[4.2rem] dark:text-white">
							{titleLines.map((line, i) => (
								<span key={line}>
									{line}
									{i < titleLines.length - 1 && <br />}
								</span>
							))}
						</h1>

						{description && (
							<p className="mx-auto mt-7 max-w-[620px] text-[15px] text-text-sub-600 leading-relaxed sm:text-[17px] dark:text-white/50">
								{description}
							</p>
						)}

						{primaryCta && (
							<div
								className={
									compact
										? "mt-7 flex flex-wrap items-center justify-center gap-4"
										: "mt-10 flex flex-wrap items-center justify-center gap-4"
								}
							>
								<a
									href={primaryCta.href}
									target={primaryCta.external ? "_blank" : undefined}
									rel={primaryCta.external ? "noopener noreferrer" : undefined}
									className={`${Button.buttonVariants({
										variant: "neutral",
										mode: "filled",
									}).root()} h-11! rounded-2xl! px-8! font-semibold`}
								>
									{primaryCta.label}
								</a>
								{secondaryCta && (
									<a
										href={secondaryCta.href}
										target={secondaryCta.external ? "_blank" : undefined}
										rel={
											secondaryCta.external ? "noopener noreferrer" : undefined
										}
										className={`${Button.buttonVariants({
											variant: "neutral",
											mode: "stroke",
										}).root()} h-11! rounded-2xl! px-8! font-semibold`}
									>
										{secondaryCta.label}
									</a>
								)}
							</div>
						)}
					</div>
				</section>
			</main>
		</div>
	);
}
