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

/* --- Scene 1: Reloop Dashboard Metrics Unified View --- */
const DATES = [
	"5 aug",
	"6 aug",
	"7 aug",
	"8 aug",
	"9 aug",
	"10 aug",
	"11 aug",
	"12 aug",
	"13 aug",
	"14 aug",
	"15 aug",
	"16 aug",
	"17 aug",
	"18 aug",
];

const DELIVERABILITY_COUNTS = [
	120, 180, 240, 290, 840, 4850, 3920, 1200, 1420, 1890, 2340, 3100, 4200, 5980,
];

const METRIC_DATA = [
	{ date: "5 AUG", delivered: 120, bounces: 0, complained: 0 },
	{ date: "6 AUG", delivered: 180, bounces: 0, complained: 0 },
	{ date: "7 AUG", delivered: 240, bounces: 0, complained: 0 },
	{ date: "8 AUG", delivered: 290, bounces: 0, complained: 0 },
	{ date: "9 AUG", delivered: 840, bounces: 1, complained: 0 },
	{ date: "10 AUG", delivered: 4850, bounces: 4, complained: 0 },
	{ date: "11 AUG", delivered: 3920, bounces: 0, complained: 0 },
	{ date: "12 AUG", delivered: 1200, bounces: 0, complained: 0 },
	{ date: "13 AUG", delivered: 1420, bounces: 0, complained: 0 },
	{ date: "14 AUG", delivered: 1890, bounces: 1, complained: 0 },
	{ date: "15 AUG", delivered: 2340, bounces: 2, complained: 0 },
	{ date: "16 AUG", delivered: 3100, bounces: 3, complained: 0 },
	{ date: "17 AUG", delivered: 4200, bounces: 4, complained: 0 },
	{ date: "18 AUG", delivered: 5980, bounces: 3, complained: 1 },
];

const DATE_PRESETS = [
	"Last 1 hour",
	"Last 24 hours",
	"Last 7 days",
	"Last 15 days",
	"Last 30 days",
];

const DOMAINS = [
	"All Domains",
	"reloop.sh",
	"mail.reloop.sh",
	"updates.acme.corp",
];

function MetricsLayeredView() {
	const [hoveredIdx, setHoveredIdx] = useState<number>(6); // Default 11 aug
	const [dateOpen, setDateOpen] = useState(false);
	const [selectedPreset, setSelectedPreset] = useState("Last 15 days");
	const [domainOpen, setDomainOpen] = useState(false);
	const [selectedDomain, setSelectedDomain] = useState("All Domains");

	const max = 6500;
	const w = 740;
	const h = 140;
	const pad = { t: 12, r: 16, b: 24, l: 12 };
	const innerW = w - pad.l - pad.r;
	const innerH = h - pad.t - pad.b;

	const points = DELIVERABILITY_COUNTS.map((val, idx) => {
		const x = pad.l + (idx / (DATES.length - 1)) * innerW;
		const y = pad.t + (1 - val / max) * innerH;
		return { x, y };
	});

	const pathD = points.reduce((acc, pt, i) => {
		if (i === 0) return `M ${pt.x} ${pt.y}`;
		const prev = points[i - 1] ?? pt;
		const cp1x = prev.x + (pt.x - prev.x) / 2;
		const cp2x = cp1x;
		return `${acc} C ${cp1x} ${prev.y}, ${cp2x} ${pt.y}, ${pt.x} ${pt.y}`;
	}, "");

	const firstPt = points[0] ?? { x: 0, y: 0 };
	const lastPt = points[points.length - 1] ?? { x: w, y: h };
	const areaD = `${pathD} L ${lastPt.x} ${h - pad.b} L ${firstPt.x} ${h - pad.b} Z`;

	const activePt = points[hoveredIdx] ?? points[6] ?? { x: w / 2, y: h / 2 };
	const activeMetric = METRIC_DATA[hoveredIdx] ??
		METRIC_DATA[6] ?? {
			date: "11 AUG",
			delivered: 3920,
			bounces: 0,
			complained: 0,
		};

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const ratio = Math.max(0, Math.min(1, mouseX / rect.width));
		const closestIdx = Math.round(ratio * (DATES.length - 1));
		if (closestIdx >= 0 && closestIdx < DATES.length) {
			setHoveredIdx(closestIdx);
		}
	};

	return (
		<div className="relative mx-auto w-full max-w-5xl">
			{/* Main Base Card: Reloop Deliverability Dashboard Panel */}
			<div className="relative rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] sm:p-6 dark:border-white/10 dark:bg-[#0c0c0e]">
				{/* Top Dashboard Header & Filters */}
				<div className="flex flex-wrap items-center justify-between gap-3 border-stroke-soft-100 border-b pb-4 dark:border-white/5">
					<div className="flex items-center gap-2.5">
						<div className="flex size-7 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-weak-50 text-text-strong-950 dark:border-white/10 dark:bg-white/[0.05] dark:text-white">
							<Icon name="graph-up" className="size-4" />
						</div>
						<div>
							<h3 className="font-semibold text-sm text-text-strong-950 tracking-tight dark:text-white">
								Metrics
							</h3>
							<p className="text-[11px] text-text-sub-600 dark:text-white/50">
								Deliverability and engagement metrics for your emails.
							</p>
						</div>
					</div>

					<div className="relative flex items-center gap-2">
						{/* Date Filter Trigger & Popover */}
						<div className="relative">
							<button
								type="button"
								onClick={() => {
									setDateOpen(!dateOpen);
									setDomainOpen(false);
								}}
								className={cn(
									"flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-all",
									dateOpen
										? "border-text-strong-950 bg-bg-weak-50 text-text-strong-950 dark:border-white dark:bg-white/10 dark:text-white"
										: "border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 shadow-xs hover:bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/70 dark:hover:bg-white/5",
								)}
							>
								<Icon name="calendar" className="size-3.5" />
								<span>{selectedPreset}</span>
								<span className="text-[10px]">▾</span>
							</button>

							{/* Date Range Dropdown Modal (Matching Reloop Dashboard) */}
							<AnimatePresence>
								{dateOpen && (
									<motion.div
										initial={{ opacity: 0, y: 6, scale: 0.98 }}
										animate={{ opacity: 1, y: 0, scale: 1 }}
										exit={{ opacity: 0, y: 6, scale: 0.98 }}
										transition={{ duration: 0.15 }}
										className="-right-16 absolute top-full z-50 mt-2 flex w-[320px] flex-col overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-[0_20px_50px_rgba(0,0,0,0.18)] sm:right-0 sm:w-[620px] sm:flex-row dark:border-white/10 dark:bg-[#121214]"
									>
										{/* Left Presets Sidebar */}
										<div className="flex w-full shrink-0 flex-col gap-1 border-stroke-soft-100 border-b p-3 sm:w-44 sm:border-r sm:border-b-0 dark:border-white/10">
											{DATE_PRESETS.map((preset) => {
												const isSelected = preset === selectedPreset;
												return (
													<button
														key={preset}
														type="button"
														onClick={() => setSelectedPreset(preset)}
														className={cn(
															"flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors",
															isSelected
																? "border border-blue-500/60 bg-blue-50/50 font-medium text-blue-600 dark:border-blue-500/50 dark:bg-blue-950/40 dark:text-blue-400"
																: "text-text-sub-600 hover:bg-bg-weak-50 dark:text-white/70 dark:hover:bg-white/5",
														)}
													>
														<span>{preset}</span>
														{isSelected && (
															<span className="text-blue-600 dark:text-blue-400">
																✓
															</span>
														)}
													</button>
												);
											})}
										</div>

										{/* Right 2-Month Calendar Grid */}
										<div className="flex flex-1 flex-col p-4">
											{/* Month Navigation Header */}
											<div className="flex items-center justify-between pb-3">
												<button
													type="button"
													className="flex size-6 items-center justify-center rounded-md border border-stroke-soft-200 text-text-sub-600 text-xs hover:bg-bg-weak-50 dark:border-white/10 dark:text-white/70"
												>
													‹
												</button>
												<div className="flex items-center gap-12 font-medium text-text-strong-950 text-xs dark:text-white">
													<span>July 2026</span>
													<span>August 2026</span>
												</div>
												<button
													type="button"
													className="flex size-6 items-center justify-center rounded-md border border-stroke-soft-200 text-text-sub-600 text-xs hover:bg-bg-weak-50 dark:border-white/10 dark:text-white/70"
												>
													›
												</button>
											</div>

											{/* Weekday headers & Calendar Grids */}
											<div className="grid grid-cols-2 gap-4 text-center text-[11px]">
												{/* July */}
												<div>
													<div className="grid grid-cols-7 pb-1 text-text-soft-400 dark:text-white/40">
														<span>Su</span>
														<span>Mo</span>
														<span>Tu</span>
														<span>We</span>
														<span>Th</span>
														<span>Fr</span>
														<span>Sa</span>
													</div>
													<div className="grid grid-cols-7 gap-y-1 pt-1 text-text-sub-600 dark:text-white/70">
														<span className="col-start-4">1</span>
														<span>2</span>
														<span>3</span>
														<span>4</span>
														<span>5</span>
														<span>6</span>
														<span>7</span>
														<span>8</span>
														<span>9</span>
														<span>10</span>
														<span>11</span>
														<span>12</span>
														<span>13</span>
														<span>14</span>
														<span>15</span>
														<span>16</span>
														<span>17</span>
														<span>18</span>
														<span>19</span>
														<span>20</span>
														<span>21</span>
														<span>22</span>
														<span>23</span>
														<span>24</span>
														<span>25</span>
														<span>26</span>
														<span>27</span>
														<span>28</span>
														<span>29</span>
														<span>30</span>
														<span>31</span>
													</div>
												</div>

												{/* August */}
												<div>
													<div className="grid grid-cols-7 pb-1 text-text-soft-400 dark:text-white/40">
														<span>Su</span>
														<span>Mo</span>
														<span>Tu</span>
														<span>We</span>
														<span>Th</span>
														<span>Fr</span>
														<span>Sa</span>
													</div>
													<div className="grid grid-cols-7 gap-y-1 pt-1 text-text-sub-600 dark:text-white/70">
														<span className="col-start-7">1</span>
														<span>2</span>
														<span>3</span>
														{/* Selected Start Range (4) */}
														<span className="flex size-5 items-center justify-center rounded-md bg-blue-600 font-semibold text-white">
															4
														</span>
														{/* In-Range Selected (5..8) */}
														<span className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
															5
														</span>
														<span className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
															6
														</span>
														<span className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
															7
														</span>
														<span className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
															8
														</span>
														{/* In-Range Selected (9..15) */}
														<span className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
															9
														</span>
														<span className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
															10
														</span>
														<span className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
															11
														</span>
														<span className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
															12
														</span>
														<span className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
															13
														</span>
														<span className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
															14
														</span>
														<span className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
															15
														</span>
														{/* In-Range Selected (16..17) */}
														<span className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
															16
														</span>
														<span className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
															17
														</span>
														{/* Selected End Range (18) */}
														<span className="flex size-5 items-center justify-center rounded-md bg-blue-600 font-semibold text-white">
															18
														</span>
														<span className="text-text-soft-400/50 dark:text-white/20">
															19
														</span>
														<span className="text-text-soft-400/50 dark:text-white/20">
															20
														</span>
														<span className="text-text-soft-400/50 dark:text-white/20">
															21
														</span>
														<span className="text-text-soft-400/50 dark:text-white/20">
															22
														</span>
													</div>
												</div>
											</div>

											{/* Footer Action Buttons */}
											<div className="mt-4 flex items-center justify-end gap-2 border-stroke-soft-100 border-t pt-3 dark:border-white/10">
												<button
													type="button"
													onClick={() => setDateOpen(false)}
													className="cursor-pointer rounded-lg px-3 py-1.5 text-text-sub-600 text-xs hover:bg-bg-weak-50 dark:text-white/70 dark:hover:bg-white/5"
												>
													Reset
												</button>
												<button
													type="button"
													onClick={() => setDateOpen(false)}
													className="cursor-pointer rounded-lg bg-text-strong-950 px-4 py-1.5 font-medium text-white text-xs shadow-xs hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
												>
													Apply
												</button>
											</div>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>

						{/* Domain Selector Trigger & Popover */}
						<div className="relative">
							<button
								type="button"
								onClick={() => {
									setDomainOpen(!domainOpen);
									setDateOpen(false);
								}}
								className={cn(
									"flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-all",
									domainOpen
										? "border-text-strong-950 bg-bg-weak-50 text-text-strong-950 dark:border-white dark:bg-white/10 dark:text-white"
										: "border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 shadow-xs hover:bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/70 dark:hover:bg-white/5",
								)}
							>
								<span>{selectedDomain}</span>
								<span className="text-[10px]">▾</span>
							</button>

							<AnimatePresence>
								{domainOpen && (
									<motion.div
										initial={{ opacity: 0, y: 6, scale: 0.98 }}
										animate={{ opacity: 1, y: 0, scale: 1 }}
										exit={{ opacity: 0, y: 6, scale: 0.98 }}
										transition={{ duration: 0.15 }}
										className="absolute top-full right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:border-white/10 dark:bg-[#121214]"
									>
										{DOMAINS.map((domain) => (
											<button
												key={domain}
												type="button"
												onClick={() => {
													setSelectedDomain(domain);
													setDomainOpen(false);
												}}
												className={cn(
													"flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors",
													domain === selectedDomain
														? "bg-bg-weak-50 font-medium text-text-strong-950 dark:bg-white/10 dark:text-white"
														: "text-text-sub-600 hover:bg-bg-weak-50 dark:text-white/70 dark:hover:bg-white/5",
												)}
											>
												<span>{domain}</span>
												{domain === selectedDomain && <span>✓</span>}
											</button>
										))}
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>

				{/* 3 KPI Health Cards Row */}
				<div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
					{/* Deliverability */}
					<div className="flex flex-col justify-between rounded-xl border border-stroke-soft-200 p-3 dark:border-white/10">
						<div>
							<span className="font-medium text-[10px] text-text-soft-400 uppercase tracking-[0.08em] dark:text-white/40">
								Deliverability
							</span>
							<p className="mt-0.5 font-semibold text-text-strong-950 text-xl tracking-tight dark:text-white">
								Excellent
							</p>
						</div>
						<div className="mt-2 space-y-1 border-stroke-soft-100 border-t pt-1.5 text-[11px] dark:border-white/5">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-1.5">
									<span className="size-1.5 rounded-full bg-blue-500" />
									<span className="text-text-sub-600 dark:text-white/60">
										Sent
									</span>
								</div>
								<span className="font-medium text-text-strong-950 tabular-nums dark:text-white">
									29,486 · 100%
								</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-1.5">
									<span className="size-1.5 rounded-full bg-[#10B981]" />
									<span className="text-text-sub-600 dark:text-white/60">
										Delivered
									</span>
								</div>
								<span className="font-medium text-text-strong-950 tabular-nums dark:text-white">
									29,310 · 99.4%
								</span>
							</div>
						</div>
					</div>

					{/* Reputation */}
					<div className="flex flex-col justify-between rounded-xl border border-stroke-soft-200 p-3 dark:border-white/10">
						<div>
							<span className="font-medium text-[10px] text-text-soft-400 uppercase tracking-[0.08em] dark:text-white/40">
								Reputation
							</span>
							<p className="mt-0.5 font-semibold text-text-strong-950 text-xl tracking-tight dark:text-white">
								Excellent
							</p>
						</div>
						<div className="mt-2 space-y-1 border-stroke-soft-100 border-t pt-1.5 text-[11px] dark:border-white/5">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-1.5">
									<span className="size-1.5 rounded-full bg-[#EF4444]" />
									<span className="text-text-sub-600 dark:text-white/60">
										Bounced
									</span>
								</div>
								<span className="font-medium text-text-strong-950 tabular-nums dark:text-white">
									158 · 0.54%
								</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-1.5">
									<span className="size-1.5 rounded-full bg-[#FDB022]" />
									<span className="text-text-sub-600 dark:text-white/60">
										Complained
									</span>
								</div>
								<span className="font-medium text-text-strong-950 tabular-nums dark:text-white">
									2 · 0.01%
								</span>
							</div>
						</div>
					</div>

					{/* Engagement */}
					<div className="flex flex-col justify-between rounded-xl border border-stroke-soft-200 p-3 dark:border-white/10">
						<div>
							<span className="font-medium text-[10px] text-text-soft-400 uppercase tracking-[0.08em] dark:text-white/40">
								Engagement
							</span>
							<p className="mt-0.5 font-semibold text-text-strong-950 text-xl tracking-tight dark:text-white">
								Good
							</p>
						</div>
						<div className="mt-2 space-y-1 border-stroke-soft-100 border-t pt-1.5 text-[11px] dark:border-white/5">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-1.5">
									<span className="size-1.5 rounded-full bg-[#8B5CF6]" />
									<span className="text-text-sub-600 dark:text-white/60">
										Opened
									</span>
								</div>
								<span className="font-medium text-text-strong-950 tabular-nums dark:text-white">
									14,120 · 48.1%
								</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-1.5">
									<span className="size-1.5 rounded-full bg-[#9CA3AF]" />
									<span className="text-text-sub-600 dark:text-white/60">
										Unsubscribed
									</span>
								</div>
								<span className="font-medium text-text-strong-950 tabular-nums dark:text-white">
									124 · 0.42%
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Main Deliverability Chart Area */}
				<div className="mt-2.5 rounded-xl border border-stroke-soft-200 p-3.5 dark:border-white/10">
					<div className="flex flex-wrap items-center justify-between gap-3 border-stroke-soft-100 border-b pb-2 dark:border-white/5">
						<div className="flex items-baseline gap-5">
							<div>
								<span className="text-[10px] text-text-soft-400 uppercase tracking-wider dark:text-white/40">
									Emails
								</span>
								<p className="font-bold text-base text-text-strong-950 tabular-nums dark:text-white">
									29,486
								</p>
							</div>
							<div>
								<span className="text-[10px] text-text-soft-400 uppercase tracking-wider dark:text-white/40">
									Deliverability Rate
								</span>
								<p className="font-bold text-[#10B981] text-base tabular-nums">
									99.4%
								</p>
							</div>
							<div>
								<span className="text-[10px] text-text-soft-400 uppercase tracking-wider dark:text-white/40">
									Bounces
								</span>
								<p className="font-bold text-base text-text-strong-950 tabular-nums dark:text-white">
									158
								</p>
							</div>
						</div>

						<div className="flex items-center gap-1.5 rounded-lg border border-stroke-soft-200 px-2.5 py-1 text-text-sub-600 text-xs dark:border-white/10 dark:text-white/70">
							<span>All Events</span>
							<span className="text-[10px]">▾</span>
						</div>
					</div>

					{/* SVG Line / Area Graph */}
					<div
						className="relative mt-2 h-[130px] w-full cursor-crosshair"
						onMouseMove={handleMouseMove}
					>
						<svg
							viewBox={`0 0 ${w} ${h}`}
							className="h-full w-full overflow-visible"
							preserveAspectRatio="none"
						>
							<defs>
								<linearGradient id="metric-grad" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stopColor="#10B981" stopOpacity="0.28" />
									<stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
								</linearGradient>
							</defs>

							{/* Horizontal dotted grid */}
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

							{/* Vertical Hover Guideline */}
							<line
								x1={activePt.x}
								y1={pad.t}
								x2={activePt.x}
								y2={h - pad.b}
								stroke="currentColor"
								className="text-black/20 dark:text-white/30"
								strokeWidth="1.2"
							/>

							{/* Area & Line */}
							<path d={areaD} fill="url(#metric-grad)" />
							<path
								d={pathD}
								fill="none"
								stroke="#10B981"
								strokeWidth="2.4"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>

							{/* Markers */}
							{points.map((pt, i) => (
								<circle
									key={DATES[i]}
									cx={pt.x}
									cy={pt.y}
									r={i === hoveredIdx ? 4 : 2.5}
									className={
										i === hoveredIdx
											? "fill-[#10B981] stroke-2 stroke-white dark:stroke-black"
											: "fill-[#10B981]"
									}
								/>
							))}

							{/* Active Point Highlight Ring */}
							<circle
								cx={activePt.x}
								cy={activePt.y}
								r={7}
								className="fill-[#10B981]/20 stroke-[#10B981] stroke-[1.5]"
							/>

							{/* X Axis Labels */}
							{DATES.map((date, i) => {
								const x = pad.l + (i / (DATES.length - 1)) * innerW;
								const isActive = i === hoveredIdx;
								return (
									<text
										key={date}
										x={x}
										y={h - 6}
										textAnchor="middle"
										className={cn(
											"text-[10px] transition-colors",
											isActive
												? "fill-text-strong-950 font-semibold dark:fill-white"
												: "fill-text-soft-400 dark:fill-white/40",
										)}
									>
										{date}
									</text>
								);
							})}
						</svg>

						{/* Reloop Native Metric Tooltip Overlay */}
						<div
							className="pointer-events-none absolute z-20 flex min-w-[170px] flex-col gap-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3.5 pt-2.5 pb-3 shadow-[0_12px_32px_rgba(0,0,0,0.12)] transition-all duration-150 dark:border-white/10 dark:bg-[#141416]"
							style={{
								left: `${(activePt.x / w) * 100}%`,
								top: `${Math.max(0, (activePt.y / h) * 100 - 30)}%`,
								transform:
									activePt.x > w * 0.65
										? "translate(-108%, -15%)"
										: "translate(14px, -15%)",
							}}
						>
							{/* Date Header */}
							<div className="flex items-center justify-between border-stroke-soft-100 border-b pb-1.5 dark:border-white/10">
								<span className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-wider dark:text-white/60">
									{activeMetric.date}
								</span>
							</div>

							{/* Metrics */}
							<div className="flex flex-col gap-1.5 text-xs">
								<div className="flex items-center justify-between gap-4">
									<div className="flex items-center gap-2">
										<span className="size-2 shrink-0 rounded-full bg-[#10B981]" />
										<span className="text-text-sub-600 dark:text-white/70">
											Delivered
										</span>
									</div>
									<span className="font-semibold text-text-strong-950 tabular-nums dark:text-white">
										{activeMetric.delivered.toLocaleString()}
									</span>
								</div>
								<div className="flex items-center justify-between gap-4">
									<div className="flex items-center gap-2">
										<span className="size-2 shrink-0 rounded-full bg-[#EF4444]" />
										<span className="text-text-sub-600 dark:text-white/70">
											Bounces
										</span>
									</div>
									<span className="font-semibold text-text-strong-950 tabular-nums dark:text-white">
										{activeMetric.bounces}
									</span>
								</div>
								<div className="flex items-center justify-between gap-4">
									<div className="flex items-center gap-2">
										<span className="size-2 shrink-0 rounded-full bg-[#FDB022]" />
										<span className="text-text-sub-600 dark:text-white/70">
											Complained
										</span>
									</div>
									<span className="font-semibold text-text-strong-950 tabular-nums dark:text-white">
										{activeMetric.complained}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Bottom Diagnostic Rate Cards Row (Side-by-Side Integrated Grid) */}
				<div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
					{/* Bounce Rate Card */}
					<div className="rounded-xl border border-stroke-soft-200 p-4 dark:border-white/10">
						<div className="flex items-center justify-between border-stroke-soft-100 border-b pb-2 dark:border-white/5">
							<span className="font-semibold text-sm text-text-strong-950 dark:text-white">
								Bounce Rate
							</span>
							<span className="font-bold text-[#10B981] text-base tabular-nums">
								0.54%
							</span>
						</div>

						{/* Dotted Risk Boundary Line */}
						<div className="mt-3 flex items-center justify-between border-amber-500/40 border-t border-dashed pt-2">
							<span className="font-medium text-[10px] text-amber-500 uppercase tracking-wider">
								RISK 4%
							</span>
							<span className="text-[11px] text-text-soft-400 dark:text-white/40">
								Healthy deliverability
							</span>
						</div>

						{/* Breakdown */}
						<div className="mt-3 space-y-1.5 text-xs">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<span className="size-2 rounded-full bg-[#EF4444]" />
									<span className="text-text-sub-600 dark:text-white/60">
										Transient
									</span>
								</div>
								<span className="font-medium text-text-strong-950 tabular-nums dark:text-white">
									120 · 76%
								</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<span className="size-2 rounded-full bg-[#EF4444]" />
									<span className="text-text-sub-600 dark:text-white/60">
										Permanent
									</span>
								</div>
								<span className="font-medium text-text-strong-950 tabular-nums dark:text-white">
									38 · 24%
								</span>
							</div>
						</div>
					</div>

					{/* Complain Rate Card */}
					<div className="rounded-xl border border-stroke-soft-200 p-4 dark:border-white/10">
						<div className="flex items-center justify-between border-stroke-soft-100 border-b pb-2 dark:border-white/5">
							<span className="font-semibold text-sm text-text-strong-950 dark:text-white">
								Complain Rate
							</span>
							<span className="font-bold text-[#10B981] text-base tabular-nums">
								0.01%
							</span>
						</div>

						{/* Dotted Risk Boundary Line */}
						<div className="mt-3 flex items-center justify-between border-amber-500/40 border-t border-dashed pt-2">
							<span className="font-medium text-[10px] text-amber-500 uppercase tracking-wider">
								RISK 0.08%
							</span>
							<span className="text-[11px] text-text-soft-400 dark:text-white/40">
								Low complaint rate
							</span>
						</div>

						{/* Breakdown */}
						<div className="mt-3 space-y-1.5 text-xs">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<span className="size-2 rounded-full bg-[#FDB022]" />
									<span className="text-text-sub-600 dark:text-white/60">
										Complained
									</span>
								</div>
								<span className="font-medium text-text-strong-950 tabular-nums dark:text-white">
									2 · 0.01%
								</span>
							</div>
							<div className="flex items-center justify-between pt-0.5">
								<span className="text-[11px] text-text-soft-400 dark:text-white/40">
									Status
								</span>
								<span className="inline-flex items-center gap-1 font-medium text-[11px] text-emerald-600 dark:text-emerald-400">
									✓ In compliance
								</span>
							</div>
						</div>
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
	const [timePreset, setTimePreset] = useState("Last 24 hours");
	const [filterOpen, setFilterOpen] = useState(false);

	return (
		<div className="relative mx-auto w-full max-w-5xl">
			{/* Main Funnel Console Window */}
			<div className="relative rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] sm:p-6 dark:border-white/10 dark:bg-[#0c0c0e]">
				{/* Header & Controls */}
				<div className="flex flex-wrap items-center justify-between gap-3 border-stroke-soft-100 border-b pb-4 dark:border-white/5">
					<div className="flex items-center gap-2.5">
						<div className="flex size-7 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-weak-50 text-text-strong-950 dark:border-white/10 dark:bg-white/[0.05] dark:text-white">
							<Icon name="cursor-click" className="size-4" />
						</div>
						<div>
							<h3 className="font-semibold text-sm text-text-strong-950 tracking-tight dark:text-white">
								Engagement Funnel
							</h3>
							<p className="text-[11px] text-text-sub-600 dark:text-white/50">
								Conversion drop-off from delivery to opens, clicks, and actions.
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						{/* Filter Preset Pill */}
						<div className="relative">
							<button
								type="button"
								onClick={() => setFilterOpen(!filterOpen)}
								className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2.5 py-1 text-text-sub-600 text-xs shadow-xs hover:bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/70 dark:hover:bg-white/5"
							>
								<Icon name="calendar" className="size-3.5" />
								<span>{timePreset}</span>
								<span className="text-[10px]">▾</span>
							</button>

							<AnimatePresence>
								{filterOpen && (
									<motion.div
										initial={{ opacity: 0, y: 4, scale: 0.98 }}
										animate={{ opacity: 1, y: 0, scale: 1 }}
										exit={{ opacity: 0, y: 4, scale: 0.98 }}
										className="absolute top-full right-0 z-30 mt-1.5 w-36 overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-lg dark:border-white/10 dark:bg-[#141416]"
									>
										{["Last 24 hours", "Last 7 days", "Last 15 days"].map(
											(p) => (
												<button
													key={p}
													type="button"
													onClick={() => {
														setTimePreset(p);
														setFilterOpen(false);
													}}
													className={cn(
														"flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors",
														p === timePreset
															? "bg-bg-weak-50 font-medium text-text-strong-950 dark:bg-white/10 dark:text-white"
															: "text-text-sub-600 hover:bg-bg-weak-50 dark:text-white/70 dark:hover:bg-white/5",
													)}
												>
													<span>{p}</span>
													{p === timePreset && <span>✓</span>}
												</button>
											),
										)}
									</motion.div>
								)}
							</AnimatePresence>
						</div>

						<div className="flex items-center gap-1.5 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2.5 py-1 text-text-sub-600 text-xs shadow-xs dark:border-white/10 dark:bg-white/[0.03] dark:text-white/70">
							<span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
							<span>Live stream</span>
						</div>
					</div>
				</div>

				{/* 3 Clickable Funnel Stage Metric Cards */}
				<div className="mt-2.5 grid grid-cols-3 divide-x divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-200 dark:divide-white/5 dark:border-white/10">
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
				<div className="relative mt-2.5 overflow-hidden rounded-xl border border-stroke-soft-200 p-2 sm:p-3 dark:border-white/10">
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
			<div className="relative rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3.5 shadow-xs sm:p-4.5 dark:border-white/10 dark:bg-white/[0.02]">
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
		<div className="bg-bg-weak-50/60 dark:bg-white/[0.015]">
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
					className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-44 bg-gradient-to-t from-15% from-[#fbfbfb] via-[#fbfbfb]/80 to-transparent dark:from-[#0a0a0a] dark:via-[#0a0a0a]/80"
				/>
			</div>
			<PreviewTabs active={active} onChange={handleTabChange} />
		</div>
	);
}
