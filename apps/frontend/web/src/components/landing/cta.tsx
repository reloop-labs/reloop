"use client";

import Link from "next/link";
import type { FeatureCtaBand } from "./types";

export function FeatureCta({
	title,
	titleMuted,
	description,
	primary,
	secondary,
	compact = false,
}: FeatureCtaBand & { compact?: boolean }) {
	return (
		<section id="cta">
			<div
				className={`mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 ${compact ? "py-14 sm:py-16" : "py-16 sm:py-20 lg:py-24"}`}
			>
				<div className="mx-auto max-w-[920px] text-center">
					<h2 className="font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
						{title}
						{titleMuted && (
							<>
								<br />
								<span className="text-primary-base">{titleMuted}</span>
							</>
						)}
					</h2>
					<p
						className={`mx-auto max-w-[550px] font-medium text-[#0a0d12]/60 text-[15px] leading-7 sm:text-[17px] dark:text-white/60 ${compact ? "mt-6" : "mt-8"}`}
					>
						{description}
					</p>

					<div
						className={`flex flex-wrap items-center justify-center gap-4 ${compact ? "mt-8" : "mt-10"}`}
					>
						<CtaLink {...primary} filled />
						{secondary && <CtaLink {...secondary} />}
					</div>
				</div>
			</div>
		</section>
	);
}

function CtaLink({
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
		? "inline-flex h-12 items-center justify-center rounded-full bg-[#0a0d12] px-8 font-semibold text-[15px] text-white transition-colors hover:bg-[#0a0d12]/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
		: "inline-flex h-12 items-center justify-center gap-2.5 rounded-full border border-[#0a0d12]/10 px-8 font-semibold text-[#0a0d12] text-[15px] transition-colors hover:bg-[#0a0d12]/10 dark:border-white/10 dark:text-white dark:hover:bg-white/10";

	const isCrossDomain = href.startsWith("/docs") || href.startsWith("/dashboard");

	if (external || isCrossDomain) {
		return (
			<a
				href={href}
				{...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
				className={className}
			>
				{label}
			</a>
		);
	}

	return (
		<Link href={href} className={className}>
			{label}
		</Link>
	);
}
