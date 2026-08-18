"use client";

import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { AnalyticsTabId } from "./preview-scenes";
import { PreviewTabs } from "./preview-tabs";

const TAB_ORDER: AnalyticsTabId[] = ["deliverability", "engagement", "bounces"];

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

/* --- Scene 1: Deliverability Preview --- */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DELIVERED_SERIES = [6200, 7100, 6800, 8400, 9200, 8900, 9812];

function DeliverabilityView() {
	const max = 10500;
	const w = 620;
	const h = 130;
	const pad = { t: 10, r: 16, b: 24, l: 8 };
	const innerW = w - pad.l - pad.r;
	const innerH = h - pad.t - pad.b;

	const points = DELIVERED_SERIES.map((val, idx) => {
		const x = pad.l + (idx / (DAYS.length - 1)) * innerW;
		const y = pad.t + (1 - val / max) * innerH;
		return { x, y };
	});

	const pathD = points.reduce((acc, pt, i) => {
		if (i === 0) return `M ${pt.x} ${pt.y}`;
		const prev = points[i - 1];
		const cp1x = prev.x + (pt.x - prev.x) / 2;
		const cp2x = cp1x;
		return `${acc} C ${cp1x} ${prev.y}, ${cp2x} ${pt.y}, ${pt.x} ${pt.y}`;
	}, "");

	const areaD = `${pathD} L ${points[points.length - 1].x} ${h - pad.b} L ${points[0].x} ${h - pad.b} Z`;

	return (
		<div className="w-full space-y-4">
			{/* Top Metric Cards */}
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3.5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
					<div className="flex items-center justify-between">
						<span className="text-text-sub-600 text-xs dark:text-white/60">
							Total Sent
						</span>
						<span className="h-2 w-2 rounded-full bg-blue-500" />
					</div>
					<p className="mt-1.5 font-semibold text-lg text-text-strong-950 tracking-tight dark:text-white">
						56,960
					</p>
					<span className="text-[11px] text-emerald-600 dark:text-emerald-400">
						↑ 12.4% vs last week
					</span>
				</div>

				<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3.5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
					<div className="flex items-center justify-between">
						<span className="text-text-sub-600 text-xs dark:text-white/60">
							Delivered Rate
						</span>
						<span className="h-2 w-2 rounded-full bg-emerald-500" />
					</div>
					<p className="mt-1.5 font-semibold text-lg text-text-strong-950 tracking-tight dark:text-white">
						99.38%
					</p>
					<span className="text-[11px] text-text-soft-400 dark:text-white/50">
						56,608 verified
					</span>
				</div>

				<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3.5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
					<div className="flex items-center justify-between">
						<span className="text-text-sub-600 text-xs dark:text-white/60">
							Avg Latency
						</span>
						<span className="h-2 w-2 rounded-full bg-violet-500" />
					</div>
					<p className="mt-1.5 font-semibold text-lg text-text-strong-950 tracking-tight dark:text-white">
						340ms
					</p>
					<span className="text-[11px] text-emerald-600 dark:text-emerald-400">
						⚡ Direct MX handshake
					</span>
				</div>

				<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3.5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
					<div className="flex items-center justify-between">
						<span className="text-text-sub-600 text-xs dark:text-white/60">
							Reputation
						</span>
						<span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 font-medium text-[10px] text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
							High
						</span>
					</div>
					<p className="mt-1.5 font-semibold text-lg text-text-strong-950 tracking-tight dark:text-white">
						99 / 100
					</p>
					<span className="text-[11px] text-text-soft-400 dark:text-white/50">
						Zero blocklists
					</span>
				</div>
			</div>

			{/* Deliverability Area Chart */}
			<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
				<div className="flex items-center justify-between border-stroke-soft-100 border-b pb-3 dark:border-white/5">
					<div className="flex items-center gap-2">
						<span className="font-medium text-text-strong-950 text-xs dark:text-white">
							7-Day Delivery Volume
						</span>
						<span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
							Live stream
						</span>
					</div>
					<div className="flex items-center gap-4 text-[11px] text-text-sub-600 dark:text-white/60">
						<span className="inline-flex items-center gap-1.5">
							<span className="h-2 w-2 rounded-full bg-blue-500" /> Delivered
						</span>
						<span className="inline-flex items-center gap-1.5">
							<span className="h-2 w-2 rounded-full bg-stroke-soft-200 dark:bg-white/20" />{" "}
							Sent
						</span>
					</div>
				</div>

				<div className="relative mt-3 h-[130px] w-full">
					<svg
						viewBox={`0 0 ${w} ${h}`}
						className="h-full w-full overflow-visible"
						preserveAspectRatio="none"
					>
						<defs>
							<linearGradient
								id="deliverability-grad"
								x1="0"
								y1="0"
								x2="0"
								y2="1"
							>
								<stop offset="0%" stopColor="#3b82f6" stopOpacity="0.22" />
								<stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
							</linearGradient>
						</defs>

						{/* Horizontal grid lines */}
						<line
							x1={pad.l}
							y1={pad.t}
							x2={w - pad.r}
							y2={pad.t}
							stroke="currentColor"
							className="text-black/5 dark:text-white/5"
							strokeDasharray="3 3"
						/>
						<line
							x1={pad.l}
							y1={pad.t + innerH / 2}
							x2={w - pad.r}
							y2={pad.t + innerH / 2}
							stroke="currentColor"
							className="text-black/5 dark:text-white/5"
							strokeDasharray="3 3"
						/>
						<line
							x1={pad.l}
							y1={h - pad.b}
							x2={w - pad.r}
							y2={h - pad.b}
							stroke="currentColor"
							className="text-black/10 dark:text-white/10"
						/>

						{/* Area & Line */}
						<path d={areaD} fill="url(#deliverability-grad)" />
						<path
							d={pathD}
							fill="none"
							stroke="#3b82f6"
							strokeWidth="2.2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>

						{/* Points */}
						{points.map((pt, i) => (
							<circle
								key={DAYS[i]}
								cx={pt.x}
								cy={pt.y}
								r={i === points.length - 1 ? 4 : 2.5}
								className={
									i === points.length - 1
										? "fill-[#3b82f6] stroke-2 stroke-white dark:stroke-black"
										: "fill-[#3b82f6]"
								}
							/>
						))}

						{/* X Axis Labels */}
						{DAYS.map((day, i) => {
							const x = pad.l + (i / (DAYS.length - 1)) * innerW;
							return (
								<text
									key={day}
									x={x}
									y={h - 6}
									textAnchor="middle"
									className="fill-text-soft-400 text-[10px] dark:fill-white/40"
								>
									{day}
								</text>
							);
						})}
					</svg>
				</div>
			</div>

			{/* ISP Breakdown Chips */}
			<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
				{[
					{ isp: "Gmail / G-Suite", rate: "99.8%", color: "text-emerald-500" },
					{ isp: "Microsoft 365", rate: "99.2%", color: "text-emerald-500" },
					{ isp: "Apple iCloud", rate: "99.6%", color: "text-emerald-500" },
					{ isp: "Yahoo / AOL", rate: "98.9%", color: "text-blue-500" },
				].map((item) => (
					<div
						key={item.isp}
						className="flex items-center justify-between rounded-lg border border-stroke-soft-200/80 bg-bg-white-0 px-3 py-2 text-xs shadow-xs dark:border-white/5 dark:bg-white/[0.02]"
					>
						<span className="text-text-sub-600 dark:text-white/60">
							{item.isp}
						</span>
						<span className={cn("font-semibold", item.color)}>{item.rate}</span>
					</div>
				))}
			</div>
		</div>
	);
}

/* --- Scene 2: Engagement & Clicks Preview --- */
function EngagementView() {
	return (
		<div className="w-full space-y-4">
			{/* Metric Top Row */}
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3.5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
					<span className="text-text-sub-600 text-xs dark:text-white/60">
						Open Rate
					</span>
					<p className="mt-1 font-semibold text-text-strong-950 text-xl tracking-tight dark:text-white">
						48.2%
					</p>
					<span className="text-[11px] text-emerald-600 dark:text-emerald-400">
						+9.7% vs industry avg
					</span>
				</div>

				<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3.5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
					<span className="text-text-sub-600 text-xs dark:text-white/60">
						Click-Through (CTR)
					</span>
					<p className="mt-1 font-semibold text-text-strong-950 text-xl tracking-tight dark:text-white">
						14.6%
					</p>
					<span className="text-[11px] text-text-soft-400 dark:text-white/50">
						8,321 unique clicks
					</span>
				</div>

				<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3.5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
					<span className="text-text-sub-600 text-xs dark:text-white/60">
						Click-to-Open (CTOR)
					</span>
					<p className="mt-1 font-semibold text-text-strong-950 text-xl tracking-tight dark:text-white">
						30.3%
					</p>
					<span className="text-[11px] text-emerald-600 dark:text-emerald-400">
						High engagement
					</span>
				</div>

				<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3.5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
					<span className="text-text-sub-600 text-xs dark:text-white/60">
						Unsubscribe Rate
					</span>
					<p className="mt-1 font-semibold text-text-strong-950 text-xl tracking-tight dark:text-white">
						0.12%
					</p>
					<span className="text-[11px] text-emerald-600 dark:text-emerald-400">
						Ultra-low friction
					</span>
				</div>
			</div>

			{/* Link Heatmap & Client Breakdown Grid */}
			<div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.5fr_1fr]">
				{/* Top Clicked Links */}
				<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
					<div className="flex items-center justify-between border-stroke-soft-100 border-b pb-2.5 dark:border-white/5">
						<span className="font-medium text-text-strong-950 text-xs dark:text-white">
							Top Clicked Links
						</span>
						<span className="text-[11px] text-text-soft-400 dark:text-white/40">
							Unique Clicks
						</span>
					</div>

					<div className="mt-3 space-y-3">
						{[
							{
								url: "https://reloop.sh/dashboard/verify",
								clicks: "4,120",
								pct: 49.5,
							},
							{
								url: "https://reloop.sh/docs/quickstart",
								clicks: "2,680",
								pct: 32.2,
							},
							{
								url: "https://reloop.sh/pricing",
								clicks: "1,521",
								pct: 18.3,
							},
						].map((link) => (
							<div key={link.url} className="space-y-1">
								<div className="flex items-center justify-between text-xs">
									<span className="truncate font-mono text-text-sub-600 dark:text-white/70">
										{link.url}
									</span>
									<span className="font-medium text-text-strong-950 dark:text-white">
										{link.clicks}
									</span>
								</div>
								<div className="h-1.5 w-full overflow-hidden rounded-full bg-stroke-soft-100 dark:bg-white/10">
									<div
										className="h-full rounded-full bg-blue-500"
										style={{ width: `${link.pct}%` }}
									/>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Email Clients Share */}
				<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
					<div className="border-stroke-soft-100 border-b pb-2.5 dark:border-white/5">
						<span className="font-medium text-text-strong-950 text-xs dark:text-white">
							Device & Client Share
						</span>
					</div>

					<div className="mt-3 space-y-2.5">
						{[
							{ client: "Apple Mail (iOS / macOS)", share: "54%" },
							{ client: "Gmail (Mobile & Web)", share: "33%" },
							{ client: "Outlook / Exchange", share: "13%" },
						].map((item) => (
							<div
								key={item.client}
								className="flex items-center justify-between rounded-lg border border-stroke-soft-100 bg-bg-weak-50/50 px-3 py-2 text-xs dark:border-white/5 dark:bg-white/[0.02]"
							>
								<span className="text-text-sub-600 dark:text-white/60">
									{item.client}
								</span>
								<span className="font-semibold text-text-strong-950 dark:text-white">
									{item.share}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

/* --- Scene 3: Bounce & Diagnostics Preview --- */
function BouncesView() {
	const logs = [
		{
			code: "250 OK",
			type: "delivered",
			email: "alex@acme.corp",
			detail: "Delivered to mx1.google.com (128ms)",
			time: "2s ago",
		},
		{
			code: "550 5.1.1",
			type: "hard_bounce",
			email: "no-user@invalid-domain.xyz",
			detail: "User unknown; mailbox does not exist",
			time: "14s ago",
		},
		{
			code: "452 4.2.2",
			type: "soft_bounce",
			email: "storage@enterprise.io",
			detail: "Mailbox full; auto-retry queued in 15m",
			time: "48s ago",
		},
		{
			code: "250 2.1.5",
			type: "delivered",
			email: "dev-team@northwind.dev",
			detail: "DKIM passed, SPF aligned, TLS 1.3",
			time: "1m ago",
		},
	];

	return (
		<div className="w-full space-y-4">
			{/* Health Stats */}
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3.5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
					<span className="text-text-sub-600 text-xs dark:text-white/60">
						Hard Bounces
					</span>
					<p className="mt-1 font-semibold text-emerald-600 text-xl tracking-tight dark:text-emerald-400">
						0.42%
					</p>
					<span className="text-[11px] text-text-soft-400 dark:text-white/50">
						Auto-suppressed
					</span>
				</div>

				<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3.5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
					<span className="text-text-sub-600 text-xs dark:text-white/60">
						Soft Bounces
					</span>
					<p className="mt-1 font-semibold text-amber-500 text-xl tracking-tight dark:text-amber-400">
						0.19%
					</p>
					<span className="text-[11px] text-text-soft-400 dark:text-white/50">
						Exponential backoff
					</span>
				</div>

				<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3.5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
					<span className="text-text-sub-600 text-xs dark:text-white/60">
						Spam Complaints
					</span>
					<p className="mt-1 font-semibold text-emerald-600 text-xl tracking-tight dark:text-emerald-400">
						0.01%
					</p>
					<span className="text-[11px] text-emerald-600 dark:text-emerald-400">
						Compliant (&lt; 0.1%)
					</span>
				</div>

				<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3.5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
					<span className="text-text-sub-600 text-xs dark:text-white/60">
						Auth Alignment
					</span>
					<p className="mt-1 font-semibold text-text-strong-950 text-xl tracking-tight dark:text-white">
						100%
					</p>
					<span className="text-[11px] text-emerald-600 dark:text-emerald-400">
						SPF + DKIM + DMARC
					</span>
				</div>
			</div>

			{/* Real-time SMTP Diagnostic Feed */}
			<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
				<div className="flex items-center justify-between border-stroke-soft-100 border-b pb-2.5 dark:border-white/5">
					<div className="flex items-center gap-2">
						<span className="font-medium text-text-strong-950 text-xs dark:text-white">
							Live SMTP Event Stream
						</span>
						<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
							<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
							Streaming
						</span>
					</div>
					<span className="text-[11px] text-text-soft-400 dark:text-white/40">
						Auto-refreshing
					</span>
				</div>

				<div className="mt-3 divide-y divide-stroke-soft-100 dark:divide-white/5">
					{logs.map((log) => (
						<div
							key={log.email}
							className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
						>
							<div className="flex items-center gap-2.5 truncate">
								<span
									className={cn(
										"font-mono font-semibold text-[11px]",
										log.type === "delivered"
											? "text-emerald-600 dark:text-emerald-400"
											: log.type === "hard_bounce"
												? "text-rose-600 dark:text-rose-400"
												: "text-amber-600 dark:text-amber-400",
									)}
								>
									{log.code}
								</span>
								<span className="truncate font-medium text-text-strong-950 text-xs dark:text-white">
									{log.email}
								</span>
								<span className="hidden truncate text-[11px] text-text-soft-400 sm:inline dark:text-white/40">
									— {log.detail}
								</span>
							</div>
							<span className="shrink-0 text-[11px] text-text-soft-400 dark:text-white/40">
								{log.time}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

/* --- Main PreviewStage Component --- */
export function PreviewStage() {
	const shouldReduceMotion = useReducedMotion();
	const [active, setActive] = useState<AnalyticsTabId>("deliverability");
	const [direction, setDirection] = useState(0);

	const handleTabChange = (newTab: AnalyticsTabId) => {
		if (newTab === active) return;
		const from = TAB_ORDER.indexOf(active);
		const to = TAB_ORDER.indexOf(newTab);
		if (from !== -1 && to !== -1) {
			setDirection(to > from ? 1 : -1);
		} else {
			setDirection(0);
		}
		setActive(newTab);
	};

	return (
		<div className="bg-bg-weak-50/60 dark:bg-white/[0.015]">
			<div className="relative overflow-hidden">
				<div className="relative mx-auto min-h-[25rem] max-w-5xl px-5 pt-8 pb-10 sm:px-8 sm:pt-10 lg:px-10">
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
							{active === "deliverability" ? (
								<DeliverabilityView />
							) : active === "engagement" ? (
								<EngagementView />
							) : (
								<BouncesView />
							)}
						</motion.div>
					</AnimatePresence>
				</div>
			</div>
			<PreviewTabs active={active} onChange={handleTabChange} />
		</div>
	);
}
