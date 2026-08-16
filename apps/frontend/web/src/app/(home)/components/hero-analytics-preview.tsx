"use client";

import { cn } from "@reloop/ui/cn";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const DAYS = [
	"Mar 2",
	"Mar 4",
	"Mar 6",
	"Mar 8",
	"Mar 10",
	"Mar 12",
	"Mar 14",
	"Mar 16",
] as const;

const SENT = [4200, 4680, 4410, 5120, 5870, 5540, 6390, 7120];
const DELIVERED = [4120, 4600, 4330, 5040, 5780, 5450, 6290, 7010];
const OPENED = [1840, 2110, 1980, 2360, 2710, 2540, 2980, 3340];

const W = 640;
const H = 168;
const PAD = { t: 12, r: 8, b: 22, l: 8 };

function linePath(values: number[], max: number): string {
	const innerW = W - PAD.l - PAD.r;
	const innerH = H - PAD.t - PAD.b;
	return values
		.map((value, i) => {
			const x = PAD.l + (i / (values.length - 1)) * innerW;
			const y = PAD.t + innerH - (value / max) * innerH;
			return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
		})
		.join(" ");
}

function areaPath(values: number[], max: number): string {
	const innerW = W - PAD.l - PAD.r;
	const baseline = H - PAD.b;
	const lastX = PAD.l + innerW;
	return `${linePath(values, max)} L${lastX.toFixed(1)} ${baseline} L${PAD.l} ${baseline} Z`;
}

const EASE: [number, number, number, number] = [0.23, 1, 0.32, 1];

export function HeroAnalyticsPreview() {
	const reduceMotion = useReducedMotion();
	const [tick, setTick] = useState(0);

	useEffect(() => {
		if (reduceMotion) return;
		const id = window.setInterval(() => {
			setTick((n) => n + 1);
		}, 2200);
		return () => window.clearInterval(id);
	}, [reduceMotion]);

	const series = useMemo(() => {
		const wave = Math.sin(tick * 0.7) * 0.035 + 1;
		return {
			sent: SENT.map((v, i) =>
				i === SENT.length - 1 ? Math.round(v * wave) : v,
			),
			delivered: DELIVERED.map((v, i) =>
				i === DELIVERED.length - 1 ? Math.round(v * (wave - 0.008)) : v,
			),
			opened: OPENED,
		};
	}, [tick]);

	const max = Math.max(...series.sent) * 1.12;
	const sentTotal = series.sent.reduce((a, b) => a + b, 0);
	const deliveredTotal = series.delivered.reduce((a, b) => a + b, 0);
	const openedTotal = series.opened.reduce((a, b) => a + b, 0);
	const deliveredPct = ((deliveredTotal / sentTotal) * 100).toFixed(1);
	const openedPct = ((openedTotal / sentTotal) * 100).toFixed(1);

	const sentD = linePath(series.sent, max);
	const deliveredD = linePath(series.delivered, max);
	const areaD = areaPath(series.delivered, max);

	return (
		<div className="flex h-full flex-col px-5 pt-5 sm:px-7 sm:pt-6">
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="font-medium text-[13px] text-text-strong-950 dark:text-white">
						Metrics
					</p>
					<p className="mt-0.5 text-[12px] text-text-soft-400 dark:text-white/40">
						Last 15 days · mail.acme.com
					</p>
				</div>
				<div className="hidden items-center gap-1.5 sm:flex">
					<span className="inline-flex h-7 items-center rounded-lg border border-stroke-soft-200 px-2 text-[11px] text-text-sub-600 dark:border-white/10 dark:text-white/50">
						15 days
					</span>
					<span className="inline-flex h-7 items-center rounded-lg border border-stroke-soft-200 px-2 text-[11px] text-text-sub-600 dark:border-white/10 dark:text-white/50">
						All events
					</span>
				</div>
			</div>

			<div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
				<Kpi label="Sent" value={sentTotal.toLocaleString()} />
				<Kpi label="Delivered" value={`${deliveredPct}%`} accent="emerald" />
				<Kpi label="Opened" value={`${openedPct}%`} accent="sky" />
				<Kpi label="Bounce" value="0.6%" accent="rose" />
			</div>

			<div className="mt-4 min-h-0 flex-1">
				<svg
					viewBox={`0 0 ${W} ${H}`}
					className="h-full w-full"
					preserveAspectRatio="none"
					aria-hidden
				>
					<title>Deliverability over 15 days</title>
					<defs>
						<linearGradient id="hero-metrics-fill" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#10B981" stopOpacity="0.28" />
							<stop offset="100%" stopColor="#10B981" stopOpacity="0" />
						</linearGradient>
					</defs>
					{[0.25, 0.5, 0.75].map((t) => (
						<line
							key={t}
							x1={PAD.l}
							x2={W - PAD.r}
							y1={PAD.t + (H - PAD.t - PAD.b) * t}
							y2={PAD.t + (H - PAD.t - PAD.b) * t}
							className="stroke-stroke-soft-200 dark:stroke-white/10"
							strokeWidth="1"
						/>
					))}
					<motion.path
						d={areaD}
						fill="url(#hero-metrics-fill)"
						initial={reduceMotion ? false : { opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.45, ease: EASE }}
					/>
					<motion.path
						d={sentD}
						fill="none"
						stroke="#0E7090"
						strokeWidth="2"
						strokeLinejoin="round"
						strokeLinecap="round"
						initial={reduceMotion ? false : { pathLength: 0 }}
						animate={{ pathLength: 1 }}
						transition={{ duration: 0.7, ease: EASE }}
					/>
					<motion.path
						d={deliveredD}
						fill="none"
						stroke="#10B981"
						strokeWidth="2"
						strokeLinejoin="round"
						strokeLinecap="round"
						initial={reduceMotion ? false : { pathLength: 0 }}
						animate={{ pathLength: 1 }}
						transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
					/>
				</svg>
			</div>

			<div className="flex items-center gap-4 pb-4 text-[11px] text-text-sub-600 dark:text-white/45">
				<span className="flex items-center gap-1.5">
					<span className="size-1.5 rounded-full bg-[#0E7090]" />
					Sent
				</span>
				<span className="flex items-center gap-1.5">
					<span className="size-1.5 rounded-full bg-emerald-500" />
					Delivered
				</span>
				<span className="ml-auto hidden sm:inline">{DAYS[0]} – {DAYS.at(-1)}</span>
			</div>
		</div>
	);
}

function Kpi({
	label,
	value,
	accent,
}: {
	label: string;
	value: string;
	accent?: "emerald" | "sky" | "rose";
}) {
	return (
		<div className="rounded-xl border border-stroke-soft-200 px-3 py-2 dark:border-white/10">
			<p className="text-[11px] text-text-soft-400 dark:text-white/40">
				{label}
			</p>
			<p
				className={cn(
					"mt-0.5 font-medium text-[15px] tabular-nums tracking-tight",
					accent === "emerald" && "text-emerald-600 dark:text-emerald-400",
					accent === "sky" && "text-sky-600 dark:text-sky-400",
					accent === "rose" && "text-rose-600 dark:text-rose-400",
					!accent && "text-text-strong-950 dark:text-white",
				)}
			>
				{value}
			</p>
		</div>
	);
}
