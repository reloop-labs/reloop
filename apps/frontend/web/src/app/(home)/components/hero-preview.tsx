"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useState } from "react";
import { HeroAnalyticsPreview } from "./hero-analytics-preview";
import { HeroDashboardShell } from "./hero-dashboard-shell";
import { HeroDomainPreview } from "./hero-domain-preview";
import { HeroEmailsPreview } from "./hero-emails-preview";

export type HeroTabId =
	| "overview"
	| "analytics"
	| "domain"
	| "workflow"
	| "templates"
	| "dashboard"
	| "sdk"
	| "cloud"
	| "agents";

export function HeroPreview({ tab }: { tab: HeroTabId }) {
	const activeNav =
		tab === "overview" || tab === "dashboard"
			? "emails"
			: tab === "analytics"
				? "metrics"
				: tab === "domain" || tab === "sdk" || tab === "cloud"
					? "domain"
					: tab === "workflow"
						? "workflow"
						: tab === "templates"
							? "templates"
							: "inbox";

	return (
		<div className="flex h-full flex-col" aria-hidden>
			<HeroDashboardShell activeItem={activeNav}>
				{tab === "overview" || tab === "dashboard" ? (
					<HeroEmailsPreview />
				) : tab === "analytics" ? (
					<HeroAnalyticsPreview />
				) : tab === "domain" || tab === "sdk" ? (
					<HeroDomainPreview />
				) : tab === "workflow" ? (
					<WorkflowPanel />
				) : tab === "templates" ? (
					<TemplatesPanel />
				) : tab === "cloud" ? (
					<CloudPanel />
				) : (
					<AgentsPanel />
				)}
			</HeroDashboardShell>
		</div>
	);
}

function WorkflowPanel() {
	const [simulating, setSimulating] = useState(false);
	const [activeStep, setActiveStep] = useState<number>(0);

	const runSimulation = () => {
		if (simulating) return;
		setSimulating(true);
		setActiveStep(1);

		setTimeout(() => setActiveStep(2), 700);
		setTimeout(() => setActiveStep(3), 1500);
		setTimeout(() => {
			setActiveStep(4);
			setSimulating(false);
		}, 2400);
	};

	return (
		<div className="flex h-full flex-col overflow-hidden bg-bg-white-0 text-left font-sans dark:bg-black">
			{/* Workflow Top Toolbar */}
			<div className="flex shrink-0 items-center justify-between border-stroke-soft-200 border-b px-4 py-2.5 sm:px-6 dark:border-white/10">
				<div className="flex items-center gap-2 sm:gap-3">
					<div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
						<Icon name="workflow" className="size-4" />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="font-semibold text-[13px] text-text-strong-950 dark:text-white">
								user_onboarding.flow
							</span>
							<span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-[10px] text-emerald-600 dark:text-emerald-400">
								Active
							</span>
						</div>
						<p className="text-[11px] text-text-soft-400 dark:text-white/40">
							Triggered by auth.signup · 14,280 runs this week
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={runSimulation}
						disabled={simulating}
						className="inline-flex h-7.5 items-center gap-1.5 rounded-lg bg-text-strong-950 px-3 font-medium text-[12px] text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
					>
						<span className={cn("size-1.5 rounded-full bg-emerald-400", simulating && "animate-pulse")} />
						{simulating ? "Executing..." : "Test Flow"}
					</button>
				</div>
			</div>

			{/* Canvas Flow Area */}
			<div className="relative flex-1 overflow-y-auto p-4 sm:p-6">
				{/* Background Dot/Grid pattern */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 bg-[radial-gradient(#00000010_1px,transparent_1px)] bg-[size:16px_16px] dark:bg-[radial-gradient(#ffffff10_1px,transparent_1px)]"
				/>

				<div className="relative mx-auto flex max-w-xl flex-col items-center gap-3">
					{/* Step 1: Trigger */}
					<div
						className={cn(
							"w-full rounded-xl border bg-bg-white-0 p-3.5 shadow-xs transition-all duration-300 dark:bg-[#111]",
							activeStep >= 1
								? "border-blue-500 shadow-blue-500/10 ring-2 ring-blue-500/20"
								: "border-stroke-soft-200 dark:border-white/10",
						)}
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2.5">
								<span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
									<Icon name="webhook" className="size-3.5" />
								</span>
								<div>
									<p className="font-semibold text-[13px] text-text-strong-950 dark:text-white">
										1. Event Trigger
									</p>
									<p className="text-[11px] text-text-sub-600 dark:text-white/50">
										Webhook: <code className="font-mono">auth.signup</code>
									</p>
								</div>
							</div>
							<span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
								✓ Realtime
							</span>
						</div>
					</div>

					{/* Connector */}
					<div className="h-4 w-px bg-stroke-soft-200 dark:bg-white/15" />

					{/* Step 2: Send Welcome Email */}
					<div
						className={cn(
							"w-full rounded-xl border bg-bg-white-0 p-3.5 shadow-xs transition-all duration-300 dark:bg-[#111]",
							activeStep >= 2
								? "border-blue-500 shadow-blue-500/10 ring-2 ring-blue-500/20"
								: "border-stroke-soft-200 dark:border-white/10",
						)}
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2.5">
								<span className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
									<Icon name="mail-single" className="size-3.5" />
								</span>
								<div>
									<p className="font-semibold text-[13px] text-text-strong-950 dark:text-white">
										2. Send Email
									</p>
									<p className="text-[11px] text-text-sub-600 dark:text-white/50">
										Template: <code className="font-mono">welcome_onboarding</code> (Instant)
									</p>
								</div>
							</div>
							<span className="rounded-md bg-bg-weak-50 px-2 py-0.5 text-[11px] text-text-sub-600 dark:bg-white/10 dark:text-white/60">
								99.6% delivered
							</span>
						</div>
					</div>

					{/* Connector */}
					<div className="h-4 w-px bg-stroke-soft-200 dark:bg-white/15" />

					{/* Step 3: Condition Branch */}
					<div
						className={cn(
							"w-full rounded-xl border bg-bg-white-0 p-3.5 shadow-xs transition-all duration-300 dark:bg-[#111]",
							activeStep >= 3
								? "border-amber-500 shadow-amber-500/10 ring-2 ring-amber-500/20"
								: "border-stroke-soft-200 dark:border-white/10",
						)}
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2.5">
								<span className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
									<Icon name="workflow" className="size-3.5" />
								</span>
								<div>
									<p className="font-semibold text-[13px] text-text-strong-950 dark:text-white">
										3. Check Engagement
									</p>
									<p className="text-[11px] text-text-sub-600 dark:text-white/50">
										Condition: <code className="font-mono">email.clicked === true</code> within 24h
									</p>
								</div>
							</div>
							<span className="font-medium text-[11px] text-amber-600 dark:text-amber-400">
								Branch (2 paths)
							</span>
						</div>
					</div>

					{/* Branches Grid */}
					<div className="grid w-full grid-cols-2 gap-3 pt-1">
						{/* Branch Yes */}
						<div
							className={cn(
								"rounded-xl border bg-bg-white-0 p-3 shadow-xs transition-all duration-300 dark:bg-[#111]",
								activeStep >= 4
									? "border-emerald-500/60 bg-emerald-50/20 dark:bg-emerald-950/10"
									: "border-stroke-soft-200 dark:border-white/10",
							)}
						>
							<div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
								<span className="size-1.5 rounded-full bg-current" />
								<span className="font-semibold text-[11px] uppercase tracking-wider">
									Yes (68%)
								</span>
							</div>
							<p className="mt-1 font-medium text-[12px] text-text-strong-950 dark:text-white">
								Send Product Tour
							</p>
							<p className="text-[10px] text-text-soft-400 dark:text-white/40">
								Tag: <code className="font-mono">engaged_user</code>
							</p>
						</div>

						{/* Branch No */}
						<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-xs dark:border-white/10 dark:bg-[#111]">
							<div className="flex items-center gap-1.5 text-text-soft-400 dark:text-white/40">
								<span className="size-1.5 rounded-full bg-current" />
								<span className="font-semibold text-[11px] uppercase tracking-wider">
									No (32%)
								</span>
							</div>
							<p className="mt-1 font-medium text-[12px] text-text-strong-950 dark:text-white">
								Send Nudge Email
							</p>
							<p className="text-[10px] text-text-soft-400 dark:text-white/40">
								Delay: 48 hours
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function TemplatesPanel() {
	const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

	return (
		<div className="flex h-full flex-col overflow-hidden bg-bg-white-0 text-left font-sans dark:bg-black">
			{/* Template Toolbar */}
			<div className="flex shrink-0 items-center justify-between border-stroke-soft-200 border-b px-4 py-2.5 sm:px-6 dark:border-white/10">
				<div className="flex items-center gap-2 sm:gap-3">
					<div className="flex size-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400">
						<Icon name="layout" className="size-4" />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="font-semibold text-[13px] text-text-strong-950 dark:text-white">
								welcome_v2.tsx
							</span>
							<span className="rounded-full bg-purple-500/10 px-2 py-0.5 font-medium text-[10px] text-purple-600 dark:text-purple-400">
								React Email / MJML
							</span>
						</div>
						<p className="text-[11px] text-text-soft-400 dark:text-white/40">
							Variables: user.name, magic_link, org.name
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<div className="hidden items-center rounded-lg border border-stroke-soft-200 p-0.5 sm:flex dark:border-white/10">
						<button
							type="button"
							onClick={() => setViewMode("desktop")}
							className={cn(
								"rounded-md px-2 py-1 font-medium text-[11px] transition-colors",
								viewMode === "desktop"
									? "bg-text-strong-950 text-white dark:bg-white dark:text-black"
									: "text-text-sub-600 dark:text-white/50",
							)}
						>
							Desktop
						</button>
						<button
							type="button"
							onClick={() => setViewMode("mobile")}
							className={cn(
								"rounded-md px-2 py-1 font-medium text-[11px] transition-colors",
								viewMode === "mobile"
									? "bg-text-strong-950 text-white dark:bg-white dark:text-black"
									: "text-text-sub-600 dark:text-white/50",
							)}
						>
							Mobile
						</button>
					</div>
					<span className="inline-flex h-7.5 items-center rounded-lg bg-text-strong-950 px-3 font-medium text-[12px] text-white dark:bg-white dark:text-black">
						Publish
					</span>
				</div>
			</div>

			{/* Template Workspace Grid */}
			<div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[240px_minmax(0,1fr)]">
				{/* Left: Dynamic Variables & Component Library */}
				<div className="hidden border-stroke-soft-200 border-r p-4 lg:block dark:border-white/10">
					<p className="font-semibold text-[10px] text-text-soft-400 uppercase tracking-wider dark:text-white/40">
						Template Variables
					</p>
					<div className="mt-2 space-y-1.5">
						<div className="rounded-lg border border-stroke-soft-200 bg-bg-weak-50/50 p-2 text-[11px] dark:border-white/10 dark:bg-white/[0.02]">
							<span className="font-mono text-purple-600 dark:text-purple-400">
								{"{{ user.name }}"}
							</span>
							<p className="text-[10px] text-text-soft-400">Maya Chen</p>
						</div>
						<div className="rounded-lg border border-stroke-soft-200 bg-bg-weak-50/50 p-2 text-[11px] dark:border-white/10 dark:bg-white/[0.02]">
							<span className="font-mono text-purple-600 dark:text-purple-400">
								{"{{ org.name }}"}
							</span>
							<p className="text-[10px] text-text-soft-400">Acme Labs</p>
						</div>
						<div className="rounded-lg border border-stroke-soft-200 bg-bg-weak-50/50 p-2 text-[11px] dark:border-white/10 dark:bg-white/[0.02]">
							<span className="font-mono text-purple-600 dark:text-purple-400">
								{"{{ cta.url }}"}
							</span>
							<p className="text-[10px] text-text-soft-400">https://app.reloop.sh</p>
						</div>
					</div>

					<p className="mt-5 font-semibold text-[10px] text-text-soft-400 uppercase tracking-wider dark:text-white/40">
						Components
					</p>
					<div className="mt-2 space-y-1 text-[11px]">
						<div className="flex items-center gap-2 rounded-md p-1.5 text-text-sub-600 dark:text-white/60">
							<span className="size-2 rounded-full bg-blue-500" /> Header with Logo
						</div>
						<div className="flex items-center gap-2 rounded-md p-1.5 text-text-sub-600 dark:text-white/60">
							<span className="size-2 rounded-full bg-purple-500" /> Dynamic Hero Button
						</div>
						<div className="flex items-center gap-2 rounded-md p-1.5 text-text-sub-600 dark:text-white/60">
							<span className="size-2 rounded-full bg-emerald-500" /> One-Click Footer
						</div>
					</div>
				</div>

				{/* Right: Live Rendered Email Canvas */}
				<div className="flex flex-1 items-center justify-center overflow-y-auto bg-bg-weak-50/30 p-4 sm:p-6 dark:bg-white/[0.01]">
					<div
						className={cn(
							"w-full rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-sm transition-all duration-300 dark:border-white/10 dark:bg-[#0c0c0d]",
							viewMode === "mobile" ? "max-w-[340px]" : "max-w-[480px]",
						)}
					>
						{/* Email Header */}
						<div className="flex items-center justify-between border-stroke-soft-200 border-b pb-4 dark:border-white/10">
							<div className="flex items-center gap-2">
								<div className="size-6 rounded-md bg-text-strong-950 text-center font-bold text-[11px] text-white leading-6 dark:bg-white dark:text-black">
									R
								</div>
								<span className="font-semibold text-[13px] text-text-strong-950 dark:text-white">
									Reloop
								</span>
							</div>
							<span className="text-[11px] text-text-soft-400 dark:text-white/40">
								Transactional
							</span>
						</div>

						{/* Email Body */}
						<div className="py-5">
							<h3 className="font-bold text-[18px] text-text-strong-950 leading-snug tracking-tight dark:text-white">
								Welcome to Reloop, Maya!
							</h3>
							<p className="mt-2 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/60">
								Your team workspace at <span className="font-medium text-text-strong-950 dark:text-white">Acme Labs</span> is ready. Send, track, and automate high-deliverability emails with pure developer DX.
							</p>

							<div className="mt-5">
								<span className="inline-flex items-center justify-center rounded-xl bg-text-strong-950 px-5 py-2.5 font-semibold text-[12px] text-white shadow-xs dark:bg-white dark:text-black">
									Open Developer Console →
								</span>
							</div>
						</div>

						{/* Email Footer */}
						<div className="border-stroke-soft-200 border-t pt-4 text-[11px] text-text-soft-400 dark:border-white/10 dark:text-white/40">
							<p>Reloop Labs · 100% open-source email infrastructure</p>
							<p className="mt-1">Unsubscribe or manage notification settings</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function CloudPanel() {
	return (
		<div className="px-5 pt-6 sm:px-8 sm:pt-8">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<h3 className="font-medium text-[15px] text-text-strong-950 dark:text-white">
					All domains
				</h3>
				<div className="flex items-center gap-2">
					<span className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-stroke-soft-200 px-2.5 text-[12px] text-text-soft-400 dark:border-white/10 dark:text-white/40">
						<SearchGlyph />
						Search domains
					</span>
					<span className="hidden h-8 items-center gap-1 rounded-lg border border-stroke-soft-200 px-2.5 text-[12px] text-text-sub-600 sm:inline-flex dark:border-white/10 dark:text-white/50">
						Sort by activity
						<CaretGlyph />
					</span>
					<span className="inline-flex h-8 items-center rounded-lg border border-stroke-soft-200 px-2.5 font-medium text-[12px] text-text-strong-950 dark:border-white/10 dark:text-white">
						Add domain
					</span>
				</div>
			</div>

			<div className="mt-6 overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 dark:border-white/10 dark:bg-black">
				<div className="grid gap-0 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
					<div className="border-stroke-soft-200 border-b p-4 lg:border-r lg:border-b-0 dark:border-white/10">
						<EmailThumbnail />
					</div>
					<div className="p-5 sm:p-6">
						<div className="flex items-start justify-between gap-3">
							<h4 className="font-medium text-[16px] text-text-strong-950 dark:text-white">
								Ignite
							</h4>
							<span className="text-text-soft-400 dark:text-white/30">
								<svg viewBox="0 0 16 16" className="size-4" fill="none">
									<path
										d="M8 2.2 9.3 6h3.8l-3 2.2 1.1 3.7L8 9.8 4.8 11.9 5.9 8.2 2.9 6h3.8L8 2.2Z"
										stroke="currentColor"
										strokeWidth="1.2"
										strokeLinejoin="round"
									/>
								</svg>
							</span>
						</div>
						<div className="mt-4 grid grid-cols-2 gap-6">
							<Meta label="Sending" value="mail.acme.com" />
							<Meta label="Inbox" value="inbox.acme.com" />
						</div>
						<div className="mt-5 grid grid-cols-2 gap-6">
							<div>
								<p className="text-[12px] text-text-soft-400 dark:text-white/40">
									Status
								</p>
								<p className="mt-1 flex items-center gap-1.5 text-[13px] text-text-strong-950 dark:text-white">
									<span className="size-1.5 rounded-full bg-emerald-500" />
									Live
								</p>
							</div>
							<div>
								<p className="text-[12px] text-text-soft-400 dark:text-white/40">
									Created
								</p>
								<p className="mt-1 flex items-center gap-1.5 text-[13px] text-text-strong-950 dark:text-white">
									<span className="flex size-4 items-center justify-center rounded-full bg-amber-100 text-[8px] text-amber-900 dark:bg-amber-400/20 dark:text-amber-200">
										P
									</span>
									peterigh · 11d ago
								</p>
							</div>
						</div>
						<div className="mt-5">
							<p className="text-[12px] text-text-soft-400 dark:text-white/40">
								Latest activity
							</p>
							<p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-text-sub-600 dark:text-white/55">
								<span className="size-1.5 rounded-full bg-emerald-500" />
								<span className="font-medium text-text-strong-950 dark:text-white">
									main
								</span>
								<span className="font-mono text-[12px] text-text-soft-400">
									e3542b9
								</span>
								<span>feat: Welcome sequence (#267)</span>
							</p>
						</div>
					</div>
				</div>
				<div className="flex items-center justify-between border-stroke-soft-200 border-t px-5 py-3 dark:border-white/10">
					<span className="text-[12px] text-text-soft-400 dark:text-white/40">
						Domain details
					</span>
					<div className="flex items-center gap-2 text-text-soft-400 dark:text-white/35">
						<span className="size-3.5 rounded-[3px] border border-current" />
						<span className="size-3.5 rounded-full border border-current" />
						<span className="size-3.5 rounded-[3px] border border-current" />
					</div>
				</div>
			</div>
		</div>
	);
}

function AgentsPanel() {
	return (
		<div className="grid h-full lg:grid-cols-[220px_minmax(0,1fr)]">
			<div className="hidden border-stroke-soft-200 border-r p-4 lg:block dark:border-white/10">
				<p className="px-2 font-medium text-[11px] text-text-soft-400 uppercase tracking-wider dark:text-white/35">
					Inbox
				</p>
				<div className="mt-3 space-y-1">
					<InboxItem active from="Alex Smith" preview="Invoice charged twice" />
					<InboxItem from="Maya Chen" preview="Can we move onboarding?" />
					<InboxItem from="Orbit" preview="Weekly usage report" />
				</div>
			</div>
			<div className="p-5 sm:p-6">
				<div className="flex items-center justify-between">
					<div>
						<p className="font-medium text-[14px] text-text-strong-950 dark:text-white">
							Invoice charged twice
						</p>
						<p className="mt-0.5 text-[12px] text-text-soft-400 dark:text-white/40">
							alex@northwind.io · needs approval
						</p>
					</div>
					<span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-[11px] text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
						94%
					</span>
				</div>
				<div className="mt-5 rounded-xl border border-stroke-soft-200 p-4 dark:border-white/10">
					<p className="text-[11px] text-text-soft-400 uppercase tracking-wider dark:text-white/35">
						Agent draft
					</p>
					<p className="mt-2 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/60">
						Hi Alex — I found the duplicate charge on invoice #1024 and issued a
						$49 refund to the original card. It should land in 3–5 days.
					</p>
				</div>
				<div className="mt-4 flex gap-2">
					<span className="inline-flex h-8 items-center rounded-lg bg-text-strong-950 px-3 font-medium text-[12px] text-white dark:bg-white dark:text-black">
						Approve
					</span>
					<span className="inline-flex h-8 items-center rounded-lg border border-stroke-soft-200 px-3 text-[12px] text-text-sub-600 dark:border-white/10 dark:text-white/50">
						Edit draft
					</span>
				</div>
			</div>
		</div>
	);
}

function EmailThumbnail() {
	return (
		<div className="overflow-hidden rounded-lg border border-stroke-soft-200 bg-bg-white-0 dark:border-white/10 dark:bg-black">
			<div className="flex items-center justify-between border-stroke-soft-200 border-b px-3 py-2 dark:border-white/10">
				<div className="h-1.5 w-10 rounded-full bg-text-strong-950 dark:bg-white" />
				<div className="flex gap-1">
					<div className="h-1.5 w-6 rounded-full bg-stroke-soft-200 dark:bg-white/15" />
					<div className="h-1.5 w-6 rounded-full bg-stroke-soft-200 dark:bg-white/15" />
				</div>
			</div>
			<div className="bg-gradient-to-b from-bg-weak-50 to-bg-white-0 px-4 py-5 dark:from-white/[0.04] dark:to-black">
				<p className="font-medium text-[11px] text-text-strong-950 leading-tight tracking-tight dark:text-white">
					A new way to
					<br />
					send email
				</p>
				<div className="mt-3 space-y-1.5">
					<div className="h-1 w-full rounded-full bg-stroke-soft-200 dark:bg-white/12" />
					<div className="h-1 w-4/5 rounded-full bg-stroke-soft-200 dark:bg-white/12" />
				</div>
				<div className="mt-3 h-4 w-12 rounded-sm bg-text-strong-950 dark:bg-white" />
				<div className="mt-4 grid grid-cols-3 gap-1">
					<div className="h-8 rounded-sm bg-indigo-200/90 dark:bg-indigo-400/30" />
					<div className="h-8 rounded-sm bg-sky-200/90 dark:bg-sky-400/30" />
					<div className="h-8 rounded-sm bg-violet-200/80 dark:bg-violet-400/25" />
				</div>
			</div>
		</div>
	);
}

function Meta({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<p className="text-[12px] text-text-soft-400 dark:text-white/40">
				{label}
			</p>
			<p className="mt-1 truncate text-[13px] text-text-strong-950 dark:text-white">
				{value}
			</p>
		</div>
	);
}

function InboxItem({
	from,
	preview,
	active,
}: {
	from: string;
	preview: string;
	active?: boolean;
}) {
	return (
		<div
			className={
				active
					? "rounded-lg bg-bg-weak-50 px-2.5 py-2 dark:bg-white/[0.05]"
					: "rounded-lg px-2.5 py-2"
			}
		>
			<p className="truncate font-medium text-[12px] text-text-strong-950 dark:text-white">
				{from}
			</p>
			<p className="truncate text-[11px] text-text-soft-400 dark:text-white/40">
				{preview}
			</p>
		</div>
	);
}

function SearchGlyph() {
	return (
		<svg viewBox="0 0 12 12" className="size-3" fill="none">
			<circle
				cx="5.2"
				cy="5.2"
				r="3.2"
				stroke="currentColor"
				strokeWidth="1.2"
			/>
			<path
				d="M7.6 7.6 10 10"
				stroke="currentColor"
				strokeWidth="1.2"
				strokeLinecap="round"
			/>
		</svg>
	);
}

function CaretGlyph() {
	return (
		<svg viewBox="0 0 12 12" className="size-2.5" fill="none">
			<path
				d="M3 4.5 6 7.5 9 4.5"
				stroke="currentColor"
				strokeWidth="1.4"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}
