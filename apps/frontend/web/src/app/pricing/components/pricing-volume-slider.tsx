"use client";

import { cn } from "@reloop/ui/cn";
import * as Slider from "@reloop/ui/slider";
import {
	formatPrice,
	hostedMonthlyUsdForVolume,
} from "@reloop/web/lib/pricing";
import Link from "next/link";
import { useState } from "react";

const TICKS = [
	{ value: 3000, label: "3k", plan: "Free" },
	{ value: 10000, label: "10k", plan: "Individual" },
	{ value: 50000, label: "50k", plan: "Individual" },
	{ value: 100000, label: "100k", plan: "Startup" },
	{ value: 250000, label: "250k", plan: "Startup" },
	{ value: 500000, label: "500k", plan: "Startup" },
	{ value: 1000000, label: "1M", plan: "Custom" },
];

const SEGMENTS = TICKS.length - 1;
const SEGMENT_WIDTH = 100 / SEGMENTS;
const MINOR_TICKS_PER_GAP = 4;
const SNAP_THRESHOLD = 1.5;

const clamp = (n: number, min: number, max: number) =>
	Math.min(max, Math.max(min, n));

/** Evenly-spaced tick i sits at i * SEGMENT_WIDTH; values interpolate linearly within each segment. */
const toPosition = (volume: number) => {
	const first = TICKS[0]?.value ?? 3000;
	if (volume <= first) return 0;
	for (let i = 0; i < SEGMENTS; i++) {
		const low = TICKS[i]?.value ?? first;
		const high = TICKS[i + 1]?.value ?? low;
		if (volume <= high) {
			return high === low
				? i * SEGMENT_WIDTH
				: (i + (volume - low) / (high - low)) * SEGMENT_WIDTH;
		}
	}
	return 100;
};

const toVolume = (position: number) => {
	const clamped = clamp(position, 0, 100);
	const nearestBoundary = Math.round(clamped / SEGMENT_WIDTH);
	if (Math.abs(clamped - nearestBoundary * SEGMENT_WIDTH) <= SNAP_THRESHOLD) {
		return TICKS[nearestBoundary]?.value ?? TICKS[0]?.value ?? 3000;
	}
	const index = Math.min(Math.floor(clamped / SEGMENT_WIDTH), SEGMENTS - 1);
	const low = TICKS[index]?.value ?? 3000;
	const high = TICKS[index + 1]?.value ?? low;
	const fraction = clamped / SEGMENT_WIDTH - index;
	const raw = low + fraction * (high - low);
	const granularity = raw < 10000 ? 100 : 1000;
	return Math.round(raw / granularity) * granularity;
};

const formatVolume = (volume: number) =>
	new Intl.NumberFormat("en-US").format(volume);

function recommendedPlan(volume: number) {
	if (volume > 500000) return "Custom";
	if (volume <= 3000) return "Free";
	const individual = 10 + (Math.max(0, volume - 50000) / 1000) * 0.5;
	const startup = 20 + (Math.max(0, volume - 100000) / 1000) * 0.5;
	return individual <= startup ? "Individual" : "Startup";
}

export function PricingVolumeSlider() {
	const [volume, setVolume] = useState(50000);
	const position = toPosition(volume);
	const cost = hostedMonthlyUsdForVolume(volume);
	const plan = recommendedPlan(volume);
	const included =
		plan === "Individual" ? 50000 : plan === "Startup" ? 100000 : 0;
	const overage =
		plan === "Individual" || plan === "Startup"
			? (Math.max(0, volume - included) / 1000) * 0.5
			: 0;

	let activeTick = 0;
	let smallestGap = Number.POSITIVE_INFINITY;
	TICKS.forEach((_tick, index) => {
		const gap = Math.abs(index * SEGMENT_WIDTH - position);
		if (gap < smallestGap) {
			smallestGap = gap;
			activeTick = index;
		}
	});

	return (
		<section
			aria-label="Select your monthly email volume"
			className="w-full border-stroke-soft-200 border-t px-6 pt-10 pb-12 sm:px-8 sm:pt-12 sm:pb-14 lg:px-12 dark:border-white/10"
		>
			<div className="mx-auto w-full max-w-3xl">
				<p className="text-center font-semibold text-[2.5rem] text-text-strong-950 tabular-nums leading-none tracking-tight sm:text-[3rem] dark:text-white">
					{formatVolume(volume)}
				</p>
				<p className="mt-2 text-center text-[14px] text-text-sub-600 dark:text-white/50">
					emails/month
				</p>

				<div className="mt-8 px-1">
					<Slider.Root
						min={0}
						max={100}
						step={0.5}
						value={[position]}
						onValueChange={(value) => setVolume(toVolume(value[0] ?? 0))}
						aria-label="Monthly email volume"
					>
						<Slider.Thumb aria-label="Monthly email volume" />
					</Slider.Root>

					<div className="relative mt-3 h-16">
						{TICKS.flatMap((_tick, index) => {
							const nodes = [];
							if (index < TICKS.length - 1) {
								for (let j = 1; j <= MINOR_TICKS_PER_GAP; j++) {
									const left =
										(index + j / (MINOR_TICKS_PER_GAP + 1)) * SEGMENT_WIDTH;
									nodes.push(
										<span
											key={`minor-${index}-${j}`}
											aria-hidden
											style={{ left: `${left}%` }}
											className="-translate-x-1/2 absolute top-0.5"
										>
											<span className="block h-1 w-px bg-stroke-soft-200/70 dark:bg-white/10" />
										</span>,
									);
								}
							}
							return nodes;
						})}
						{TICKS.map((tick, index) => {
							const active = index === activeTick;
							const left = index * SEGMENT_WIDTH;
							return (
								<button
									key={tick.label}
									type="button"
									onClick={() => setVolume(tick.value)}
									aria-label={`Set volume to ${tick.label}`}
									style={{ left: `${left}%` }}
									className={cn(
										"absolute top-0 flex flex-col gap-1 px-0.5",
										index === 0 && "items-start",
										index === TICKS.length - 1 && "-translate-x-full items-end",
										index > 0 &&
											index < TICKS.length - 1 &&
											"-translate-x-1/2 items-center",
									)}
								>
									<span
										aria-hidden
										className={cn(
											"h-1.5 w-px",
											active
												? "bg-primary-base"
												: "bg-stroke-soft-200 dark:bg-white/15",
										)}
									/>
									<span
										className={cn(
											"text-[12px] tabular-nums",
											active
												? "font-semibold text-primary-base"
												: "text-text-sub-600/70 dark:text-white/40",
										)}
									>
										{tick.label}
									</span>
									<span
										className={cn(
											"hidden text-[11px] sm:block",
											active
												? "font-medium text-text-strong-950 dark:text-white"
												: "text-text-sub-600/60 dark:text-white/35",
										)}
									>
										{tick.plan}
									</span>
								</button>
							);
						})}
					</div>
				</div>

				<p className="mt-7 text-center font-medium text-[15px] text-primary-base tabular-nums dark:text-[#4ea1ff]">
					{plan === "Custom" ? (
						<>
							Custom:{" "}
							<Link href="/contact" className="underline underline-offset-4">
								contact sales
							</Link>
						</>
					) : overage > 0 ? (
						<>
							{plan} + {formatPrice(overage)} in extra emails ={" "}
							{formatPrice(cost)}/month
						</>
					) : (
						<>
							{plan}: {formatPrice(cost)}/month
						</>
					)}
				</p>
			</div>
		</section>
	);
}
