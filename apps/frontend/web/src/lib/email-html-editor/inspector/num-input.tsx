"use client";

import { ScrubField } from "./scrub-field";

/* ------------------------------------------------------------------ */
/* Inline number input styled like the reference UI                     */
/* ------------------------------------------------------------------ */
export function NumInput({
	value,
	onChange,
	placeholder,
	unit,
	label = "Value",
	min,
	max,
	step,
}: {
	value: string | number | undefined;
	onChange: (v: number | "") => void;
	placeholder?: string;
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
			placeholder={placeholder}
			suffix={unit}
			min={min}
			max={max}
			step={step}
		/>
	);
}
