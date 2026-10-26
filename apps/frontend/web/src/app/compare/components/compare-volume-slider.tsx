"use client";

import { cn } from "@reloop/ui/cn";
import * as Slider from "@reloop/ui/slider";
import type { CostPreset } from "../compare-hero-costs";

const MINOR_TICKS_PER_GAP = 4;

/**
 * Radix keeps the 16px thumb in-bounds, shifting it from +8px at 0% to -8px
 * at 100%. Ticks use the same correction so they sit under the thumb center.
 * Same approach as the /pricing volume slider.
 */
const THUMB_HALF_WIDTH = 8;
const tickLeft = (percent: number) =>
	`calc(${percent}% + ${THUMB_HALF_WIDTH - percent * ((THUMB_HALF_WIDTH * 2) / 100)}px)`;

/** Evenly spaced ticks; the slider snaps to the nearest one. */
export function CompareVolumeSlider({
	ticks,
	value,
	onValueChange,
	labelledBy,
}: {
	ticks: CostPreset[];
	value: number;
	onValueChange: (value: number) => void;
	labelledBy: string;
}) {
	const segments = Math.max(1, ticks.length - 1);
	const segmentWidth = 100 / segments;
	const activeIndex = Math.max(
		0,
		ticks.findIndex((tick) => tick.value === value),
	);

	return (
		<div className="px-1 [--primary-base:#171717] dark:[--primary-base:#ffffff]">
			<Slider.Root
				min={0}
				max={segments}
				step={1}
				value={[activeIndex]}
				onValueChange={([index]) => {
					const tick = ticks[index ?? 0];
					if (tick) onValueChange(tick.value);
				}}
			>
				<Slider.Thumb
					aria-labelledby={labelledBy}
					aria-valuetext={ticks[activeIndex]?.label}
					className="dark:bg-black"
				/>
			</Slider.Root>

			<div className="relative mt-1 h-[26px]">
				{ticks.slice(0, -1).flatMap((tick, index) =>
					Array.from({ length: MINOR_TICKS_PER_GAP }, (_, j) => (
						<span
							key={`${tick.value}-minor-${j}`}
							aria-hidden
							style={{
								left: tickLeft(
									(index + (j + 1) / (MINOR_TICKS_PER_GAP + 1)) * segmentWidth,
								),
							}}
							className="-translate-x-1/2 absolute top-0.5 block h-1 w-px bg-stroke-soft-100 dark:bg-white/10"
						/>
					)),
				)}
				{ticks.map((tick, index) => {
					const active = index === activeIndex;
					return (
						<button
							key={tick.value}
							type="button"
							onClick={() => onValueChange(tick.value)}
							aria-label={`Set to ${tick.label}`}
							style={{ left: tickLeft(index * segmentWidth) }}
							className={cn(
								"absolute top-0 flex cursor-pointer flex-col gap-1 px-0.5",
								index === 0 && "items-start",
								index === ticks.length - 1 && "-translate-x-full items-end",
								index > 0 &&
									index < ticks.length - 1 &&
									"-translate-x-1/2 items-center",
							)}
						>
							<span
								aria-hidden
								className={cn(
									"h-1.5 w-px",
									active
										? "bg-text-strong-950 dark:bg-white"
										: "bg-stroke-soft-200 dark:bg-white/15",
								)}
							/>
							<span
								className={cn(
									"text-[12px] tabular-nums transition-colors",
									active
										? "font-semibold text-text-strong-950 dark:text-white"
										: "text-text-sub-600/70 hover:text-text-strong-950 dark:text-white/40 dark:hover:text-white",
								)}
							>
								{tick.label}
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
