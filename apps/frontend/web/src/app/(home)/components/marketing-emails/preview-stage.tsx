"use client";

import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { MarketingTabId } from "./preview-scenes";
import { PreviewTabs } from "./preview-tabs";

const TAB_ORDER: MarketingTabId[] = [
	"upload-data",
	"manage-funnels",
	"analytics",
];

const EASE_DEFAULT: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
const SLIDE_PX = 160;
const SLIDE_MS = 0.28;

const contentVariants = {
	enter: (dir: number) => ({
		opacity: 0,
		x: dir > 0 ? SLIDE_PX : dir < 0 ? -SLIDE_PX : 0,
	}),
	center: {
		opacity: 1,
		x: 0,
	},
	exit: (dir: number) => ({
		opacity: 0,
		x: dir > 0 ? -SLIDE_PX : dir < 0 ? SLIDE_PX : 0,
	}),
};

/* --- Scene 1: Upload Data View (Simple, Readable Contact Import Table) --- */
function UploadDataView() {
	const [activeSource, setActiveSource] = useState<"csv" | "api" | "db">("csv");

	return (
		<div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-xs dark:border-white/10 dark:bg-[#0c0c0e]">
			{/* Top Bar with Clear Source Tabs */}
			<div className="flex flex-wrap items-center justify-between gap-2 border-stroke-soft-100 border-b px-4 py-2.5 sm:px-6 dark:border-white/10">
				<div className="flex items-center gap-2">
					<div className="flex size-6 items-center justify-center rounded-md bg-bg-weak-50 text-text-strong-950 dark:bg-white/10 dark:text-white">
						<Icon name="file-code" className="size-3.5" />
					</div>
					<span className="font-medium text-text-strong-950 text-xs dark:text-white">
						Import Contacts
					</span>
				</div>

				{/* Source Selection Pills */}
				<div className="flex items-center gap-1 rounded-lg border border-stroke-soft-200 bg-bg-weak-50/50 p-0.5 text-xs dark:border-white/10 dark:bg-white/5">
					<button
						type="button"
						onClick={() => setActiveSource("csv")}
						className={cn(
							"rounded-md px-2.5 py-1 text-[11px] transition-colors",
							activeSource === "csv"
								? "bg-bg-white-0 font-medium text-text-strong-950 shadow-2xs dark:bg-[#18181b] dark:text-white"
								: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white",
						)}
					>
						CSV Upload
					</button>
					<button
						type="button"
						onClick={() => setActiveSource("api")}
						className={cn(
							"rounded-md px-2.5 py-1 text-[11px] transition-colors",
							activeSource === "api"
								? "bg-bg-white-0 font-medium text-text-strong-950 shadow-2xs dark:bg-[#18181b] dark:text-white"
								: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white",
						)}
					>
						REST API
					</button>
					<button
						type="button"
						onClick={() => setActiveSource("db")}
						className={cn(
							"rounded-md px-2.5 py-1 text-[11px] transition-colors",
							activeSource === "db"
								? "bg-bg-white-0 font-medium text-text-strong-950 shadow-2xs dark:bg-[#18181b] dark:text-white"
								: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white",
						)}
					>
						Database Sync
					</button>
				</div>
			</div>

			{/* Main Content Body */}
			<div className="space-y-3.5 p-5 sm:p-6">
				{/* File Summary Card */}
				<div className="flex items-center justify-between rounded-xl border border-stroke-soft-200 bg-transparent p-3 dark:border-white/10">
					<div className="flex items-center gap-3">
						<div className="flex size-8 items-center justify-center rounded-lg bg-text-strong-950 text-white dark:bg-white dark:text-black">
							<Icon name="file-code" className="size-4" />
						</div>
						<div>
							<div className="flex items-center gap-2">
								<span className="font-medium font-mono text-text-strong-950 text-xs dark:text-white">
									customers_q3.csv
								</span>
								<span className="rounded-full bg-emerald-500/15 px-2 py-0.2 font-medium text-[9px] text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-300">
									Ready to import
								</span>
							</div>
							<p className="mt-0.5 text-[10.5px] text-text-soft-400 dark:text-white/40">
								42,800 rows parsed · 1.8 MB
							</p>
						</div>
					</div>

					<span className="text-[11px] text-text-sub-600 dark:text-white/60">
						Preview (first 4 rows)
					</span>
				</div>

				{/* Simple, Readable Spreadsheet Preview Table */}
				<div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 dark:border-white/10 dark:bg-[#111114]">
					{/* Table Columns Header */}
					<div className="grid grid-cols-[1.5fr_1.2fr_1fr_1fr] border-stroke-soft-100 border-b px-4 py-2 font-medium text-[10.5px] text-text-soft-400 dark:border-white/5 dark:text-white/40">
						<span>EMAIL</span>
						<span>NAME</span>
						<span>PLAN</span>
						<span className="text-right">STATUS</span>
					</div>

					{/* Contact Data Rows */}
					<div className="divide-y divide-stroke-soft-100 text-xs dark:divide-white/5">
						{[
							{
								email: "sarah@acme.dev",
								name: "Sarah Jenkins",
								plan: "Pro Plan",
								status: "Subscribed",
							},
							{
								email: "alex@startup.io",
								name: "Alex Rivera",
								plan: "Enterprise",
								status: "Subscribed",
							},
							{
								email: "noah@build.co",
								name: "Noah Patel",
								plan: "Starter",
								status: "Subscribed",
							},
							{
								email: "maya@design.dev",
								name: "Maya Chen",
								plan: "Pro Plan",
								status: "Subscribed",
							},
						].map((user) => (
							<div
								key={user.email}
								className="grid grid-cols-[1.5fr_1.2fr_1fr_1fr] items-center px-4 py-2.5 text-[11px]"
							>
								<span className="truncate font-medium font-mono text-text-strong-950 dark:text-white">
									{user.email}
								</span>
								<span className="truncate text-text-sub-600 dark:text-white/70">
									{user.name}
								</span>
								<span className="truncate text-text-sub-600 dark:text-white/70">
									{user.plan}
								</span>
								<div className="flex items-center justify-end">
									<span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9.5px] text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
										<span className="size-1 rounded-full bg-emerald-500" />
										{user.status}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Bottom Actions */}
				<div className="flex items-center justify-between pt-1">
					<div className="flex items-center gap-1.5 text-[11px] text-text-sub-600 dark:text-white/60">
						<span className="size-1.5 rounded-full bg-emerald-500" />
						<span>42,800 valid contacts · 0 duplicates</span>
					</div>

					<FancyButton.Root
						variant="neutral"
						size="xsmall"
						className="rounded-lg! px-3.5!"
					>
						<span>Import 42,800 Contacts →</span>
					</FancyButton.Root>
				</div>
			</div>
		</div>
	);
}

/* --- Scene 2: Manage Funnels View (Clear, Linear Step-by-Step Drip Automation) --- */
function ManageFunnelsView() {
	const FUNNEL_STEPS = [
		{
			step: "Step 1",
			timing: "Immediately on Signup",
			timingColor:
				"bg-bg-weak-50 text-text-strong-950 dark:bg-white/10 dark:text-white",
			title: "Welcome to Reloop & Quickstart Guide",
			desc: "Send onboarding email with API keys and SDK installation steps",
			stats: "12,400 sent · 68.2% open rate",
			icon: "sparkling" as const,
		},
		{
			step: "Step 2",
			timing: "2 Days After Signup",
			timingColor:
				"bg-bg-weak-50 text-text-strong-950 dark:bg-white/10 dark:text-white",
			title: "React Email Components & Templates",
			desc: "Interactive guide on designing templates with live preview & multiplayer",
			stats: "11,820 sent · 52.4% open rate",
			icon: "layout" as const,
		},
		{
			step: "Step 3",
			timing: "5 Days After Signup",
			timingColor:
				"bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300",
			title: "Dedicated IP & Pro Plan Trial Offer",
			desc: "Special invitation to upgrade with dedicated sending pools and SLA",
			stats: "2,280 converted ($38.4k MRR)",
			icon: "modules" as const,
		},
	];

	return (
		<div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-xs dark:border-white/10 dark:bg-[#0c0c0e]">
			{/* Top Bar with Clear Header & Controls */}
			<div className="flex items-center justify-between border-stroke-soft-100 border-b px-4 py-2.5 sm:px-6 dark:border-white/10">
				<div className="flex items-center gap-2">
					<div className="flex size-6 items-center justify-center rounded-md bg-bg-weak-50 text-text-strong-950 dark:bg-white/10 dark:text-white">
						<Icon name="workflow" className="size-3.5" />
					</div>
					<span className="font-medium text-text-strong-950 text-xs dark:text-white">
						Developer Onboarding Funnel
					</span>
				</div>

				<div className="flex items-center gap-2">
					<span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-[9.5px] text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
						<span className="size-1 rounded-full bg-emerald-500" />
						Active · 12,400 enrolled
					</span>
				</div>
			</div>

			{/* Connected Step-by-Step Funnel Pipeline */}
			<div className="relative space-y-2 p-5 sm:p-6">
				{FUNNEL_STEPS.map((item, idx) => (
					<div key={item.step} className="space-y-2">
						{/* Funnel Step Card */}
						<div className="flex items-center justify-between rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3.5 shadow-2xs transition-colors hover:bg-bg-weak-50/40 dark:border-white/10 dark:bg-[#111114] dark:hover:bg-white/[0.02]">
							<div className="flex items-center gap-3">
								<div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-weak-50/60 text-text-strong-950 dark:border-white/10 dark:bg-white/5 dark:text-white">
									<Icon name={item.icon} className="size-4" />
								</div>
								<div>
									<div className="flex items-center gap-2">
										<span className="font-semibold text-text-strong-950 text-xs dark:text-white">
											{item.title}
										</span>
										<span
											className={cn(
												"rounded px-1.5 py-0.2 font-medium text-[9.5px]",
												item.timingColor,
											)}
										>
											{item.timing}
										</span>
									</div>
									<p className="mt-0.5 text-[11px] text-text-sub-600 dark:text-white/60">
										{item.desc}
									</p>
								</div>
							</div>

							<div className="hidden text-right sm:block">
								<span className="font-mono text-[11px] text-text-sub-600 dark:text-white/70">
									{item.stats}
								</span>
							</div>
						</div>

						{/* Delay Rail Connector between steps */}
						{idx < FUNNEL_STEPS.length - 1 && (
							<div className="flex items-center justify-center py-0.5">
								<div className="flex items-center gap-1.5 rounded-full border border-stroke-soft-200 bg-bg-weak-50/70 px-3 py-0.5 text-[10px] text-text-soft-400 shadow-2xs dark:border-white/10 dark:bg-white/5 dark:text-white/40">
									<span>↓</span>
									<span>{idx === 0 ? "Wait 2 days" : "Wait 3 days"}</span>
								</div>
							</div>
						)}
					</div>
				))}

				{/* Bottom Action Footer */}
				<div className="flex items-center justify-between pt-2">
					<div className="flex items-center gap-1.5 text-[11px] text-text-sub-600 dark:text-white/60">
						<span className="size-1.5 rounded-full bg-emerald-500" />
						<span>3 automated emails in sequence</span>
					</div>

					<FancyButton.Root
						variant="neutral"
						size="xsmall"
						className="rounded-lg! px-3.5!"
					>
						<span>Edit Funnel Steps →</span>
					</FancyButton.Root>
				</div>
			</div>
		</div>
	);
}

/* --- Scene 3: Marketing Analytics View (Clear, Intuitive Performance Dashboard) --- */
function AnalyticsView() {
	return (
		<div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-xs dark:border-white/10 dark:bg-[#0c0c0e]">
			{/* Top Bar with Campaign Summary */}
			<div className="flex items-center justify-between border-stroke-soft-100 border-b px-4 py-2.5 sm:px-6 dark:border-white/10">
				<div className="flex items-center gap-2">
					<div className="flex size-6 items-center justify-center rounded-md bg-bg-weak-50 text-text-strong-950 dark:bg-white/10 dark:text-white">
						<Icon name="graph-up" className="size-3.5" />
					</div>
					<span className="font-medium text-text-strong-950 text-xs dark:text-white">
						Campaign: Summer Product Release Broadcast
					</span>
				</div>
				<span className="text-[11px] text-text-soft-400 dark:text-white/40">
					42,800 recipients · Sent today
				</span>
			</div>

			{/* Main Content Body */}
			<div className="space-y-3.5 p-5 sm:p-6">
				{/* 4 Key Performance Metric Cards */}
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
					{[
						{
							label: "Delivered",
							val: "98.4%",
							sub: "42,120 sent",
							color: "text-emerald-600 dark:text-emerald-400",
						},
						{
							label: "Unique Opens",
							val: "48.6%",
							sub: "20,470 opened",
							color: "text-text-strong-950 dark:text-white",
						},
						{
							label: "Click Rate",
							val: "18.2%",
							sub: "7,665 clicked",
							color: "text-text-strong-950 dark:text-white",
						},
						{
							label: "New Upgrades",
							val: "$38.4k",
							sub: "2,280 conversions",
							color: "text-purple-600 dark:text-purple-400",
						},
					].map((kpi) => (
						<div
							key={kpi.label}
							className="rounded-xl border border-stroke-soft-200 bg-transparent p-3.5 dark:border-white/10"
						>
							<span className="font-medium text-[10.5px] text-text-soft-400 dark:text-white/40">
								{kpi.label}
							</span>
							<div
								className={cn(
									"mt-1 font-bold text-lg tracking-tight sm:text-xl",
									kpi.color,
								)}
							>
								{kpi.val}
							</div>
							<span className="mt-0.5 block text-[10px] text-text-sub-600 dark:text-white/50">
								{kpi.sub}
							</span>
						</div>
					))}
				</div>

				{/* Link Click Engagement Table with Visual Progress Bars */}
				<div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 dark:border-white/10 dark:bg-[#111114]">
					<div className="flex items-center justify-between border-stroke-soft-100 border-b px-4 py-2 font-medium text-[10.5px] text-text-soft-400 dark:border-white/5 dark:text-white/40">
						<span>TOP CLICKED LINKS</span>
						<span>CLICKS &amp; SHARE</span>
					</div>

					<div className="divide-y divide-stroke-soft-100 text-xs dark:divide-white/5">
						{[
							{
								title: "Explore React Email Templates",
								clicks: "4,180",
								pct: "54.5%",
								width: "w-[54.5%]",
							},
							{
								title: "View Pricing & Dedicated IPs",
								clicks: "2,240",
								pct: "29.2%",
								width: "w-[29.2%]",
							},
							{
								title: "Read Developer Documentation",
								clicks: "1,245",
								pct: "16.3%",
								width: "w-[16.3%]",
							},
						].map((link) => (
							<div
								key={link.title}
								className="flex items-center justify-between px-4 py-2.5 text-[11px]"
							>
								<div className="flex items-center gap-2.5">
									<span className="size-1.5 rounded-full bg-text-strong-950 dark:bg-white" />
									<span className="font-medium text-text-strong-950 dark:text-white">
										{link.title}
									</span>
								</div>

								<div className="flex items-center gap-3">
									<div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-bg-weak-50 sm:block dark:bg-white/10">
										<div
											className={cn(
												"h-full rounded-full bg-text-strong-950 dark:bg-white",
												link.width,
											)}
										/>
									</div>
									<span className="font-semibold text-text-strong-950 dark:text-white">
										{link.clicks}
									</span>
									<span className="w-9 text-right font-mono text-[10px] text-text-soft-400 dark:text-white/40">
										{link.pct}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Delivery Health & Summary Footer */}
				<div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
					<div className="flex items-center gap-3 text-text-sub-600 dark:text-white/60">
						<span className="flex items-center gap-1">
							<span className="size-1.5 rounded-full bg-emerald-500" />
							<span>Spam: 0.01% (Safe)</span>
						</span>
						<span>·</span>
						<span>Unsubscribes: 0.12%</span>
					</div>

					<FancyButton.Root
						variant="neutral"
						size="xsmall"
						className="rounded-lg! px-3.5!"
					>
						<span>View Full Analytics Report →</span>
					</FancyButton.Root>
				</div>
			</div>
		</div>
	);
}

/* --- Main PreviewStage Component --- */
export function PreviewStage({
	activeTab: externalActive,
	onTabChange: externalOnChange,
}: {
	activeTab?: MarketingTabId;
	onTabChange?: (id: MarketingTabId) => void;
} = {}) {
	const shouldReduceMotion = useReducedMotion();
	const [internalActive, setInternalActive] =
		useState<MarketingTabId>("upload-data");
	const active = externalActive ?? internalActive;
	const [direction, setDirection] = useState(0);

	const handleTabChange = (newTab: MarketingTabId) => {
		if (newTab === active) return;
		const from = TAB_ORDER.indexOf(active);
		const to = TAB_ORDER.indexOf(newTab);
		if (from !== -1 && to !== -1) {
			setDirection(to > from ? 1 : -1);
		} else {
			setDirection(0);
		}
		if (externalOnChange) {
			externalOnChange(newTab);
		} else {
			setInternalActive(newTab);
		}
	};

	return (
		<div className="bg-bg-white-0 dark:bg-black">
			<div className="relative overflow-hidden">
				<div className="relative mx-auto h-[29rem] max-w-5xl px-5 pt-6 sm:h-[32rem] sm:px-8 sm:pt-7 lg:h-[34rem] lg:px-10 lg:pt-8">
					<AnimatePresence initial={false} custom={direction} mode="popLayout">
						<motion.div
							key={active}
							custom={direction}
							variants={contentVariants}
							initial={shouldReduceMotion ? false : "enter"}
							animate="center"
							exit={shouldReduceMotion ? undefined : "exit"}
							transition={
								shouldReduceMotion
									? { duration: 0 }
									: { duration: SLIDE_MS, ease: EASE_DEFAULT }
							}
							className="relative w-full"
						>
							{active === "upload-data" ? (
								<UploadDataView />
							) : active === "manage-funnels" ? (
								<ManageFunnelsView />
							) : (
								<AnalyticsView />
							)}
						</motion.div>
					</AnimatePresence>
				</div>
				<div
					aria-hidden
					className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-44 bg-gradient-to-t from-15% from-[#fbfbfb] via-[#fbfbfb]/80 to-transparent dark:from-[#0a0a0a] dark:via-[#0a0a0a]/80"
				/>
			</div>

			<PreviewTabs active={active} onChange={handleTabChange} />
		</div>
	);
}
