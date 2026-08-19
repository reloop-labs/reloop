"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { EmailTimeline } from "../emails/detail/timeline";
import type { AnalyticsTabId } from "./preview-scenes";
import { PreviewTabs } from "./preview-tabs";

const TAB_ORDER: AnalyticsTabId[] = ["engagement", "metrics", "bounces"];

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

const DELIVERED_VALUES = [4200, 8900, 14200, 21000, 29400, 38100, 48000, 59500];
const OPENED_VALUES = [2100, 4800, 7800, 11500, 14100, 19500, 24200, 29100];
const CLICKED_VALUES = [700, 1600, 2700, 4200, 4286, 5800, 7500, 9200];
const BOUNCED_VALUES = [4, 11, 18, 26, 38, 49, 62, 74];

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
	const shouldReduceMotion = useReducedMotion();
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

	const curDelivered = DELIVERED_VALUES[hoveredIdx] ?? 29400;
	const curOpened = OPENED_VALUES[hoveredIdx] ?? 14100;
	const curClicked = CLICKED_VALUES[hoveredIdx] ?? 4286;
	const curBounced = BOUNCED_VALUES[hoveredIdx] ?? 38;
	const curDate = DATES[hoveredIdx] ?? "13 aug";

	return (
		<div className="relative h-full w-full">
			{/* Left-Side Status Metric Callouts (Delivered, Opened, Clicked, Bounced) */}
			<motion.div
				initial={
					shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }
				}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
				className="pointer-events-none absolute top-5 left-5 z-20 grid grid-cols-2 gap-x-6 gap-y-4 sm:top-7 sm:left-8 sm:gap-x-12 sm:gap-y-6"
			>
				{/* 1. Delivered */}
				<div className="border-[#3B82F6] border-l-2 pl-2.5 sm:pl-3.5">
					<p className="font-bold text-text-strong-950 text-xl tracking-tight tabular-nums sm:text-2xl lg:text-3xl dark:text-white">
						{curDelivered.toLocaleString()}
					</p>
					<p className="mt-0.5 text-[11px] text-text-sub-600 sm:text-xs dark:text-white/60">
						Delivered
					</p>
				</div>

				{/* 2. Opened */}
				<div className="border-[#A855F7] border-l-2 pl-2.5 sm:pl-3.5">
					<p className="font-bold text-text-strong-950 text-xl tracking-tight tabular-nums sm:text-2xl lg:text-3xl dark:text-white">
						{curOpened.toLocaleString()}
					</p>
					<p className="mt-0.5 text-[11px] text-text-sub-600 sm:text-xs dark:text-white/60">
						Opened
					</p>
				</div>

				{/* 3. Clicked */}
				<div className="border-[#10B981] border-l-2 pl-2.5 sm:pl-3.5">
					<p className="font-bold text-text-strong-950 text-xl tracking-tight tabular-nums sm:text-2xl lg:text-3xl dark:text-white">
						{curClicked.toLocaleString()}
					</p>
					<p className="mt-0.5 text-[11px] text-text-sub-600 sm:text-xs dark:text-white/60">
						Clicked
					</p>
				</div>

				{/* 4. Bounced */}
				<div className="border-[#EF4444] border-l-2 pl-2.5 sm:pl-3.5">
					<p className="font-bold text-text-strong-950 text-xl tracking-tight tabular-nums sm:text-2xl lg:text-3xl dark:text-white">
						{curBounced.toLocaleString()}
					</p>
					<p className="mt-0.5 text-[11px] text-text-sub-600 sm:text-xs dark:text-white/60">
						Bounced
					</p>
				</div>
			</motion.div>

			{/* Date Badge (Top Right) */}
			<motion.div
				initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.4, delay: 0.3 }}
				className="pointer-events-none absolute top-5 right-5 z-20 flex items-center gap-2 sm:top-7 sm:right-8"
			>
				<div className="flex items-center gap-1.5 rounded-full border border-stroke-soft-200 bg-bg-white-0/80 px-2.5 py-1 font-medium text-[11px] text-text-sub-600 shadow-xs backdrop-blur-sm dark:border-white/10 dark:bg-[#141416]/80 dark:text-white/70">
					<span className="size-1.5 rounded-full bg-blue-500" />
					<span className="uppercase tracking-wider">{curDate}</span>
				</div>
			</motion.div>

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
					<motion.line
						x1={activeDeliveredPt.x}
						y1={0}
						x2={activeDeliveredPt.x}
						y2={h}
						stroke="currentColor"
						className="text-black/15 dark:text-white/20"
						strokeWidth="1.2"
						initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.4, delay: 0.8 }}
					/>

					{/* 1. Delivered Area & Curve (Blue) */}
					<motion.path
						d={deliveredCurve.area}
						fill="url(#grad-delivered)"
						initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
					/>
					<motion.path
						d={deliveredCurve.path}
						fill="none"
						stroke="#3B82F6"
						strokeWidth="2.4"
						strokeLinecap="round"
						strokeLinejoin="round"
						initial={
							shouldReduceMotion
								? { pathLength: 1, opacity: 1 }
								: { pathLength: 0, opacity: 0 }
						}
						animate={{ pathLength: 1, opacity: 1 }}
						transition={{
							duration: 1.25,
							delay: 0.05,
							ease: [0.25, 0.1, 0.25, 1],
						}}
					/>

					{/* 2. Opened Area & Curve (Purple) */}
					<motion.path
						d={openedCurve.area}
						fill="url(#grad-opened)"
						initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.8, delay: 0.55, ease: "easeOut" }}
					/>
					<motion.path
						d={openedCurve.path}
						fill="none"
						stroke="#A855F7"
						strokeWidth="2.4"
						strokeLinecap="round"
						strokeLinejoin="round"
						initial={
							shouldReduceMotion
								? { pathLength: 1, opacity: 1 }
								: { pathLength: 0, opacity: 0 }
						}
						animate={{ pathLength: 1, opacity: 1 }}
						transition={{
							duration: 1.25,
							delay: 0.12,
							ease: [0.25, 0.1, 0.25, 1],
						}}
					/>

					{/* 3. Clicked Area & Curve (Emerald) */}
					<motion.path
						d={clickedCurve.area}
						fill="url(#grad-clicked)"
						initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.8, delay: 0.65, ease: "easeOut" }}
					/>
					<motion.path
						d={clickedCurve.path}
						fill="none"
						stroke="#10B981"
						strokeWidth="2.4"
						strokeLinecap="round"
						strokeLinejoin="round"
						initial={
							shouldReduceMotion
								? { pathLength: 1, opacity: 1 }
								: { pathLength: 0, opacity: 0 }
						}
						animate={{ pathLength: 1, opacity: 1 }}
						transition={{
							duration: 1.25,
							delay: 0.18,
							ease: [0.25, 0.1, 0.25, 1],
						}}
					/>

					{/* 4. Bounced Area & Curve (Red) */}
					<motion.path
						d={bouncedCurve.area}
						fill="url(#grad-bounced)"
						initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.8, delay: 0.75, ease: "easeOut" }}
					/>
					<motion.path
						d={bouncedCurve.path}
						fill="none"
						stroke="#EF4444"
						strokeWidth="2.4"
						strokeLinecap="round"
						strokeLinejoin="round"
						initial={
							shouldReduceMotion
								? { pathLength: 1, opacity: 1 }
								: { pathLength: 0, opacity: 0 }
						}
						animate={{ pathLength: 1, opacity: 1 }}
						transition={{
							duration: 1.25,
							delay: 0.24,
							ease: [0.25, 0.1, 0.25, 1],
						}}
					/>

					{/* Active Glowing Dots on Curves */}
					<motion.circle
						cx={activeDeliveredPt.x}
						cy={activeDeliveredPt.y}
						r={5}
						className="fill-white stroke-[#3B82F6] stroke-[2.5] dark:fill-black"
						initial={
							shouldReduceMotion
								? { scale: 1, opacity: 1 }
								: { scale: 0, opacity: 0 }
						}
						animate={{ scale: 1, opacity: 1 }}
						transition={{
							duration: 0.35,
							delay: 0.85,
							ease: [0.34, 1.56, 0.64, 1],
						}}
					/>
					<motion.circle
						cx={activeOpenedPt.x}
						cy={activeOpenedPt.y}
						r={5}
						className="fill-white stroke-[#A855F7] stroke-[2.5] dark:fill-black"
						initial={
							shouldReduceMotion
								? { scale: 1, opacity: 1 }
								: { scale: 0, opacity: 0 }
						}
						animate={{ scale: 1, opacity: 1 }}
						transition={{
							duration: 0.35,
							delay: 0.9,
							ease: [0.34, 1.56, 0.64, 1],
						}}
					/>
					<motion.circle
						cx={activeClickedPt.x}
						cy={activeClickedPt.y}
						r={5}
						className="fill-white stroke-[#10B981] stroke-[2.5] dark:fill-black"
						initial={
							shouldReduceMotion
								? { scale: 1, opacity: 1 }
								: { scale: 0, opacity: 0 }
						}
						animate={{ scale: 1, opacity: 1 }}
						transition={{
							duration: 0.35,
							delay: 0.95,
							ease: [0.34, 1.56, 0.64, 1],
						}}
					/>
					<motion.circle
						cx={activeBouncedPt.x}
						cy={activeBouncedPt.y}
						r={5}
						className="fill-white stroke-[#EF4444] stroke-[2.5] dark:fill-black"
						initial={
							shouldReduceMotion
								? { scale: 1, opacity: 1 }
								: { scale: 0, opacity: 0 }
						}
						animate={{ scale: 1, opacity: 1 }}
						transition={{
							duration: 0.35,
							delay: 1.0,
							ease: [0.34, 1.56, 0.64, 1],
						}}
					/>
				</svg>
			</div>
		</div>
	);
}

/* --- Scene 2: Engagement & Clicks (Timeline Sequence View) --- */
function EngagementView() {
	const [status, setStatus] = useState<string>("delivered");

	useEffect(() => {
		const t1 = setTimeout(() => {
			setStatus("opened");
		}, 1000);

		const t2 = setTimeout(() => {
			setStatus("clicked");
		}, 1800);

		return () => {
			clearTimeout(t1);
			clearTimeout(t2);
		};
	}, []);

	return (
		<div className="relative mx-auto flex h-full min-h-[300px] w-full max-w-2xl flex-col items-center justify-center px-4 py-4 sm:min-h-[340px] sm:py-6 lg:min-h-[380px]">
			{/* Event Timeline Sequence Card */}
			<div className="relative w-full max-w-xl">
				<EmailTimeline status={status} mounted={true} compact={false} />
			</div>
		</div>
	);
}

/* --- Scene 3: Bounces & Diagnostics --- */
function BounceErrorPanel() {
	return (
		<div className="overflow-hidden rounded-2xl border border-red-500/20 bg-red-50/40 shadow-xs dark:border-red-500/20 dark:bg-red-950/20">
			{/* Top row */}
			<div className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs sm:text-sm">
				<div className="flex min-w-0 items-center gap-2.5">
					<Icon
						name="cross-circle"
						className="size-4 shrink-0 text-red-600 dark:text-red-400"
					/>
					<span className="shrink-0 font-semibold text-red-600 dark:text-red-400">
						Delivery Failed
					</span>
					<span className="shrink-0 text-neutral-300 dark:text-neutral-700">
						|
					</span>
					<span className="truncate font-medium text-text-sub-600 dark:text-white/70">
						Receiving server rejected the address — inbox may not exist.
					</span>
				</div>
			</div>

			{/* Error details content */}
			<div className="border-red-500/10 border-t bg-bg-white-0/80 p-3.5 sm:p-4 dark:border-red-500/10 dark:bg-black/40">
				<pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-[11.5px] text-red-600 leading-relaxed sm:text-xs dark:text-red-400">
					smtp; 550 5.1.1 &lt;noah@vercel.com&gt;: Recipient address rejected: User unknown in virtual mailbox table
				</pre>
			</div>
		</div>
	);
}

function BouncesView() {
	return (
		<div className="relative mx-auto flex h-full min-h-[300px] w-full max-w-2xl flex-col items-center justify-center space-y-4 px-4 py-4 sm:min-h-[340px] sm:space-y-5 sm:py-6 lg:min-h-[380px]">
			{/* Event Timeline Sequence Card (Sent -> Bounced) */}
			<div className="relative w-full max-w-xl">
				<EmailTimeline status="bounced" mounted={true} compact={false} />
			</div>

			{/* Bounce / SMTP Error Details Panel */}
			<div className="relative w-full max-w-xl">
				<BounceErrorPanel />
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
							className="relative h-full w-full"
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
					className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-6 bg-gradient-to-t from-[#fbfbfb]/50 to-transparent transition-all duration-300 dark:from-black/50"
				/>
			</div>
			<PreviewTabs active={active} onChange={handleTabChange} />
		</div>
	);
}
