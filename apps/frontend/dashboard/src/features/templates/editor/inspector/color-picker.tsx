"use client";

import { inspectorFieldClassName } from "./scrub-field";

/* ------------------------------------------------------------------ */
/* Color picker — circular swatch trigger + hex input                  */
/* ------------------------------------------------------------------ */
export function ColorPicker({
	value,
	onChange,
}: {
	value: string;
	onChange: (v: string) => void;
}) {
	return (
		<div className={`${inspectorFieldClassName} gap-2`}>
			<div className="relative size-4 shrink-0 overflow-hidden rounded-full border border-stroke-soft-200 transition-transform duration-150 hover:scale-110">
				<input
					type="color"
					value={value || "#000000"}
					onChange={(e) => onChange(e.target.value)}
					aria-label="Pick color"
					className="absolute -inset-1 h-[200%] w-[200%] cursor-pointer border-none bg-transparent p-0"
				/>
			</div>
			<input
				value={value}
				placeholder="#000000"
				aria-label="Hex color"
				onChange={(e) => onChange(e.target.value)}
				className="min-w-0 flex-1 bg-transparent text-sm text-text-strong-950 tabular-nums outline-none placeholder:text-text-soft-400"
			/>
		</div>
	);
}
