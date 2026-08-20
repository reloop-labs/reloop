"use client";

import { ScrubField } from "./scrub-field";

export function NumberField({
	value,
	onChange,
	unit,
	label = "Value",
	min,
	max,
	step,
}: {
	value: string | number | undefined;
	onChange: (v: number | "") => void;
	unit?: string;
	label?: string;
	min?: number;
	max?: number;
	step?: number;
}) {
	return (
		<ScrubField
			label={label}
			value={value}
			onChange={onChange}
			suffix={unit}
			min={min}
			max={max}
			step={step}
		/>
	);
}
