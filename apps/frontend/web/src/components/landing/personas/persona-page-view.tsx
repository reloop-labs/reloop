"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { ToolUpsell } from "@reloop/web/components/landing/tools/tool-chrome";
import type { LandingPageDefinition } from "@reloop/web/lib/landing/types";
import { accentStyles } from "@reloop/web/lib/landing/page-accents";
import { getPersonaEnrichment } from "@reloop/web/lib/landing/personas/enrichment";
import Link from "next/link";

export function PersonaPageView({ config }: { config: LandingPageDefinition }) {
	const extra = getPersonaEnrichment(config.slug);
	const accent = accentStyles[extra.accent];

	return (
		<div className="min-h-screen">
			{/* Audience landing — bold gradient hero */}
			<div className={`bg-gradient-to-br ${accent.code} text-white`}>
				<div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
					<nav className="mb-6 text-[13px] text-white/50">
						<Link href="/for" className="hover:text-white">
							Who it&apos;s for
						</Link>
						<span className="mx-2">/</span>
						<span>{config.titleLines.join(" ")}</span>
					</nav>
					<h1 className="font-semibold text-4xl tracking-tight sm:text-5xl">
						{extra.headline}
					</h1>
					<p className="mt-6 max-w-2xl text-[17px] text-white/70 leading-relaxed">
						{config.description}
					</p>
					<div className="mt-8 flex flex-wrap gap-3">
						<Link
							href={config.primaryCta?.href ?? "/dashboard/signup"}
							className={Button.buttonVariants({ variant: "neutral" }).root({
								className: "rounded-xl bg-white! text-black!",
							})}
						>
							{config.primaryCta?.label ?? "Get started"}
						</Link>
						{config.secondaryCta && (
							<Link
								href={config.secondaryCta.href}
								className="inline-flex items-center rounded-xl border border-white/25 px-5 py-2.5 text-[14px] hover:bg-white/10"
							>
								{config.secondaryCta.label}
							</Link>
						)}
					</div>
				</div>
			</div>

			<div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 lg:grid-cols-2 sm:px-6">
				<div className="rounded-2xl border border-stroke-soft-200 p-8 dark:border-white/10">
					<p className="font-semibold text-[11px] text-red-500 uppercase tracking-wider">
						Without Reloop
					</p>
					<ul className="mt-6 space-y-3">
						{extra.painPoints.map((point) => (
							<li key={point} className="flex gap-2 text-[15px] text-text-sub-600 dark:text-white/55">
								<Icon name="cross-circle" className="size-5 shrink-0 text-red-400" />
								{point}
							</li>
						))}
					</ul>
				</div>
				<div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8">
					<p className="font-semibold text-[11px] text-emerald-600 uppercase tracking-wider dark:text-emerald-400">
						With Reloop
					</p>
					<ul className="mt-6 space-y-3">
						{extra.wins.map((win) => (
							<li key={win} className="flex gap-2 text-[15px] text-text-sub-600 dark:text-white/55">
								<Icon name="check" className="size-5 shrink-0 text-emerald-500" />
								{win}
							</li>
						))}
					</ul>
				</div>
			</div>

			{config.relatedLinks && (
				<div className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
					<div className="flex flex-wrap gap-2">
						{config.relatedLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className={`rounded-full px-4 py-2 text-[13px] ${accent.badge}`}
							>
								{link.label} →
							</Link>
						))}
					</div>
				</div>
			)}

			<ToolUpsell
				title={config.cta.title}
				description={config.cta.description}
				primaryHref={config.cta.primary.href}
				primaryLabel={config.cta.primary.label}
				secondaryHref={config.cta.secondary?.href}
				secondaryLabel={config.cta.secondary?.label}
			/>
		</div>
	);
}
