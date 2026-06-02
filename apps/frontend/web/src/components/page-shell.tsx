import { FeatureCta } from "@reloop/web/components/landing/cta";
import { FeatureHero } from "@reloop/web/components/landing/hero";
import type { FeatureCtaLink } from "@reloop/web/components/landing/types";
import type React from "react";

export { FeatureHero, FeatureCta };

export function MarketingPageShell({
	titleLines,
	description,
	primaryCta,
	secondaryCta,
	compactHero = false,
	children,
}: {
	titleLines: string[];
	description: string;
	primaryCta: FeatureCtaLink;
	secondaryCta?: FeatureCtaLink;
	compactHero?: boolean;
	children: React.ReactNode;
}) {
	return (
		<div>
			<FeatureHero
				titleLines={titleLines}
				description={description}
				primaryCta={primaryCta}
				secondaryCta={secondaryCta}
				compact={compactHero}
			/>
			{children}
		</div>
	);
}

export function PageSection({
	children,
	alt = false,
	narrow = false,
	flushTop = false,
}: {
	children: React.ReactNode;
	alt?: boolean;
	narrow?: boolean;
	flushTop?: boolean;
}) {
	const width = narrow ? "max-w-3xl" : "max-w-[1320px]";
	const padding = narrow
		? flushTop
			? "px-4 pt-4 pb-12 sm:px-6 sm:pt-6 sm:pb-14"
			: "px-4 py-12 sm:px-6 sm:py-14 lg:py-16"
		: "px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24";

	return (
		<section
			className={
				alt
					? "bg-[#f8f8f8] text-text-strong-950 dark:bg-black dark:text-white"
					: undefined
			}
		>
			<div className={`mx-auto ${width} ${padding}`}>{children}</div>
		</section>
	);
}

export function SectionHeading({
	title,
	description,
	center = true,
	compact = false,
}: {
	title: string;
	description?: string;
	center?: boolean;
	compact?: boolean;
}) {
	return (
		<div
			className={
				center
					? compact
						? "mb-12 text-center"
						: "mb-16 text-center"
					: compact
						? "mb-10"
						: "mb-12"
			}
		>
			<h2 className="font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
				{title}
			</h2>
			{description && (
				<p
					className={`${compact ? "mt-3" : "mt-4"} max-w-2xl text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50 ${center ? "mx-auto" : ""}`}
				>
					{description}
				</p>
			)}
		</div>
	);
}

export function InfoCard({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children?: React.ReactNode;
}) {
	return (
		<div className="rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 p-8 transition-colors hover:bg-bg-soft-50 dark:border-white/10 dark:hover:bg-white/[0.02]">
			{children}
			<h3 className="mb-3 font-semibold text-lg text-text-strong-950 leading-snug dark:text-white">
				{title}
			</h3>
			<p className="text-sm text-text-sub-600 leading-relaxed dark:text-white/50">
				{description}
			</p>
		</div>
	);
}

export const cardGridClass = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3";

export const metricsGridClass = "grid gap-6 md:grid-cols-2 lg:grid-cols-4";

export function CodeBlock({ children }: { children: string }) {
	return (
		<div className="overflow-hidden rounded-3xl border border-stroke-soft-200 font-mono text-[14px] leading-relaxed sm:text-[15px] dark:border-white/10">
			<pre className="overflow-x-auto p-5 sm:p-6">{children}</pre>
		</div>
	);
}

export function ContentCard({
	children,
	className = "",
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={`rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 p-6 dark:border-white/10 ${className}`}
		>
			{children}
		</div>
	);
}
