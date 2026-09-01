"use client";

import * as Button from "@reloop/ui/button";
import {
	ArrowDown,
	ArrowLeft,
	ArrowRight,
	ArrowUp,
	Scan,
	Square,
} from "lucide-react";
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
		<div className="flex h-8 items-center gap-0.5 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-0.5 dark:border-stroke-soft-100/40 dark:bg-black">
			<Button.Root
				type="button"
				variant="neutral"
				mode={linked ? "lighter" : "ghost"}
				size="xxsmall"
				title="Uniform"
				onClick={() => onToggle(true)}
				className={`flex h-7 w-7 items-center justify-center rounded-lg outline-none ring-0 transition-all duration-150 ${
					linked
						? "bg-bg-soft-200 text-text-strong-950 shadow-regular-xs dark:bg-bg-soft-200"
						: "text-text-soft-400 hover:text-text-sub-600"
				}`}
			>
				<Square className="h-3.5 w-3.5 stroke-[1.75]" />
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
						? "bg-bg-soft-200 text-text-strong-950 shadow-regular-xs dark:bg-bg-soft-200"
						: "text-text-soft-400 hover:text-text-sub-600"
				}`}
			>
				<Scan className="h-3.5 w-3.5 stroke-[1.75]" />
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
		<div className="w-[70px]">
			<ScrubField
				label={label}
				value={value}
				onChange={onChange}
				min={0}
				max={200}
				suffix="px"
				prefix={icon}
			/>
		</div>
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
			<div className="flex h-10 items-center justify-between gap-3 px-4">
				<ScrubHandle
					label={label}
					value={value.top}
					onChange={(v) => handleChange("top", v)}
					min={0}
					max={200}
					className="min-w-0 flex-1 truncate font-normal text-sm text-text-sub-600 hover:text-text-strong-950 dark:text-text-soft-400"
				/>
				<div className="flex shrink-0 items-center justify-end gap-1.5">
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
		<div className="flex flex-col px-4">
			{/* Header row with exact same h-10 height as linked row to eliminate shift */}
			<div className="flex h-10 items-center justify-between">
				<span className="font-normal text-sm text-text-sub-600 dark:text-text-soft-400">
					{label}
				</span>
				<ModeToggle linked={linked} onToggle={setLinked} />
			</div>

			{/* 2×2 grid */}
			<div className="grid grid-cols-2 gap-2 pb-2">
				<div className="w-full">
					<ScrubField
						label={`${label} top`}
						value={value.top}
						onChange={(v) => handleChange("top", v)}
						suffix="px"
						prefix={
							variant === "sides" ? (
								<ArrowUp className="size-3.5 shrink-0 stroke-[1.75] text-text-soft-400" />
							) : (
								<Square className="size-3.5 shrink-0 stroke-[1.75] text-text-soft-400" />
							)
						}
					/>
				</div>
				<div className="w-full">
					<ScrubField
						label={`${label} right`}
						value={value.right}
						onChange={(v) => handleChange("right", v)}
						suffix="px"
						prefix={
							variant === "sides" ? (
								<ArrowRight className="size-3.5 shrink-0 stroke-[1.75] text-text-soft-400" />
							) : (
								<Square className="size-3.5 shrink-0 stroke-[1.75] text-text-soft-400" />
							)
						}
					/>
				</div>
				<div className="w-full">
					<ScrubField
						label={`${label} bottom`}
						value={value.bottom}
						onChange={(v) => handleChange("bottom", v)}
						suffix="px"
						prefix={
							variant === "sides" ? (
								<ArrowDown className="size-3.5 shrink-0 stroke-[1.75] text-text-soft-400" />
							) : (
								<Square className="size-3.5 shrink-0 stroke-[1.75] text-text-soft-400" />
							)
						}
					/>
				</div>
				<div className="w-full">
					<ScrubField
						label={`${label} left`}
						value={value.left}
						onChange={(v) => handleChange("left", v)}
						suffix="px"
						prefix={
							variant === "sides" ? (
								<ArrowLeft className="size-3.5 shrink-0 stroke-[1.75] text-text-soft-400" />
							) : (
								<Square className="size-3.5 shrink-0 stroke-[1.75] text-text-soft-400" />
							)
						}
					/>
				</div>
			</div>
		</div>
	);
}

