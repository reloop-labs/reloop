"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { useState } from "react";
import { ScrubField, ScrubHandle } from "./scrub-field";

/* ------------------------------------------------------------------ */
/* Spacing control — single-row when linked, 2×2 grid when individual  */
/* ------------------------------------------------------------------ */
export interface SpacingValue {
	top: number | "";
	right: number | "";
	bottom: number | "";
	left: number | "";
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
		<div className="flex items-center gap-0.5 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-0.5">
			<Button.Root
				type="button"
				variant="neutral"
				mode={linked ? "lighter" : "ghost"}
				size="xxsmall"
				title="Uniform padding"
				onClick={() => onToggle(true)}
				className={`flex h-7 w-7 items-center justify-center rounded-lg outline-none ring-0 transition-all duration-150 ${
					linked
						? "bg-bg-soft-200 text-text-strong-950 shadow-regular-xs"
						: "text-text-soft-400 hover:text-text-sub-600"
				}`}
			>
				<Icon name="box" className="h-3.5 w-3.5" />
			</Button.Root>
			<Button.Root
				type="button"
				variant="neutral"
				mode={!linked ? "lighter" : "ghost"}
				size="xxsmall"
				title="Individual sides"
				onClick={() => onToggle(false)}
				className={`flex h-7 w-7 items-center justify-center rounded-lg outline-none ring-0 transition-all duration-150 ${
					!linked
						? "bg-bg-soft-200 text-text-strong-950 shadow-regular-xs"
						: "text-text-soft-400 hover:text-text-sub-600"
				}`}
			>
				<Icon name="grid" className="h-3.5 w-3.5" />
			</Button.Root>
		</div>
	);
}

/* Single pill input */
function PillInput({
	value,
	onChange,
	icon,
	label,
}: {
	value: number | "";
	onChange: (v: number | "") => void;
	icon?: React.ReactNode;
	label: string;
}) {
	return (
		<ScrubField
			label={label}
			value={value}
			onChange={onChange}
			min={0}
			max={200}
			suffix="px"
			prefix={icon}
		/>
	);
}

export function SpacingControl({
	label = "Padding",
	value,
	onChange,
	variant = "sides",
}: {
	label?: string;
	value: SpacingValue;
	onChange: (v: SpacingValue) => void;
	unit?: string;
	variant?: "sides" | "corners";
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
				<ScrubHandle
					label={label}
					value={value.top}
					onChange={(v) => handleChange("top", v)}
					min={0}
					max={200}
					className="w-1/3 min-w-0 shrink-0 text-label-sm text-text-sub-600 hover:text-text-strong-950"
				/>
				<div className="flex w-2/3 min-w-0 items-center justify-end gap-2">
					<PillInput
						label={label}
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
				<span className="text-label-sm text-text-sub-600">{label}</span>
				<ModeToggle linked={linked} onToggle={setLinked} />
			</div>

			{/* 2×2 grid */}
			<div className="grid grid-cols-2 gap-2">
				<PillInput
					label={`${label} top`}
					value={value.top}
					onChange={(v) => handleChange("top", v)}
					icon={
						variant === "sides" ? (
							<Icon name="arrow-top" className="h-3.5 w-3.5" />
						) : (
							<Icon name="box" className="h-3.5 w-3.5" />
						)
					}
				/>
				<PillInput
					label={`${label} right`}
					value={value.right}
					onChange={(v) => handleChange("right", v)}
					icon={
						variant === "sides" ? (
							<Icon name="arrow-right" className="h-3.5 w-3.5" />
						) : (
							<Icon name="box" className="h-3.5 w-3.5" />
						)
					}
				/>
				<PillInput
					label={`${label} bottom`}
					value={value.bottom}
					onChange={(v) => handleChange("bottom", v)}
					icon={
						variant === "sides" ? (
							<Icon name="arrow-down" className="h-3.5 w-3.5" />
						) : (
							<Icon name="box" className="h-3.5 w-3.5" />
						)
					}
				/>
				<PillInput
					label={`${label} left`}
					value={value.left}
					onChange={(v) => handleChange("left", v)}
					icon={
						variant === "sides" ? (
							<Icon name="arrow-left" className="h-3.5 w-3.5" />
						) : (
							<Icon name="box" className="h-3.5 w-3.5" />
						)
					}
				/>
			</div>
		</div>
	);
}
