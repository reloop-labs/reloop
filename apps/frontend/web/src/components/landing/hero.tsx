"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import type React from "react";
import type { FeatureCtaLink } from "./types";

function HeroCtaLink({
	href,
	label,
	external,
	variant,
}: {
	href: string;
	label: string;
	external?: boolean;
	variant: "primary" | "secondary";
}) {
	const className = cn(
		"group inline-flex h-11! items-center justify-center overflow-hidden rounded-full px-8 font-semibold transition-colors duration-300",
		variant === "primary"
			? Button.buttonVariants({ variant: "neutral", mode: "filled" }).root()
			: Button.buttonVariants({ variant: "neutral", mode: "stroke" }).root(),
	);

	const content = (
		<span className="inline-flex items-center">
			<span className="group-hover:-translate-x-1 transition-transform duration-300 ease-out">
				{label}
			</span>
			<Icon
				name="arrow-up-right"
				className="ml-0 size-4 max-w-0 shrink-0 translate-x-1 opacity-0 transition-all duration-300 ease-out group-hover:ml-2 group-hover:max-w-4 group-hover:translate-x-0 group-hover:opacity-100"
				aria-hidden
			/>
		</span>
	);

	const isCrossDomain =
		href.startsWith("/docs") || href.startsWith("/dashboard");

	if (external || isCrossDomain) {
		return (
			<a
				href={href}
				target={external ? "_blank" : undefined}
				rel={external ? "noopener noreferrer" : undefined}
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

export function FeatureHero({
	titleLines,
	description,
	primaryCta,
	secondaryCta,
	compact = false,
	tightBottom = false,
	fullViewport = false,
	leading,
}: {
	titleLines: string[];
	description?: string;
	primaryCta?: FeatureCtaLink;
	secondaryCta?: FeatureCtaLink;
	compact?: boolean;
	tightBottom?: boolean;
	fullViewport?: boolean;
	leading?: React.ReactNode;
}) {
	return (
		<div
			className={
				fullViewport
					? "relative flex min-h-screen items-center justify-center overflow-hidden bg-transparent pt-20 pb-12"
					: compact
						? tightBottom
							? "relative overflow-hidden bg-transparent pt-40 pb-2 sm:pt-44 sm:pb-4"
							: "relative overflow-hidden bg-transparent pt-40 pb-8 sm:pt-44 sm:pb-10"
						: "relative flex min-h-screen items-center justify-center overflow-hidden bg-transparent pt-48 pb-28 sm:pt-52"
			}
		>
			<main className="relative z-10">
				<section
					className={
						fullViewport
							? "mx-auto flex max-w-4xl flex-col px-4 sm:px-6 lg:px-8"
							: compact
								? "mx-auto flex max-w-4xl flex-col px-4 sm:px-6 lg:px-8"
								: "mx-auto flex max-w-4xl flex-col px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24"
					}
				>
					<div className="mx-auto max-w-[1020px] text-center">
						{leading}
						<h1
							className={cn(
								"font-serif text-text-strong-950 leading-[1.05] tracking-tighter dark:text-white",
								compact
									? "text-[2.4rem] sm:text-[3.6rem]"
									: "text-[2.8rem] sm:text-[4.2rem]",
							)}
						>
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
									fullViewport || !compact
										? "mt-10 flex flex-wrap items-center justify-center gap-4"
										: "mt-7 flex flex-wrap items-center justify-center gap-4"
								}
							>
								<HeroCtaLink
									href={primaryCta.href}
									label={primaryCta.label}
									external={primaryCta.external}
									variant="primary"
								/>
								{secondaryCta && (
									<HeroCtaLink
										href={secondaryCta.href}
										label={secondaryCta.label}
										external={secondaryCta.external}
										variant="secondary"
									/>
								)}
							</div>
						)}
					</div>
				</section>
			</main>
		</div>
	);
}
