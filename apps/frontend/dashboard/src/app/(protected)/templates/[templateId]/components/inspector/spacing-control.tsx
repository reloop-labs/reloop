"use client";

import * as Input from "@reloop/ui/input";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/* Spacing control — single-row when linked, 2×2 grid when individual  */
/* ------------------------------------------------------------------ */
export interface SpacingValue {
	top: number | "";
	right: number | "";
	bottom: number | "";
	left: number | "";
}

/* Icon: horizontal stripes (top / bottom) */
function IconTopBottom() {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 14 14"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect
				x="1"
				y="1"
				width="12"
				height="2.5"
				rx="1"
				fill="currentColor"
				opacity="0.45"
			/>
			<rect
				x="1"
				y="10.5"
				width="12"
				height="2.5"
				rx="1"
				fill="currentColor"
				opacity="0.45"
			/>
			<rect x="3" y="5.25" width="8" height="3.5" rx="1" fill="currentColor" />
		</svg>
	);
}

/* Icon: vertical stripes (left / right) */
function IconLeftRight() {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 14 14"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect
				x="1"
				y="1"
				width="2.5"
				height="12"
				rx="1"
				fill="currentColor"
				opacity="0.45"
			/>
			<rect
				x="10.5"
				y="1"
				width="2.5"
				height="12"
				rx="1"
				fill="currentColor"
				opacity="0.45"
			/>
			<rect x="5.25" y="3" width="3.5" height="8" rx="1" fill="currentColor" />
		</svg>
	);
}

/* Icon: uniform solid box */
function IconUniform() {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 14 14"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect
				x="1.75"
				y="1.75"
				width="10.5"
				height="10.5"
				rx="2"
				stroke="currentColor"
				strokeWidth="1.5"
				fill="none"
			/>
		</svg>
	);
}

/* Icon: individual dashed box */
function IconIndividual() {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 14 14"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect
				x="1.75"
				y="1.75"
				width="10.5"
				height="10.5"
				rx="2"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeDasharray="3 2.2"
				fill="none"
			/>
		</svg>
	);
}

/* SegmentedToggle for linked/individual */
function ModeToggle({
	linked,
	onToggle,
}: {
	linked: boolean;
	onToggle: (v: boolean) => void;
}) {
	return (
		<div className="flex items-center gap-0.5 rounded-lg bg-bg-weak-50 p-0.5">
			<button
				type="button"
				title="Uniform padding"
				onClick={() => onToggle(true)}
				className={`flex h-7 w-7 items-center justify-center rounded-md transition-all duration-150 ${
					linked
						? "bg-bg-white-0 text-text-strong-950 shadow-xs"
						: "text-text-soft-400 hover:text-text-sub-600"
				}`}
			>
				<IconUniform />
			</button>
			<button
				type="button"
				title="Individual sides"
				onClick={() => onToggle(false)}
				className={`flex h-7 w-7 items-center justify-center rounded-md transition-all duration-150 ${
					!linked
						? "bg-bg-white-0 text-text-strong-950 shadow-xs"
						: "text-text-soft-400 hover:text-text-sub-600"
				}`}
			>
				<IconIndividual />
			</button>
		</div>
	);
}

/* Single pill input */
function PillInput({
	value,
	onChange,
	icon,
}: {
	value: number | "";
	onChange: (v: number | "") => void;
	icon?: React.ReactNode;
}) {
	return (
		<Input.Root
			size="xsmall"
			className="flex-1 rounded-xl border border-stroke-sub-300 shadow-none before:hidden"
		>
			<Input.Wrapper>
				{icon && <span className="shrink-0 text-text-sub-600">{icon}</span>}
				<Input.Input
					type="number"
					value={value}
					onChange={(e) => {
						const raw = e.target.value;
						onChange(raw === "" ? "" : Number.parseFloat(raw));
					}}
					className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
				/>
				<Input.InlineAffix className="text-text-soft-400">px</Input.InlineAffix>
			</Input.Wrapper>
		</Input.Root>
	);
}

export function SpacingControl({
	label = "Padding",
	value,
	onChange,
}: {
	label?: string;
	value: SpacingValue;
	onChange: (v: SpacingValue) => void;
	unit?: string;
}) {
	const [linked, setLinked] = useState(() => {
		return (
			value.top === value.right &&
			value.top === value.bottom &&
			value.top === value.left
		);
	});

	const handleChange = (side: keyof SpacingValue, raw: number | "") => {
		if (linked) {
			onChange({ top: raw, right: raw, bottom: raw, left: raw });
		} else {
			onChange({ ...value, [side]: raw });
		}
	};

	/* ── Linked: single row ── */
	if (linked) {
		return (
			<div className="flex min-h-9 items-center gap-3 px-4 py-1.5">
				<span className="w-1/3 min-w-0 shrink-0 text-sm">{label}</span>
				<div className="flex w-2/3 min-w-0 items-center justify-end gap-2">
					<PillInput
						value={value.top}
						onChange={(v) => handleChange("top", v)}
					/>
					<ModeToggle linked={linked} onToggle={setLinked} />
				</div>
			</div>
		);
	}

	/* ── Individual: header row + 2×2 grid ── */
	return (
		<div className="flex flex-col gap-2 px-4 py-2">
			{/* Header row */}
			<div className="flex items-center justify-between">
				<span className="text-sm">{label}</span>
				<ModeToggle linked={linked} onToggle={setLinked} />
			</div>

			{/* 2×2 grid */}
			<div className="grid grid-cols-2 gap-2">
				<PillInput
					value={value.top}
					onChange={(v) => handleChange("top", v)}
					icon={<IconTopBottom />}
				/>
				<PillInput
					value={value.right}
					onChange={(v) => handleChange("right", v)}
					icon={<IconLeftRight />}
				/>
				<PillInput
					value={value.bottom}
					onChange={(v) => handleChange("bottom", v)}
					icon={<IconTopBottom />}
				/>
				<PillInput
					value={value.left}
					onChange={(v) => handleChange("left", v)}
					icon={<IconLeftRight />}
				/>
			</div>
		</div>
	);
}
