"use client";

import React from "react";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { ToolUpsell } from "@reloop/web/components/landing/tools/tool-chrome";
import { accentStyles } from "@reloop/web/lib/landing/page-accents";
import type { LandingPageDefinition } from "@reloop/web/lib/landing/types";
import { getUseCaseEnrichment } from "@reloop/web/lib/landing/use-cases/enrichment";
import Link from "next/link";

interface LayoutProps {
	config: LandingPageDefinition;
	children: React.ReactNode;
}

// 1. Split-Screen Layout (Transactional & Security)
export function SplitScreenLayout({ config, children }: LayoutProps) {
	const extra = getUseCaseEnrichment(config.slug);
	const accent = accentStyles[extra.accent];

	return (
		<div className="min-h-screen bg-white dark:bg-black font-sans text-left">
			<div className="border-stroke-soft-200 border-b dark:border-white/10">
				<div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-16">
					<div>
						<nav className="mb-4 flex gap-2 text-[13px] text-text-sub-600 dark:text-white/40">
							<Link href="/use-cases" className="hover:text-primary-base">
								Use cases
							</Link>
							<span>/</span>
							<span>{config.titleLines.join(" ")}</span>
						</nav>
						<span
							className={`inline-flex rounded-full px-3 py-1 font-semibold text-[11px] uppercase tracking-wider ${accent.badge}`}
						>
							Security & Speed
						</span>
						<h1 className="mt-4 font-semibold text-3xl text-text-strong-950 tracking-tight sm:text-4xl dark:text-white">
							{config.titleLines.join(" ")}
						</h1>
						<p className="mt-4 text-[16px] text-text-sub-600 leading-relaxed dark:text-white/55">
							{config.description}
						</p>
						<div className="mt-6 flex flex-wrap gap-3">
							{config.primaryCta && (
								<Link
									href={config.primaryCta.href}
									className={Button.buttonVariants({ variant: "neutral" }).root({
										className: "rounded-full",
									})}
								>
									{config.primaryCta.label}
								</Link>
							)}
							{config.secondaryCta && (
								<Link
									href={config.secondaryCta.href}
									className={Button.buttonVariants({
										mode: "stroke",
										variant: "neutral",
									}).root({ className: "rounded-full" })}
								>
									{config.secondaryCta.label}
								</Link>
							)}
						</div>
						<div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-stroke-soft-200 px-4 py-3 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/10">
							<span className={`font-bold text-2xl ${accent.text}`}>
								{extra.metric.value}
							</span>
							<span className="text-[13px] text-text-sub-600 dark:text-white/45">
								{extra.metric.label}
							</span>
						</div>
					</div>

					<div className="w-full h-full min-h-[420px] max-w-xl mx-auto flex items-center justify-center">
						{children}
					</div>
				</div>
			</div>

			{/* Flow Steps */}
			<div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
				<h2 className="font-semibold text-lg text-text-strong-950 dark:text-white">
					Execution flow
				</h2>
				<ol className="mt-8 grid gap-6 sm:grid-cols-3">
					{extra.flow.map((step, i) => (
						<li
							key={step}
							className="relative rounded-2xl border border-stroke-soft-200 p-6 dark:border-white/10"
						>
							<span
								className={`flex size-8 items-center justify-center rounded-full font-bold text-sm text-white ${accent.bg}`}
							>
								{i + 1}
							</span>
							<p className="mt-4 text-[15px] text-text-sub-600 leading-relaxed dark:text-white/55">
								{step}
							</p>
						</li>
					))}
				</ol>
			</div>

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

// 2. Console-First Dark Layout (API & Devops Ops)
export function ConsoleFirstLayout({ config, children }: LayoutProps) {
	const extra = getUseCaseEnrichment(config.slug);
	const accent = accentStyles[extra.accent];

	return (
		<div className="min-h-screen bg-slate-950 text-white font-sans text-left">
			{/* Hero & Terminal */}
			<div className="relative pt-24 pb-16 overflow-hidden border-b border-white/5">
				{/* Background Glow */}
				<div className="pointer-events-none absolute inset-0">
					<div className="-translate-x-1/2 absolute top-0 left-1/2 h-[350px] w-[800px] rounded-full bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-transparent blur-[100px]" />
				</div>

				<div className="relative mx-auto max-w-6xl px-4 sm:px-6 grid gap-12 lg:grid-cols-12 items-center">
					<div className="lg:col-span-5 space-y-6">
						<nav className="flex gap-2 text-[13px] text-white/40">
							<Link href="/use-cases" className="hover:text-cyan-400">
								Use cases
							</Link>
							<span>/</span>
							<span>{config.titleLines.join(" ")}</span>
						</nav>

						<span className="inline-flex rounded-full bg-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-cyan-400 border border-white/5">
							Developer API
						</span>

						<h1 className="font-semibold text-3xl tracking-tight sm:text-4xl text-white">
							{config.titleLines.join(" ")}
						</h1>

						<p className="text-[15px] text-white/60 leading-relaxed">
							{config.description}
						</p>

						<div className="flex flex-wrap gap-3">
							{config.primaryCta && (
								<Link
									href={config.primaryCta.href}
									className="px-5 py-2.5 rounded-full bg-white text-black font-semibold text-xs transition-colors hover:bg-slate-200"
								>
									{config.primaryCta.label}
								</Link>
							)}
							{config.secondaryCta && (
								<Link
									href={config.secondaryCta.href}
									className="px-5 py-2.5 rounded-full bg-slate-900 border border-white/10 text-white/80 font-semibold text-xs transition-colors hover:bg-slate-800"
								>
									{config.secondaryCta.label}
								</Link>
							)}
						</div>
					</div>

					<div className="lg:col-span-7 w-full max-w-2xl mx-auto">
						{children}
					</div>
				</div>
			</div>

			{/* Technical Specs section */}
			<div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
				<h2 className="text-xl font-bold tracking-tight text-white mb-8">Technical specifications</h2>
				<div className="grid gap-6 sm:grid-cols-3">
					{config.sections[0]?.items.map((item) => (
						<div key={item.title} className="bg-slate-900/60 border border-white/5 p-6 rounded-2xl">
							<h3 className="font-semibold text-sm text-cyan-400 mb-2">{item.title}</h3>
							<p className="text-xs text-white/50 leading-relaxed">{item.description}</p>
						</div>
					))}
				</div>
			</div>

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

// 3. Centered Visual Layout (Campaigns & Onboarding)
export function CenteredVisualLayout({ config, children }: LayoutProps) {
	const extra = getUseCaseEnrichment(config.slug);
	const accent = accentStyles[extra.accent];

	return (
		<div className="min-h-screen bg-white dark:bg-black font-sans text-center">
			{/* Centered Hero */}
			<div className="relative pt-24 pb-16 border-b border-stroke-soft-200 dark:border-white/10 bg-slate-50/20 dark:bg-slate-900/[0.05]">
				<div className="pointer-events-none absolute inset-0">
					<div className="-translate-x-1/2 absolute top-0 left-1/2 h-[350px] w-[800px] rounded-full bg-gradient-to-r from-rose-500/[0.06] via-violet-500/[0.06] to-transparent blur-[120px]" />
				</div>

				<div className="relative mx-auto max-w-3xl px-4 sm:px-6 flex flex-col items-center">
					<nav className="mb-6 flex gap-2 text-[13px] text-text-sub-600 dark:text-white/40 justify-center">
						<Link href="/use-cases" className="hover:text-primary-base">
							Use cases
						</Link>
						<span>/</span>
						<span>{config.titleLines.join(" ")}</span>
					</nav>

					<span className={`inline-flex rounded-full px-3 py-1 font-semibold text-[10px] uppercase tracking-wider mb-4 ${accent.badge}`}>
						Campaign Automation
					</span>

					<h1 className="font-semibold text-3xl tracking-tight sm:text-5xl text-text-strong-950 dark:text-white max-w-xl">
						{config.titleLines.join(" ")}
					</h1>

					<p className="mt-4 text-[16px] text-text-sub-600 dark:text-white/55 leading-relaxed max-w-2xl">
						{config.description}
					</p>

					<div className="mt-6 flex gap-3 justify-center">
						{config.primaryCta && (
							<Link
								href={config.primaryCta.href}
								className={Button.buttonVariants({ variant: "neutral" }).root({
									className: "rounded-full px-6",
								})}
							>
								{config.primaryCta.label}
							</Link>
						)}
					</div>
				</div>

				{/* Wide Centered Widget Container */}
				<div className="mt-14 max-w-4xl mx-auto px-4">
					<div className="bg-slate-950 p-1.5 rounded-[22px] border border-white/5 shadow-2xl">
						{children}
					</div>
				</div>
			</div>

			{/* Flow timeline */}
			<div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
				<h2 className="font-semibold text-lg text-text-strong-950 dark:text-white mb-10 text-center">
					Campaign workflow stages
				</h2>
				<div className="grid gap-6 sm:grid-cols-3">
					{extra.flow.map((step, i) => (
						<div key={step} className="bg-white dark:bg-slate-900/10 border border-stroke-soft-200 dark:border-white/5 p-6 rounded-2xl text-left flex flex-col gap-4">
							<span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${accent.bg}`}>
								{i + 1}
							</span>
							<p className="text-sm text-text-sub-600 dark:text-white/55 leading-relaxed">{step}</p>
						</div>
					))}
				</div>
			</div>

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

// 4. Automation Flow Layout (Workflows & Pipelines)
export function AutomationFlowLayout({ config, children }: LayoutProps) {
	const extra = getUseCaseEnrichment(config.slug);
	const accent = accentStyles[extra.accent];

	return (
		<div className="min-h-screen bg-white dark:bg-black font-sans text-left">
			<div className="border-stroke-soft-200 border-b dark:border-white/10">
				<div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 flex flex-col gap-10">
					{/* Breadcrumbs */}
					<nav className="flex gap-2 text-[13px] text-text-sub-600 dark:text-white/40">
						<Link href="/use-cases" className="hover:text-primary-base">
							Use cases
						</Link>
						<span>/</span>
						<span>{config.titleLines.join(" ")}</span>
					</nav>

					<div className="grid gap-10 lg:grid-cols-12 items-center">
						<div className="lg:col-span-5 space-y-6">
							<span className={`inline-flex rounded-full px-3 py-1 font-semibold text-[11px] uppercase tracking-wider ${accent.badge}`}>
								Workflow Engine
							</span>
							<h1 className="font-semibold text-3xl text-text-strong-950 tracking-tight sm:text-4xl dark:text-white">
								{config.titleLines.join(" ")}
							</h1>
							<p className="text-[16px] text-text-sub-600 leading-relaxed dark:text-white/55">
								{config.description}
							</p>
							<div className="flex gap-3">
								{config.primaryCta && (
									<Link
										href={config.primaryCta.href}
										className={Button.buttonVariants({ variant: "neutral" }).root({
											className: "rounded-full",
										})}
									>
										{config.primaryCta.label}
									</Link>
								)}
							</div>
						</div>

						{/* Terminal/Node Canvas Container */}
						<div className="lg:col-span-7 w-full max-w-2xl mx-auto">
							{children}
						</div>
					</div>
				</div>
			</div>

			{/* Workflow details */}
			<div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
				<h2 className="font-semibold text-lg text-text-strong-950 dark:text-white mb-8">System triggers & hooks</h2>
				<div className="grid gap-6 sm:grid-cols-3">
					{config.sections[0]?.items.map((item) => (
						<div key={item.title} className="bg-slate-50 dark:bg-slate-900/10 border border-stroke-soft-200 dark:border-white/5 p-6 rounded-2xl">
							<h3 className="font-bold text-sm text-text-strong-950 dark:text-white mb-2">{item.title}</h3>
							<p className="text-xs text-text-sub-600 dark:text-white/50 leading-relaxed">{item.description}</p>
						</div>
					))}
				</div>
			</div>

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
