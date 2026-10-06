"use client";

import { cn } from "@reloop/ui/cn";
import * as Slider from "@reloop/ui/slider";
import { paidOverageUsdPerThousand } from "@reloop/web/lib/pricing";

export const CREDIT_MAX_VOLUME = 100000;

const CREDIT_TICKS = [
	{ value: 3000, label: "3k" },
	{ value: 10000, label: "10k" },
	{ value: 25000, label: "25k" },
	{ value: 50000, label: "50k" },
	{ value: 75000, label: "75k" },
	{ value: 100000, label: "100k" },
];

const CREDIT_SEGMENTS = CREDIT_TICKS.length - 1;
const SEGMENT_WIDTH = 100 / CREDIT_SEGMENTS;
const MINOR_TICKS_PER_GAP = 4;
const SNAP_THRESHOLD = 3;

const THUMB_HALF_WIDTH = 8;
const alignOffset = (percent: number) =>
	THUMB_HALF_WIDTH - percent * ((THUMB_HALF_WIDTH * 2) / 100);
const tickLeft = (percent: number) =>
	`calc(${percent}% + ${alignOffset(percent)}px)`;

const clamp = (n: number, min: number, max: number) =>
	Math.min(max, Math.max(min, n));

const toPosition = (volume: number) => {
	const first = CREDIT_TICKS[0]?.value ?? 3000;
	const last = CREDIT_TICKS[CREDIT_TICKS.length - 1]?.value ?? 100000;
	if (volume <= first) return 0;
	if (volume >= last) return 100;
	for (let i = 0; i < CREDIT_SEGMENTS; i++) {
		const low = CREDIT_TICKS[i]?.value ?? first;
		const high = CREDIT_TICKS[i + 1]?.value ?? low;
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
		return (
			CREDIT_TICKS[nearestBoundary]?.value ?? CREDIT_TICKS[0]?.value ?? 3000
		);
	}
	const index = Math.min(
		Math.floor(clamped / SEGMENT_WIDTH),
		CREDIT_SEGMENTS - 1,
	);
	const low = CREDIT_TICKS[index]?.value ?? 3000;
	const high = CREDIT_TICKS[index + 1]?.value ?? low;
	const fraction = clamped / SEGMENT_WIDTH - index;
	const raw = low + fraction * (high - low);
	const granularity = raw < 10000 ? 100 : 1000;
	return Math.round(raw / granularity) * granularity;
};

export function creditsCostForVolume(volume: number) {
	return Math.max(0, Math.ceil(volume / 1000) * paidOverageUsdPerThousand);
}

export function formatCreditsCost(volume: number) {
	const cost = creditsCostForVolume(volume);
	return cost % 1 === 0 ? `$${cost}` : `$${cost.toFixed(2)}`;
}

export function CreditsVolumeSlider({
	volume,
	onVolumeChange,
}: {
	volume: number;
	onVolumeChange: (volume: number) => void;
}) {
	const position = toPosition(volume);

	let activeTick = 0;
	let smallestGap = Number.POSITIVE_INFINITY;
	CREDIT_TICKS.forEach((_tick, index) => {
		const gap = Math.abs(index * SEGMENT_WIDTH - position);
		if (gap < smallestGap) {
			smallestGap = gap;
			activeTick = index;
		}
	});

	return (
		<section
			aria-label="Estimate your credit cost"
			className="w-full px-6 pt-8 pb-12 sm:px-8 sm:pt-10 sm:pb-14 lg:px-12"
		>
			<div className="mx-auto w-full max-w-3xl text-center">
				<div className="px-1">
					<Slider.Root
						min={0}
						max={100}
						step={0.5}
						value={[position]}
						onValueChange={(value) => onVolumeChange(toVolume(value[0] ?? 0))}
						aria-label="Email volume in credits"
					>
						<Slider.Thumb aria-label="Email volume in credits" />
					</Slider.Root>

					<div className="relative mt-1 h-16">
						{CREDIT_TICKS.flatMap((_tick, index) => {
							const nodes = [];
							if (index < CREDIT_TICKS.length - 1) {
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
						{CREDIT_TICKS.map((tick, index) => {
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
										index === CREDIT_TICKS.length - 1 &&
											"-translate-x-full items-end",
										index > 0 &&
											index < CREDIT_TICKS.length - 1 &&
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
											"hidden text-[11px] tabular-nums sm:block",
											active
												? "font-medium text-text-strong-950 dark:text-white"
												: "text-text-sub-600/60 dark:text-white/35",
										)}
									>
										{formatCreditsCost(tick.value)}
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
