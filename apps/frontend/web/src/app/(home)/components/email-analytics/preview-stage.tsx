"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { EmailItem } from "../emails/_shared/data";
import { type DetailTabId, EmailDetail } from "../emails/detail/email-detail";
import type { AnalyticsTabId } from "./preview-scenes";
import { PreviewTabs } from "./preview-tabs";

const TAB_ORDER: AnalyticsTabId[] = ["metrics", "engagement", "bounces"];

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

/* --- Scene 1: Multi-Line Deliverability & Engagement Chart (Dub-Inspired Clean View) --- */
const DATES = [
	"5 aug",
	"7 aug",
	"9 aug",
	"11 aug",
	"13 aug",
	"15 aug",
	"17 aug",
	"18 aug",
];

// Continuous upward trajectories: Starts strictly from bottom-left corner (y = 1.0) and ends at top-right corner (y = 0.0)
const DELIVERED_PERCENTAGES = [1.0, 0.92, 0.82, 0.68, 0.5, 0.3, 0.12, 0.0];
const OPENED_PERCENTAGES = [1.0, 0.95, 0.88, 0.76, 0.6, 0.42, 0.24, 0.12];
const CLICKED_PERCENTAGES = [1.0, 0.98, 0.93, 0.84, 0.7, 0.54, 0.36, 0.24];
const BOUNCED_PERCENTAGES = [1.0, 0.99, 0.96, 0.96, 0.96, 0.96, 0.96, 0.96];

const DELIVERED_VALUES = [420, 890, 1420, 2100, 3450, 5100, 6800, 7950];
const OPENED_VALUES = [210, 480, 780, 1150, 1890, 2950, 4200, 5100];
const CLICKED_VALUES = [70, 160, 270, 420, 710, 1180, 1750, 2200];
const BOUNCED_VALUES = [2, 3, 4, 5, 6, 7, 8, 9];

function getCatmullRomPath(points: { x: number; y: number }[], height: number) {
	if (points.length < 2) return { path: "", area: "" };
	const first = points[0];
	const last = points[points.length - 1];
	if (!first || !last) return { path: "", area: "" };

	let path = `M ${first.x} ${first.y}`;

	for (let i = 0; i < points.length - 1; i++) {
		const p0 = points[i === 0 ? 0 : i - 1] ?? first;
		const p1 = points[i] ?? first;
		const p2 = points[i + 1] ?? last;
		const p3 =
			points[i + 2 >= points.length ? points.length - 1 : i + 2] ?? last;

		const cp1x = p1.x + (p2.x - p0.x) / 6;
		const cp1y = p1.y + (p2.y - p0.y) / 6;
		const cp2x = p2.x - (p3.x - p1.x) / 6;
		const cp2y = p2.y - (p3.y - p1.y) / 6;

		path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
	}

	const area = `${path} L ${last.x} ${height} L ${first.x} ${height} Z`;

	return { path, area };
}

function MetricsLayeredView() {
	const [hoveredIdx, setHoveredIdx] = useState<number>(4); // Default mid point

	const w = 1000;
	const h = 400;

	const deliveredPts = DELIVERED_PERCENTAGES.map((pct, idx) => ({
		x: (idx / (DELIVERED_PERCENTAGES.length - 1)) * w,
		y: pct * h,
	}));

	const openedPts = OPENED_PERCENTAGES.map((pct, idx) => ({
		x: (idx / (OPENED_PERCENTAGES.length - 1)) * w,
		y: pct * h,
	}));

	const clickedPts = CLICKED_PERCENTAGES.map((pct, idx) => ({
		x: (idx / (CLICKED_PERCENTAGES.length - 1)) * w,
		y: pct * h,
	}));

	const bouncedPts = BOUNCED_PERCENTAGES.map((pct, idx) => ({
		x: (idx / (BOUNCED_PERCENTAGES.length - 1)) * w,
		y: pct * h,
	}));

	const deliveredCurve = getCatmullRomPath(deliveredPts, h);
	const openedCurve = getCatmullRomPath(openedPts, h);
	const clickedCurve = getCatmullRomPath(clickedPts, h);
	const bouncedCurve = getCatmullRomPath(bouncedPts, h);

	const fallbackPt = { x: 0, y: 0 };
	const activeDeliveredPt =
		deliveredPts[hoveredIdx] ?? deliveredPts[4] ?? fallbackPt;
	const activeOpenedPt = openedPts[hoveredIdx] ?? openedPts[4] ?? fallbackPt;
	const activeClickedPt = clickedPts[hoveredIdx] ?? clickedPts[4] ?? fallbackPt;
	const activeBouncedPt = bouncedPts[hoveredIdx] ?? bouncedPts[4] ?? fallbackPt;

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const ratio = Math.max(0, Math.min(1, mouseX / rect.width));
		const closestIdx = Math.round(ratio * (DELIVERED_PERCENTAGES.length - 1));
		if (closestIdx >= 0 && closestIdx < DELIVERED_PERCENTAGES.length) {
			setHoveredIdx(closestIdx);
		}
	};

	const curDelivered = DELIVERED_VALUES[hoveredIdx] ?? 3450;
	const curOpened = OPENED_VALUES[hoveredIdx] ?? 1890;
	const curClicked = CLICKED_VALUES[hoveredIdx] ?? 710;
	const curBounced = BOUNCED_VALUES[hoveredIdx] ?? 38;
	const curDate = DATES[hoveredIdx] ?? "13 aug";

	return (
		<div className="relative h-full w-full">
			{/* SVG Line / Area Graph (Full-Bleed, Borderless, Numberless) */}
			<div
				className="relative h-full min-h-[300px] w-full cursor-crosshair sm:min-h-[340px] lg:min-h-[380px]"
				onMouseMove={handleMouseMove}
			>
				<svg
					viewBox={`0 0 ${w} ${h}`}
					className="h-full w-full overflow-visible"
					preserveAspectRatio="none"
				>
					<defs>
						{/* Area Fills */}
						<linearGradient id="grad-delivered" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#3B82F6" stopOpacity="0.16" />
							<stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
						</linearGradient>
						<linearGradient id="grad-opened" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#A855F7" stopOpacity="0.13" />
							<stop offset="100%" stopColor="#A855F7" stopOpacity="0.0" />
						</linearGradient>
						<linearGradient id="grad-clicked" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#10B981" stopOpacity="0.10" />
							<stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
						</linearGradient>
						<linearGradient id="grad-bounced" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#EF4444" stopOpacity="0.10" />
							<stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
						</linearGradient>
					</defs>

					{/* Subtle Background Horizontal Grid Lines */}
					{[0.2, 0.4, 0.6, 0.8].map((ratio) => (
						<line
							key={ratio}
							x1={0}
							y1={ratio * h}
							x2={w}
							y2={ratio * h}
							stroke="currentColor"
							className="text-black/[0.04] dark:text-white/[0.04]"
							strokeDasharray="4 4"
						/>
					))}

					{/* Vertical Guideline on Hover */}
					<line
						x1={activeDeliveredPt.x}
						y1={0}
						x2={activeDeliveredPt.x}
						y2={h}
						stroke="currentColor"
						className="text-black/15 dark:text-white/20"
						strokeWidth="1.2"
					/>

					{/* 1. Delivered Area & Curve (Blue) */}
					<path d={deliveredCurve.area} fill="url(#grad-delivered)" />
					<path
						d={deliveredCurve.path}
						fill="none"
						stroke="#3B82F6"
						strokeWidth="2.4"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>

					{/* 2. Opened Area & Curve (Purple) */}
					<path d={openedCurve.area} fill="url(#grad-opened)" />
					<path
						d={openedCurve.path}
						fill="none"
						stroke="#A855F7"
						strokeWidth="2.4"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>

					{/* 3. Clicked Area & Curve (Emerald) */}
					<path d={clickedCurve.area} fill="url(#grad-clicked)" />
					<path
						d={clickedCurve.path}
						fill="none"
						stroke="#10B981"
						strokeWidth="2.4"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>

					{/* 4. Bounced Area & Curve (Red) */}
					<path d={bouncedCurve.area} fill="url(#grad-bounced)" />
					<path
						d={bouncedCurve.path}
						fill="none"
						stroke="#EF4444"
						strokeWidth="2.4"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>

					{/* Active Glowing Dots on Curves */}
					<circle
						cx={activeDeliveredPt.x}
						cy={activeDeliveredPt.y}
						r={5}
						className="fill-white stroke-[#3B82F6] stroke-[2.5] dark:fill-black"
					/>
					<circle
						cx={activeOpenedPt.x}
						cy={activeOpenedPt.y}
						r={5}
						className="fill-white stroke-[#A855F7] stroke-[2.5] dark:fill-black"
					/>
					<circle
						cx={activeClickedPt.x}
						cy={activeClickedPt.y}
						r={5}
						className="fill-white stroke-[#10B981] stroke-[2.5] dark:fill-black"
					/>
					<circle
						cx={activeBouncedPt.x}
						cy={activeBouncedPt.y}
						r={5}
						className="fill-white stroke-[#EF4444] stroke-[2.5] dark:fill-black"
					/>
				</svg>

				{/* Dub-Style Floating Tooltip Card */}
				<div
					className="pointer-events-none absolute z-20 flex w-[210px] flex-col gap-2 transition-all duration-150"
					style={{
						left: `${(activeDeliveredPt.x / w) * 100}%`,
						top: `${Math.max(8, Math.min(55, (activeDeliveredPt.y / h) * 100 - 25))}%`,
						transform:
							activeDeliveredPt.x > w * 0.62
								? "translate(-108%, -15%)"
								: "translate(18px, -15%)",
					}}
				>
					{/* Main Stats Card */}
					<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0/95 p-3 shadow-[0_12px_32px_rgba(0,0,0,0.08)] backdrop-blur-md dark:border-white/10 dark:bg-[#121214]/95 dark:shadow-[0_16px_36px_rgba(0,0,0,0.4)]">
						<div className="flex items-center justify-between border-stroke-soft-100 border-b pb-1.5 dark:border-white/10">
							<div className="flex items-center gap-1.5">
								<span className="size-1.5 rounded-full bg-blue-500" />
								<span className="font-medium text-[11px] text-text-sub-600 dark:text-white/70">
									reloop.sh/mail
								</span>
							</div>
							<span className="text-[10px] text-text-soft-400 uppercase tracking-wider dark:text-white/40">
								{curDate}
							</span>
						</div>

						<div className="mt-2 space-y-1.5 text-xs">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<span className="size-2 rounded-full bg-[#3B82F6]" />
									<span className="text-text-sub-600 dark:text-white/70">
										Delivered
									</span>
								</div>
								<span className="font-semibold text-text-strong-950 tabular-nums dark:text-white">
									{curDelivered.toLocaleString()}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<span className="size-2 rounded-full bg-[#A855F7]" />
									<span className="text-text-sub-600 dark:text-white/70">
										Opened
									</span>
								</div>
								<span className="font-semibold text-text-strong-950 tabular-nums dark:text-white">
									{curOpened.toLocaleString()}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<span className="size-2 rounded-full bg-[#10B981]" />
									<span className="text-text-sub-600 dark:text-white/70">
										Clicked
									</span>
								</div>
								<span className="font-semibold text-text-strong-950 tabular-nums dark:text-white">
									{curClicked.toLocaleString()}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<span className="size-2 rounded-full bg-[#EF4444]" />
									<span className="text-text-sub-600 dark:text-white/70">
										Bounced
									</span>
								</div>
								<span className="font-semibold text-text-strong-950 tabular-nums dark:text-white">
									{curBounced.toLocaleString()}
								</span>
							</div>
						</div>
					</div>

					{/* Secondary Mini Chip: Top Providers */}
					<div className="flex items-center justify-between rounded-lg border border-stroke-soft-200 bg-bg-white-0/90 px-2.5 py-1 text-[10.5px] shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-[#141416]/90">
						<span className="text-text-soft-400 dark:text-white/40">
							Inbox Health
						</span>
						<span className="font-medium text-emerald-600 dark:text-emerald-400">
							99.4% inboxed
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

/* --- Scene 2: Reloop Engagement Funnel (Sankey Flow) --- */
type FunnelStage = "delivered" | "opened" | "clicked";

function EngagementView() {
	const [activeStage, setActiveStage] = useState<FunnelStage>("opened");

	return (
		<div className="relative mx-auto w-full max-w-5xl space-y-2.5">
			{/* 3 Clickable Funnel Stage Metric Cards */}
			<div className="grid grid-cols-3 divide-x divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 dark:divide-white/5 dark:border-white/10 dark:bg-[#0c0c0e]">
				{/* Stage 1: Delivered */}
				<button
					type="button"
					onClick={() => setActiveStage("delivered")}
					className={cn(
						"group relative flex cursor-pointer flex-col p-2.5 text-left transition-all sm:p-3",
						activeStage === "delivered"
							? "bg-indigo-50/40 dark:bg-indigo-950/20"
							: "hover:bg-bg-weak-50/50 dark:hover:bg-white/[0.02]",
					)}
				>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-1.5">
							<span className="size-1.5 rounded-full bg-[#4F46E5]" />
							<span className="font-medium text-[11px] text-text-sub-600 dark:text-white/60">
								Delivered
							</span>
						</div>
						<span className="text-text-soft-400 text-xs transition-transform group-hover:translate-x-0.5 dark:text-white/30">
							›
						</span>
					</div>
					<p className="mt-1 font-bold text-text-strong-950 text-xl tracking-tight sm:text-2xl dark:text-white">
						29.4K
					</p>
					<div className="mt-0.5 flex items-center gap-1 text-[#4F46E5] text-[10px] dark:text-indigo-400">
						<span>100% sent</span>
						<span className="text-text-soft-400 dark:text-white/30">·</span>
						<span className="text-text-sub-600 dark:text-white/50">
							128ms avg
						</span>
					</div>
					{activeStage === "delivered" && (
						<motion.div
							layoutId="funnel-tab"
							className="absolute inset-x-0 bottom-0 h-0.5 bg-[#4F46E5]"
						/>
					)}
				</button>

				{/* Stage 2: Opened */}
				<button
					type="button"
					onClick={() => setActiveStage("opened")}
					className={cn(
						"group relative flex cursor-pointer flex-col p-2.5 text-left transition-all sm:p-3",
						activeStage === "opened"
							? "bg-cyan-50/40 dark:bg-cyan-950/20"
							: "hover:bg-bg-weak-50/50 dark:hover:bg-white/[0.02]",
					)}
				>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-1.5">
							<span className="size-1.5 rounded-full bg-[#0284C7]" />
							<span className="font-medium text-[11px] text-text-sub-600 dark:text-white/60">
								Opened
							</span>
						</div>
						<span className="text-text-soft-400 text-xs transition-transform group-hover:translate-x-0.5 dark:text-white/30">
							›
						</span>
					</div>
					<p className="mt-1 font-bold text-text-strong-950 text-xl tracking-tight sm:text-2xl dark:text-white">
						14.1K
					</p>
					<div className="mt-0.5 flex items-center gap-1 text-[#0284C7] text-[10px] dark:text-cyan-400">
						<span>48.2% open rate</span>
						<span className="text-text-soft-400 dark:text-white/30">·</span>
						<span className="text-emerald-600 dark:text-emerald-400">
							+9.7% avg
						</span>
					</div>
					{activeStage === "opened" && (
						<motion.div
							layoutId="funnel-tab"
							className="absolute inset-x-0 bottom-0 h-0.5 bg-[#0284C7]"
						/>
					)}
				</button>

				{/* Stage 3: Clicked */}
				<button
					type="button"
					onClick={() => setActiveStage("clicked")}
					className={cn(
						"group relative flex cursor-pointer flex-col p-2.5 text-left transition-all sm:p-3",
						activeStage === "clicked"
							? "bg-emerald-50/40 dark:bg-emerald-950/20"
							: "hover:bg-bg-weak-50/50 dark:hover:bg-white/[0.02]",
					)}
				>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-1.5">
							<span className="size-1.5 rounded-full bg-[#059669]" />
							<span className="font-medium text-[11px] text-text-sub-600 dark:text-white/60">
								Clicked
							</span>
						</div>
						<div className="flex items-center gap-1 text-[10px] text-text-soft-400 dark:text-white/40">
							<span>CTOR 30%</span>
						</div>
					</div>
					<p className="mt-1 font-bold text-text-strong-950 text-xl tracking-tight sm:text-2xl dark:text-white">
						4,286
					</p>
					<div className="mt-0.5 flex items-center gap-1 text-[#059669] text-[10px] dark:text-emerald-400">
						<span>14.6% CTR</span>
						<span className="text-text-soft-400 dark:text-white/30">·</span>
						<span className="text-text-sub-600 dark:text-white/50">
							8.3K total
						</span>
					</div>
					{activeStage === "clicked" && (
						<motion.div
							layoutId="funnel-tab"
							className="absolute inset-x-0 bottom-0 h-0.5 bg-[#059669]"
						/>
					)}
				</button>
			</div>

			{/* Fluid Organic Sankey Stream Graphic */}
			<div className="relative overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-2 sm:p-3 dark:border-white/10 dark:bg-[#0c0c0e]">
				<div className="relative h-[130px] w-full">
					<svg
						viewBox="0 0 760 180"
						className="h-full w-full overflow-visible"
						preserveAspectRatio="none"
					>
						<defs>
							{/* Gradients for smooth fluid transitions: Indigo -> Cyan -> Emerald */}
							<linearGradient
								id="funnel-indigo-cyan"
								x1="0%"
								y1="0%"
								x2="100%"
								y2="0%"
							>
								<stop offset="0%" stopColor="#4338CA" />
								<stop offset="60%" stopColor="#4F46E5" />
								<stop offset="100%" stopColor="#0284C7" />
							</linearGradient>

							<linearGradient
								id="funnel-cyan-emerald"
								x1="0%"
								y1="0%"
								x2="100%"
								y2="0%"
							>
								<stop offset="0%" stopColor="#0284C7" />
								<stop offset="60%" stopColor="#0EA5E9" />
								<stop offset="100%" stopColor="#059669" />
							</linearGradient>

							<linearGradient
								id="funnel-emerald-end"
								x1="0%"
								y1="0%"
								x2="100%"
								y2="0%"
							>
								<stop offset="0%" stopColor="#059669" />
								<stop offset="60%" stopColor="#10B981" />
								<stop offset="100%" stopColor="#34D399" />
							</linearGradient>
						</defs>

						{/* --- 1. Delivered Stream (Indigo Stream) --- */}
						<g
							className="cursor-pointer transition-opacity duration-200"
							onClick={() => setActiveStage("delivered")}
							opacity={
								activeStage === "delivered"
									? 1
									: activeStage === "opened" || activeStage === "clicked"
										? 0.75
										: 1
							}
						>
							{/* Outer Layer Glow Band */}
							<path
								d="M 0 10 L 240 10 C 290 10, 290 42, 340 42 L 340 138 C 290 138, 290 170, 240 170 L 0 170 Z"
								fill="#4F46E5"
								fillOpacity="0.16"
							/>
							{/* Middle Layer */}
							<path
								d="M 0 15 L 240 15 C 290 15, 290 46, 340 46 L 340 134 C 290 134, 290 165, 240 165 L 0 165 Z"
								fill="#4F46E5"
								fillOpacity="0.3"
							/>
							{/* Core Stream */}
							<path
								d="M 0 20 L 240 20 C 290 20, 290 50, 340 50 L 340 130 C 290 130, 290 160, 240 160 L 0 160 Z"
								fill="url(#funnel-indigo-cyan)"
							/>
						</g>

						{/* --- 2. Opened Stream (Cyan Stream) --- */}
						<g
							className="cursor-pointer transition-opacity duration-200"
							onClick={() => setActiveStage("opened")}
							opacity={
								activeStage === "opened"
									? 1
									: activeStage === "delivered" || activeStage === "clicked"
										? 0.75
										: 1
							}
						>
							{/* Outer Layer Glow Band */}
							<path
								d="M 340 42 L 500 42 C 550 42, 550 68, 600 68 L 600 112 C 550 112, 550 138, 500 138 L 340 138 Z"
								fill="#0EA5E9"
								fillOpacity="0.16"
							/>
							{/* Middle Layer */}
							<path
								d="M 340 46 L 500 46 C 550 46, 550 71, 600 71 L 600 109 C 550 109, 550 134, 500 134 L 340 134 Z"
								fill="#0EA5E9"
								fillOpacity="0.3"
							/>
							{/* Core Stream */}
							<path
								d="M 340 50 L 500 50 C 550 50, 550 74, 600 74 L 600 106 C 550 106, 550 130, 500 130 L 340 130 Z"
								fill="url(#funnel-cyan-emerald)"
							/>
						</g>

						{/* --- 3. Clicked Stream (Reloop Signature Emerald Stream) --- */}
						<g
							className="cursor-pointer transition-opacity duration-200"
							onClick={() => setActiveStage("clicked")}
							opacity={
								activeStage === "clicked"
									? 1
									: activeStage === "delivered" || activeStage === "opened"
										? 0.75
										: 1
							}
						>
							{/* Outer Layer Glow Band */}
							<path
								d="M 600 68 L 760 68 L 760 112 L 600 112 Z"
								fill="#059669"
								fillOpacity="0.18"
							/>
							{/* Middle Layer */}
							<path
								d="M 600 71 L 760 71 L 760 109 L 600 109 Z"
								fill="#059669"
								fillOpacity="0.32"
							/>
							{/* Core Stream */}
							<path
								d="M 600 74 L 760 74 L 760 106 L 600 106 Z"
								fill="url(#funnel-emerald-end)"
							/>
						</g>
					</svg>

					{/* Centered Retention Badges overlay */}
					<div className="pointer-events-none absolute inset-0 flex items-center justify-between px-14 sm:px-20">
						{/* Delivered 100% badge */}
						<div className="flex items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-white-0/95 px-2.5 py-0.5 font-bold text-[#4F46E5] text-[10px] shadow-sm dark:border-white/10 dark:bg-black/90 dark:text-indigo-400">
							100%
						</div>

						{/* Opened 48.2% badge */}
						<div className="flex items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-white-0/95 px-2.5 py-0.5 font-bold text-[#0284C7] text-[10px] shadow-sm dark:border-white/10 dark:bg-black/90 dark:text-cyan-400">
							48.2%
						</div>

						{/* Clicked 14.6% badge */}
						<div className="flex items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-white-0/95 px-2.5 py-0.5 font-bold text-[#059669] text-[10px] shadow-sm dark:border-white/10 dark:bg-black/90 dark:text-emerald-400">
							14.6%
						</div>
					</div>
				</div>

				{/* Minimal Stage Insights Footer */}
				<div className="mt-2.5 border-stroke-soft-100 border-t pt-2 text-[10px] dark:border-white/5">
					<AnimatePresence mode="wait">
						{activeStage === "delivered" && (
							<motion.div
								key="delivered-footer"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.15 }}
								className="flex flex-wrap items-center justify-between gap-2 text-[10px]"
							>
								<div className="flex items-center gap-3">
									<span className="text-text-sub-600 dark:text-white/60">
										Gmail{" "}
										<strong className="font-semibold text-text-strong-950 dark:text-white">
											99.8%
										</strong>
									</span>
									<span className="text-text-sub-600 dark:text-white/60">
										Apple Mail{" "}
										<strong className="font-semibold text-text-strong-950 dark:text-white">
											99.9%
										</strong>
									</span>
									<span className="text-text-sub-600 dark:text-white/60">
										Outlook{" "}
										<strong className="font-semibold text-text-strong-950 dark:text-white">
											98.6%
										</strong>
									</span>
								</div>
								<span className="text-text-soft-400 dark:text-white/40">
									Direct TLS 1.3 Routing
								</span>
							</motion.div>
						)}

						{activeStage === "opened" && (
							<motion.div
								key="opened-footer"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.15 }}
								className="flex flex-wrap items-center justify-between gap-2 text-[10px]"
							>
								<div className="flex items-center gap-3">
									<span className="text-text-sub-600 dark:text-white/60">
										Apple Mail{" "}
										<strong className="font-semibold text-text-strong-950 dark:text-white">
											54%
										</strong>
									</span>
									<span className="text-text-sub-600 dark:text-white/60">
										Gmail{" "}
										<strong className="font-semibold text-text-strong-950 dark:text-white">
											33%
										</strong>
									</span>
									<span className="text-text-sub-600 dark:text-white/60">
										Outlook{" "}
										<strong className="font-semibold text-text-strong-950 dark:text-white">
											13%
										</strong>
									</span>
								</div>
								<span className="text-text-soft-400 dark:text-white/40">
									Peak: 9:00 AM – 11:30 AM
								</span>
							</motion.div>
						)}

						{activeStage === "clicked" && (
							<motion.div
								key="clicked-footer"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.15 }}
								className="flex flex-wrap items-center justify-between gap-2 text-[10px]"
							>
								<div className="flex items-center gap-3">
									<span className="text-text-sub-600 dark:text-white/60">
										Verify Email{" "}
										<strong className="font-semibold text-text-strong-950 dark:text-white">
											49.5%
										</strong>
									</span>
									<span className="text-text-sub-600 dark:text-white/60">
										Quickstart{" "}
										<strong className="font-semibold text-text-strong-950 dark:text-white">
											32.2%
										</strong>
									</span>
									<span className="text-text-sub-600 dark:text-white/60">
										Pricing{" "}
										<strong className="font-semibold text-text-strong-950 dark:text-white">
											18.3%
										</strong>
									</span>
								</div>
								<span className="text-text-soft-400 dark:text-white/40">
									CTOR: 30.3%
								</span>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}

/* --- Scene 3: Bounce & Diagnostics (Email Detail & Insights View) --- */
const SAMPLE_DIAGNOSTIC_EMAIL: EmailItem = {
	id: "msg_prod_deploy_948",
	to: "noah@vercel.com",
	subject: "Production deployment finished",
	status: "clicked",
	time: "17 Aug, 6:24pm",
};

function BouncesView() {
	const [activeDetailTab, setActiveDetailTab] =
		useState<DetailTabId>("insights");

	return (
		<div className="relative mx-auto w-full max-w-5xl">
			<div className="mx-auto max-w-3xl overflow-hidden sm:px-1">
				<EmailDetail
					email={SAMPLE_DIAGNOSTIC_EMAIL}
					mounted={true}
					compact={true}
					activeTab={activeDetailTab}
					onTabChange={(tab) => setActiveDetailTab(tab as DetailTabId)}
				/>
			</div>
		</div>
	);
}

/* --- Main PreviewStage Component --- */
export function PreviewStage() {
	const shouldReduceMotion = useReducedMotion();
	const [active, setActive] = useState<AnalyticsTabId>("metrics");
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
		<div className="bg-bg-white-0 dark:bg-black">
			<div className="relative overflow-hidden">
				<div className="relative mx-auto h-[24rem] max-w-5xl px-0 pt-0 sm:h-[26rem] lg:h-[28rem]">
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
							className={cn(
								"relative w-full",
								active === "metrics" ? "h-full" : "px-4 pt-4 sm:px-6 sm:pt-6",
							)}
						>
							{active === "metrics" ? (
								<MetricsLayeredView />
							) : active === "engagement" ? (
								<EngagementView />
							) : (
								<BouncesView />
							)}
						</motion.div>
					</AnimatePresence>
				</div>
				<div
					aria-hidden
					className={cn(
						"pointer-events-none absolute inset-x-0 bottom-0 z-20 transition-all duration-300",
						active === "metrics"
							? "h-6 bg-gradient-to-t from-[#fbfbfb]/50 to-transparent dark:from-black/50"
							: "h-44 bg-gradient-to-t from-15% from-[#fbfbfb] via-[#fbfbfb]/80 to-transparent dark:from-[#0a0a0a] dark:via-[#0a0a0a]/80",
					)}
				/>
			</div>
			<PreviewTabs active={active} onChange={handleTabChange} />
		</div>
	);
}
