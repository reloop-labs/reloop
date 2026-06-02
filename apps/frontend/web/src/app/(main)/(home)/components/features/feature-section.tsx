"use client";

import { cn } from "@reloop/ui/cn";
import Image from "next/image";
import type { FeatureSectionProps } from "./types";

export function FeatureSection({
	feature,
	index,
	forwardRef,
	isLast,
}: FeatureSectionProps) {
	const Visual = feature.visual;

	return (
		<div
			ref={forwardRef}
			data-index={index}
			className={cn(
				"py-16 lg:py-20",
				!isLast && "border-[#0a0d12]/8 border-b dark:border-white/8",
			)}
		>
			{/* Title + description */}
			{feature.title && (
				<h2 className="font-semibold text-[#0a0d12] text-[2.2rem] leading-[1.05] tracking-[-0.03em] sm:text-[3rem] lg:text-[3.5rem] dark:text-white">
					{feature.title}
				</h2>
			)}
			{feature.description && (
				<p className="mt-5 max-w-[640px] text-[#0a0d12]/60 text-[15px] leading-7 sm:text-[18px] dark:text-white/60">
					{feature.description}
				</p>
			)}

			{/* Visual */}
			<div className={cn("sm:mt-18", feature.title ? "mt-14" : "mt-0")}>
				<div
					className={cn(
						"relative overflow-hidden rounded-xl",
						feature.containerClassName || "bg-zinc-900 shadow-2xl",
					)}
				>
					{!feature.hideBackground && feature.bgImage && (
						<div className="absolute inset-0 opacity-40 grayscale">
							<Image
								src={feature.bgImage}
								alt=""
								fill
								className="object-cover object-center"
								sizes="(max-width: 1320px) 100vw, 1320px"
								quality={80}
							/>
						</div>
					)}
					<div
						className={cn(
							"relative",
							feature.containerClassName
								? "p-0"
								: "px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16",
						)}
					>
						<Visual />
					</div>
				</div>
			</div>

			{/* Feature cards */}
			{feature.cards.length > 0 && (
				<div className="mt-14 grid gap-8 sm:mt-18 md:grid-cols-3 md:gap-10">
					{feature.cards.map((card) => (
						<div key={card.title}>
							<h3 className="font-semibold text-[#0a0d12] text-[15px] leading-snug sm:text-[16px] dark:text-white">
								{card.title}
							</h3>
							<p className="mt-2.5 text-[#0a0d12]/56 text-[14px] leading-[1.7] sm:text-[15px] dark:text-white/56">
								{card.description}
							</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
