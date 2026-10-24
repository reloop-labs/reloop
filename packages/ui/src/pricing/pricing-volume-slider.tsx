"use client";

import { recommendPlanIdForVolume } from "@reloop/pricing";
import { cn } from "@reloop/ui/cn";
import * as Slider from "@reloop/ui/slider";

const TICKS = [
	{ value: 3000, label: "3k", plan: "Free" },
	{ value: 10000, label: "10k", plan: "Pro" },
	{ value: 20000, label: "20k", plan: "Pro" },
	{ value: 30000, label: "30k", plan: "Pro" },
	{ value: 40000, label: "40k", plan: "Pro" },
	{ value: 50000, label: "50k", plan: "Pro" },
	{ value: 100000, label: "100k", plan: "Growth" },
	{ value: 250000, label: "250k", plan: "Growth" },
	{ value: 500000, label: "500k", plan: "Enterprise" },
];

const SEGMENTS = TICKS.length - 1;
const SEGMENT_WIDTH = 100 / SEGMENTS;
const MINOR_TICKS_PER_GAP = 4;

/**
 * Radix positions the thumb at `left: calc(percent% + offset)` and keeps it
 * in-bounds, where offset shrinks from +halfThumb at 0% to -halfThumb at 100%.
 * Our thumb is 16px wide (size-1.5 + 5px border), so ticks use the same
 * correction to sit pixel-exact under the thumb center.
 */
const THUMB_HALF_WIDTH = 8;
const alignOffset = (percent: number) =>
	THUMB_HALF_WIDTH - percent * ((THUMB_HALF_WIDTH * 2) / 100);
const tickLeft = (percent: number) =>
	`calc(${percent}% + ${alignOffset(percent)}px)`;

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
	const index = Math.min(
		SEGMENTS,
		Math.max(0, Math.round(clamp(position, 0, 100) / SEGMENT_WIDTH)),
	);
	return TICKS[index]?.value ?? TICKS[0]?.value ?? 3000;
};

export { recommendPlanIdForVolume };

export function PricingVolumeSlider({
	volume,
	onVolumeChange,
}: {
	volume: number;
	onVolumeChange: (volume: number) => void;
}) {
	const position = toPosition(volume);

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
			className="w-full px-6 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20"
		>
			<div className="mx-auto w-full max-w-3xl">
				<div className="px-1">
					<Slider.Root
						min={0}
						max={100}
						step={0.5}
						value={[position]}
						onValueChange={(value) => onVolumeChange(toVolume(value[0] ?? 0))}
						aria-label="Monthly email volume"
					>
						<Slider.Thumb aria-label="Monthly email volume" />
					</Slider.Root>

					<div className="relative mt-1 h-[30px] sm:h-[46px]">
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
											style={{ left: tickLeft(left) }}
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
									onClick={() => onVolumeChange(tick.value)}
									aria-label={`Set volume to ${tick.label}`}
									style={{ left: tickLeft(left) }}
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
			</div>
		</section>
	);
}
