import { cn } from "@reloop/ui/cn";
import * as Slider from "@reloop/ui/slider";

// Thumb is 16px: radix insets it 8px at each end, so ticks follow it.
const THUMB_HALF = 8;

function tickLeft(index: number, lastIndex: number): string {
	const percent = lastIndex > 0 ? (index / lastIndex) * 100 : 0;
	const offset = THUMB_HALF - (percent * THUMB_HALF * 2) / 100;
	return `calc(${percent}% + ${offset}px)`;
}

function shortLabel(value: number): string {
	return value >= 1000 ? `${value / 1000}k` : String(value);
}

/**
 * A slider that snaps to fixed values, with a clickable tick under each one.
 * `labelled` picks which ticks show their value (all by default).
 */
export function StepSlider({
	steps,
	value,
	onChange,
	ariaLabel,
	labelled,
}: {
	steps: readonly number[];
	value: number;
	onChange: (value: number) => void;
	ariaLabel: string;
	labelled?: (value: number) => boolean;
}) {
	const lastIndex = steps.length - 1;
	const found = steps.indexOf(value);
	const index = found < 0 ? 0 : found;

	return (
		<div>
			<Slider.Root
				min={0}
				max={lastIndex}
				step={1}
				value={[index]}
				onValueChange={(next) => {
					const picked = steps[next[0] ?? 0];
					if (picked != null) onChange(picked);
				}}
				aria-label={ariaLabel}
			>
				<Slider.Thumb aria-label={ariaLabel} />
			</Slider.Root>

			<div className="relative mt-1.5 h-[26px]">
				{steps.map((step, i) => {
					const active = i === index;
					return (
						<button
							key={step}
							type="button"
							tabIndex={-1}
							aria-label={step.toLocaleString("en-US")}
							onClick={() => onChange(step)}
							style={{ left: tickLeft(i, lastIndex) }}
							className={cn(
								"absolute top-0 flex flex-col gap-1 px-0.5",
								i === 0
									? "items-start"
									: i === lastIndex
										? "-translate-x-full items-end"
										: "-translate-x-1/2 items-center",
							)}
						>
							<span
								aria-hidden
								className={cn(
									"h-1.5 w-px",
									active
										? "bg-text-strong-950"
										: "bg-stroke-soft-200 dark:bg-white/15",
								)}
							/>
							{(labelled?.(step) ?? true) ? (
								<span
									className={cn(
										"text-[12px] tabular-nums",
										active
											? "font-semibold text-text-strong-950"
											: "text-text-soft-400",
									)}
								>
									{shortLabel(step)}
								</span>
							) : null}
						</button>
					);
				})}
			</div>
		</div>
	);
}
