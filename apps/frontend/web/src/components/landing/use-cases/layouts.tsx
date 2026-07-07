"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { ToolUpsell } from "@reloop/web/components/landing/tools/tool-chrome";
import { accentStyles } from "@reloop/web/lib/landing/page-accents";
import type { LandingPageDefinition } from "@reloop/web/lib/landing/types";
import { getUseCaseEnrichment } from "@reloop/web/lib/landing/use-cases/enrichment";
import Link from "next/link";
import type React from "react";

interface LayoutProps {
	config: LandingPageDefinition;
	children: React.ReactNode;
}

// 1. Split-Screen Layout (Transactional & Security)
export function SplitScreenLayout({ config, children }: LayoutProps) {
	const extra = getUseCaseEnrichment(config.slug);
	const accent = accentStyles[extra.accent];

	return (
		<div className="min-h-screen bg-white text-left font-sans dark:bg-black">
			<div className="border-stroke-soft-200 border-b dark:border-white/10">
				<div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-16">
					<div>
						<nav className="mb-4 flex gap-2 text-[13px] text-text-sub-600 dark:text-white/55">
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
									className={Button.buttonVariants({ variant: "neutral" }).root(
										{
											className: "rounded-full",
										},
									)}
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
						<div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-stroke-soft-200 bg-slate-50/50 px-4 py-3 dark:border-white/10 dark:bg-slate-900/10">
							<span className={`font-bold text-2xl ${accent.text}`}>
								{extra.metric.value}
							</span>
							<span className="text-[13px] text-text-sub-600 dark:text-white/55">
								{extra.metric.label}
							</span>
						</div>
					</div>

					<div className="mx-auto flex h-full min-h-[420px] w-full max-w-xl items-center justify-center">
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
		<div className="min-h-screen bg-slate-950 text-left font-sans text-white">
			{/* Hero & Terminal */}
			<div className="relative overflow-hidden border-white/5 border-b pt-24 pb-16">
				{/* Background Glow */}
				<div className="pointer-events-none absolute inset-0">
					<div className="-translate-x-1/2 absolute top-0 left-1/2 h-[350px] w-[800px] rounded-full bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-transparent blur-[100px]" />
				</div>

				<div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12">
					<div className="space-y-6 lg:col-span-5">
						<nav className="flex gap-2 text-[13px] text-white/40">
							<Link href="/use-cases" className="hover:text-cyan-400">
								Use cases
							</Link>
							<span>/</span>
							<span>{config.titleLines.join(" ")}</span>
						</nav>

						<span className="inline-flex rounded-full border border-white/5 bg-white/10 px-3 py-1 font-mono text-[10px] text-cyan-400 uppercase tracking-wider">
							Developer API
						</span>

						<h1 className="font-semibold text-3xl text-white tracking-tight sm:text-4xl">
							{config.titleLines.join(" ")}
						</h1>

						<p className="text-[15px] text-white/60 leading-relaxed">
							{config.description}
						</p>

						<div className="flex flex-wrap gap-3">
							{config.primaryCta && (
								<Link
									href={config.primaryCta.href}
									className="rounded-full bg-white px-5 py-2.5 font-semibold text-black text-xs transition-colors hover:bg-slate-200"
								>
									{config.primaryCta.label}
								</Link>
							)}
							{config.secondaryCta && (
								<Link
									href={config.secondaryCta.href}
									className="rounded-full border border-white/10 bg-slate-900 px-5 py-2.5 font-semibold text-white/80 text-xs transition-colors hover:bg-slate-800"
								>
									{config.secondaryCta.label}
								</Link>
							)}
						</div>
					</div>

					<div className="mx-auto w-full max-w-2xl lg:col-span-7">
						{children}
					</div>
				</div>
			</div>

			{/* Technical Specs section */}
			<div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
				<h2 className="mb-8 font-bold text-white text-xl tracking-tight">
					Technical specifications
				</h2>
				<div className="grid gap-6 sm:grid-cols-3">
					{config.sections[0]?.items.map((item) => (
						<div
							key={item.title}
							className="rounded-2xl border border-white/5 bg-slate-900/60 p-6"
						>
							<h3 className="mb-2 font-semibold text-cyan-400 text-sm">
								{item.title}
							</h3>
							<p className="text-white/50 text-xs leading-relaxed">
								{item.description}
							</p>
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
		<div className="min-h-screen bg-white text-center font-sans dark:bg-black">
			{/* Centered Hero */}
			<div className="relative border-stroke-soft-200 border-b bg-slate-50/20 pt-24 pb-16 dark:border-white/10 dark:bg-slate-900/[0.05]">
				<div className="pointer-events-none absolute inset-0">
					<div className="-translate-x-1/2 absolute top-0 left-1/2 h-[350px] w-[800px] rounded-full bg-gradient-to-r from-rose-500/[0.06] via-violet-500/[0.06] to-transparent blur-[120px]" />
				</div>

				<div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 sm:px-6">
					<nav className="mb-6 flex justify-center gap-2 text-[13px] text-text-sub-600 dark:text-white/55">
						<Link href="/use-cases" className="hover:text-primary-base">
							Use cases
						</Link>
						<span>/</span>
						<span>{config.titleLines.join(" ")}</span>
					</nav>

					<span
						className={`mb-4 inline-flex rounded-full px-3 py-1 font-semibold text-[10px] uppercase tracking-wider ${accent.badge}`}
					>
						Campaign Automation
					</span>

					<h1 className="max-w-xl font-semibold text-3xl text-text-strong-950 tracking-tight sm:text-5xl dark:text-white">
						{config.titleLines.join(" ")}
					</h1>

					<p className="mt-4 max-w-2xl text-[16px] text-text-sub-600 leading-relaxed dark:text-white/55">
						{config.description}
					</p>

					<div className="mt-6 flex justify-center gap-3">
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
				<div className="mx-auto mt-14 max-w-4xl px-4">
					<div className="rounded-[22px] border border-white/5 bg-slate-950 p-1.5 shadow-2xl">
						{children}
					</div>
				</div>
			</div>

			{/* Flow timeline */}
			<div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
				<h2 className="mb-10 text-center font-semibold text-lg text-text-strong-950 dark:text-white">
					Campaign workflow stages
				</h2>
				<div className="grid gap-6 sm:grid-cols-3">
					{extra.flow.map((step, i) => (
						<div
							key={step}
							className="flex flex-col gap-4 rounded-2xl border border-stroke-soft-200 bg-white p-6 text-left dark:border-white/5 dark:bg-slate-900/10"
						>
							<span
								className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm text-white ${accent.bg}`}
							>
								{i + 1}
							</span>
							<p className="text-sm text-text-sub-600 leading-relaxed dark:text-white/55">
								{step}
							</p>
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
		<div className="min-h-screen bg-white text-left font-sans dark:bg-black">
			<div className="border-stroke-soft-200 border-b dark:border-white/10">
				<div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6">
					{/* Breadcrumbs */}
					<nav className="flex gap-2 text-[13px] text-text-sub-600 dark:text-white/55">
						<Link href="/use-cases" className="hover:text-primary-base">
							Use cases
						</Link>
						<span>/</span>
						<span>{config.titleLines.join(" ")}</span>
					</nav>

					<div className="grid items-center gap-10 lg:grid-cols-12">
						<div className="space-y-6 lg:col-span-5">
							<span
								className={`inline-flex rounded-full px-3 py-1 font-semibold text-[11px] uppercase tracking-wider ${accent.badge}`}
							>
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
										className={Button.buttonVariants({
											variant: "neutral",
										}).root({
											className: "rounded-full",
										})}
									>
										{config.primaryCta.label}
									</Link>
								)}
							</div>
						</div>

						{/* Terminal/Node Canvas Container */}
						<div className="mx-auto w-full max-w-2xl lg:col-span-7">
							{children}
						</div>
					</div>
				</div>
			</div>

			{/* Workflow details */}
			<div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
				<h2 className="mb-8 font-semibold text-lg text-text-strong-950 dark:text-white">
					System triggers & hooks
				</h2>
				<div className="grid gap-6 sm:grid-cols-3">
					{config.sections[0]?.items.map((item) => (
						<div
							key={item.title}
							className="rounded-2xl border border-stroke-soft-200 bg-slate-50 p-6 dark:border-white/5 dark:bg-slate-900/10"
						>
							<h3 className="mb-2 font-bold text-sm text-text-strong-950 dark:text-white">
								{item.title}
							</h3>
							<p className="text-text-sub-600 text-xs leading-relaxed dark:text-white/50">
								{item.description}
							</p>
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
