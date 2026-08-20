"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const DAYS = ["2 mar", "4 mar", "6 mar", "8 mar", "10 mar", "12 mar", "14 mar"];
const SENT = [4200, 4680, 4410, 5120, 5870, 5540, 6390];
const DELIVERED = [4120, 4600, 4330, 5040, 5780, 5450, 6290];

const W = 720;
const H = 148;
const PAD = { t: 10, r: 28, b: 22, l: 4 };
const EASE: [number, number, number, number] = [0.23, 1, 0.32, 1];

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
		};
	}, [tick]);

	const max = Math.max(...series.sent) * 1.08;
	const sentTotal = 29486;
	const deliveredD = linePath(series.delivered, max);
	const areaD = areaPath(series.delivered, max);

	return (
		<div className="flex h-full flex-col overflow-hidden px-5 pt-5 pb-28 sm:px-7 sm:pt-6 sm:pb-24">
			<div className="flex items-start justify-between gap-3">
				<div>
					<div className="flex items-center gap-2">
						<Icon
							name="fat-row"
							className="size-5 text-text-strong-950 dark:text-white"
						/>
						<h3 className="font-semibold text-[22px] text-text-strong-950 tracking-tight dark:text-white">
							Metrics
						</h3>
					</div>
					<p className="mt-1 text-[13px] text-text-sub-600 dark:text-white/45">
						Deliverability and engagement metrics for your emails.
					</p>
				</div>
				<span className="hidden h-8 items-center rounded-xl border border-stroke-soft-200 px-3 text-[12px] text-text-sub-600 sm:inline-flex dark:border-white/10 dark:text-white/50">
					Documentation
				</span>
			</div>

			<div className="mt-4 flex flex-wrap items-center gap-2">
				<span className="inline-flex h-8 items-center rounded-xl border border-stroke-soft-200 px-2.5 text-[12px] text-text-sub-600 dark:border-white/10 dark:text-white/50">
					Last 15 days
				</span>
				<span className="inline-flex h-8 items-center rounded-xl border border-stroke-soft-200 px-2.5 text-[12px] text-text-sub-600 dark:border-white/10 dark:text-white/50">
					All Domains
				</span>
			</div>

			<div className="mt-4 min-h-0 flex-1 overflow-hidden rounded-2xl border border-stroke-soft-200 dark:border-white/10">
				<div className="border-stroke-soft-200 border-b bg-bg-weak-50/60 px-4 py-2 dark:border-white/10 dark:bg-white/[0.03]">
					<p className="font-medium text-[14px] text-text-strong-950 dark:text-white">
						Deliverability
					</p>
				</div>
				<div className="flex h-full flex-col px-4 pt-3">
					<div className="flex gap-8">
						<Stat label="Emails" value={sentTotal.toLocaleString()} />
						<Stat label="Deliverability Rate" value="98%" />
						<Stat label="Bounces" value="546" />
					</div>
					<div className="mt-3 min-h-0 flex-1">
						<svg
							viewBox={`0 0 ${W} ${H}`}
							className="h-full w-full"
							preserveAspectRatio="none"
							aria-hidden
						>
							<title>Deliverability over 15 days</title>
							<defs>
								<linearGradient
									id="hero-metrics-fill"
									x1="0"
									y1="0"
									x2="0"
									y2="1"
								>
									<stop offset="0%" stopColor="#10B981" stopOpacity="0.22" />
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
								d={deliveredD}
								fill="none"
								stroke="#10B981"
								strokeWidth="2"
								strokeLinejoin="round"
								strokeLinecap="round"
								initial={reduceMotion ? false : { pathLength: 0 }}
								animate={{ pathLength: 1 }}
								transition={{ duration: 0.7, ease: EASE }}
							/>
							{DAYS.map((day, i) => {
								const x = PAD.l + (i / (DAYS.length - 1)) * (W - PAD.l - PAD.r);
								return (
									<text
										key={day}
										x={x}
										y={H - 4}
										textAnchor="middle"
										className="fill-text-soft-400 dark:fill-white/35"
										fontSize="10"
									>
										{day}
									</text>
								);
							})}
						</svg>
					</div>
				</div>
			</div>
		</div>
	);
}

function Stat({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<p className="font-semibold text-[10px] text-text-soft-400 uppercase tracking-wider">
				{label}
			</p>
			<p className="mt-0.5 font-semibold text-[20px] text-text-strong-950 tabular-nums tracking-tight dark:text-white">
				{value}
			</p>
		</div>
	);
}
