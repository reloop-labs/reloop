"use client";

import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import {
	Grid2X2,
	PanelBottom,
	PanelLeft,
	PanelRight,
	PanelTop,
	Square,
	SquareRoundCorner,
} from "lucide-react";
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

/* SegmentedToggle for linked/individual */
function ModeToggle({
	linked,
	onToggle,
}: {
	linked: boolean;
	onToggle: (v: boolean) => void;
}) {
	return (
		<div className="flex items-center gap-0.5 rounded-xl border border-stroke-sub-300 bg-bg-white-0 p-0.5">
			<Button.Root
				type="button"
				variant="neutral"
				mode={linked ? "lighter" : "ghost"}
				size="xxsmall"
				title="Uniform padding"
				onClick={() => onToggle(true)}
				className={`flex h-7 w-7 items-center justify-center rounded-lg outline-none ring-0 transition-all duration-150 ${
					linked
						? "bg-bg-soft-200 text-text-strong-950 shadow-xs"
						: "text-text-soft-400 hover:text-text-sub-600"
				}`}
			>
				<Square className="h-3.5 w-3.5" />
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
						? "bg-bg-soft-200 text-text-strong-950 shadow-xs"
						: "text-text-soft-400 hover:text-text-sub-600"
				}`}
			>
				<Grid2X2 className="h-3.5 w-3.5" />
			</Button.Root>
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
					placeholder="0"
					onChange={(e) => {
						const raw = e.target.value;
						onChange(raw === "" ? "" : Number.parseFloat(raw));
					}}
					className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
				/>
				<Input.InlineAffix className="text-text-strong-950!">
					px
				</Input.InlineAffix>
			</Input.Wrapper>
		</Input.Root>
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
					icon={
						variant === "sides" ? (
							<PanelTop className="h-3.5 w-3.5" />
						) : (
							<SquareRoundCorner className="h-3.5 w-3.5" />
						)
					}
				/>
				<PillInput
					value={value.right}
					onChange={(v) => handleChange("right", v)}
					icon={
						variant === "sides" ? (
							<PanelRight className="h-3.5 w-3.5" />
						) : (
							<SquareRoundCorner className="h-3.5 w-3.5 rotate-90" />
						)
					}
				/>
				<PillInput
					value={value.bottom}
					onChange={(v) => handleChange("bottom", v)}
					icon={
						variant === "sides" ? (
							<PanelBottom className="h-3.5 w-3.5" />
						) : (
							<SquareRoundCorner className="h-3.5 w-3.5 rotate-180" />
						)
					}
				/>
				<PillInput
					value={value.left}
					onChange={(v) => handleChange("left", v)}
					icon={
						variant === "sides" ? (
							<PanelLeft className="h-3.5 w-3.5" />
						) : (
							<SquareRoundCorner className="-rotate-90 h-3.5 w-3.5" />
						)
					}
				/>
			</div>
		</div>
	);
}
