"use client";

import { cn } from "@reloop/ui/cn";
import * as Slider from "@reloop/ui/slider";
import {
	formatPrice,
	hostedMonthlyUsdForVolume,
} from "@reloop/web/lib/pricing";
import { useState } from "react";

const MIN = 3000;
const MAX = 1000000;

const TICKS = [
	{ value: 3000, label: "3k", plan: "Free" },
	{ value: 10000, label: "10k", plan: "Individual" },
	{ value: 50000, label: "50k", plan: "Individual" },
	{ value: 100000, label: "100k", plan: "Startup" },
	{ value: 250000, label: "250k", plan: "Startup" },
	{ value: 500000, label: "500k", plan: "Startup" },
	{ value: 1000000, label: "1M", plan: "Startup" },
];

const toPosition = (volume: number) =>
	Math.round((Math.log(volume / MIN) / Math.log(MAX / MIN)) * 100);

const toVolume = (position: number) =>
	Math.max(
		MIN,
		Math.round((MIN * (MAX / MIN) ** (position / 100)) / 1000) * 1000,
	);

const formatVolume = (volume: number) =>
	new Intl.NumberFormat("en-US").format(volume);

function recommendedPlan(volume: number) {
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

	let activeTick = 0;
	let smallestGap = Number.POSITIVE_INFINITY;
	TICKS.forEach((tick, index) => {
		const gap = Math.abs(toPosition(tick.value) - position);
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
						step={1}
						value={[position]}
						onValueChange={(value) => setVolume(toVolume(value[0] ?? 0))}
						aria-label="Monthly email volume"
					>
						<Slider.Thumb aria-label="Monthly email volume" />
					</Slider.Root>

					<div className="relative mt-3 h-12">
						{TICKS.map((tick, index) => {
							const active = index === activeTick;
							const left = toPosition(tick.value);
							return (
								<button
									key={tick.label}
									type="button"
									onClick={() => setVolume(tick.value)}
									aria-label={`Set volume to ${tick.label}`}
									style={{ left: `${left}%` }}
									className={cn(
										"absolute top-0 flex flex-col items-center gap-1 px-0.5",
										index === 0 && "items-start",
										index === TICKS.length - 1 && "items-end",
										index > 0 && index < TICKS.length - 1 && "-translate-x-1/2",
										index === 0 && "translate-x-0",
										index === TICKS.length - 1 && "-translate-x-full",
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
					{plan}: {formatPrice(cost)}/month
				</p>
			</div>
		</section>
	);
}
