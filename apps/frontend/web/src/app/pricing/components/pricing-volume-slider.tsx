"use client";

import { cn } from "@reloop/ui/cn";
import * as Slider from "@reloop/ui/slider";
import {
	formatPrice,
	hostedMonthlyUsdForVolume,
} from "@reloop/web/lib/pricing";
import { useState } from "react";

const STEPS = [3000, 10000, 50000, 100000, 250000, 500000, 1000000];

const TICK_LABELS = ["3k", "10k", "50k", "100k", "250k", "500k", "1M"];

const TICK_PLANS = [
	"Free",
	"Individual",
	"Individual",
	"Startup",
	"Startup",
	"Startup",
	"Startup",
];

const formatVolume = (volume: number) =>
	new Intl.NumberFormat("en-US").format(volume);

function recommendedPlan(volume: number) {
	if (volume <= 3000) return "Free";
	const individual = 10 + (Math.max(0, volume - 50000) / 1000) * 0.5;
	const startup = 20 + (Math.max(0, volume - 100000) / 1000) * 0.5;
	return individual <= startup ? "Individual" : "Startup";
}

export function PricingVolumeSlider() {
	const [step, setStep] = useState(2);
	const volume = STEPS[step] ?? 50000;
	const cost = hostedMonthlyUsdForVolume(volume);
	const plan = recommendedPlan(volume);

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
						max={STEPS.length - 1}
						step={1}
						value={[step]}
						onValueChange={(value) => setStep(value[0] ?? 2)}
						aria-label="Monthly email volume"
					>
						<Slider.Thumb aria-label="Monthly email volume" />
					</Slider.Root>

					<div className="mt-3 flex items-start justify-between">
						{STEPS.map((_, index) => {
							const active = index === step;
							return (
								<button
									key={TICK_LABELS[index]}
									type="button"
									onClick={() => setStep(index)}
									aria-label={`Set volume to ${TICK_LABELS[index]}`}
									className="flex min-w-0 flex-col items-center gap-1 px-0.5"
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
										{TICK_LABELS[index]}
									</span>
									<span
										className={cn(
											"text-[11px]",
											active
												? "font-medium text-text-strong-950 dark:text-white"
												: "text-text-sub-600/60 dark:text-white/35",
										)}
									>
										{TICK_PLANS[index]}
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
