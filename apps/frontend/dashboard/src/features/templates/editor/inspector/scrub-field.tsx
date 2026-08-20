"use client";

import { cn } from "@reloop/ui/cn";
import {
	type KeyboardEvent,
	type PointerEvent,
	type ReactNode,
	useRef,
	useState,
} from "react";

/* ─────────────────────────────────────────────────────────
 * Fine-tune field — compact inspector input.
 * Hover the label for an ↔ cursor and drag to adjust,
 * use ↑/↓ or ←/→ (⇧ for ×10), or type directly.
 * ───────────────────────────────────────────────────────── */

export const inspectorFieldClassName =
	"flex h-8 w-full min-w-0 items-center rounded-xl border border-stroke-soft-200 bg-transparent px-2.5 shadow-none transition-[box-shadow,border-color] duration-200 hover:border-stroke-soft-300 focus-within:shadow-[0_0_0_1px_var(--color-primary-base)] focus-within:border-primary-base dark:border-stroke-soft-100/40 dark:hover:border-white/20";

export const inspectorFieldActiveClassName =
	"shadow-[0_0_0_1px_var(--color-primary-base)]";

export function parseNumeric(
	value: string | number | undefined,
): number | null {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value !== "string") return null;
	const n = Number.parseFloat(value.replace(/[^\d.-]/g, ""));
	return Number.isNaN(n) ? null : n;
}

function snap(value: number, step: number) {
	if (step <= 0) return value;
	const decimals = String(step).split(".")[1]?.length ?? 0;
	const snapped = Math.round(value / step) * step;
	return Number(snapped.toFixed(decimals));
}

export function clampNumber(value: number, min: number, max: number, step = 1) {
	return Math.min(max, Math.max(min, snap(value, step)));
}

function useScrub(
	value: string | number | undefined,
	onChange: (v: number | "") => void,
	min: number,
	max: number,
	step: number,
) {
	const drag = useRef<{ x: number; v: number } | null>(null);
	const [dragging, setDragging] = useState(false);
	const numeric = parseNumeric(value);
	const clamp = (v: number) => clampNumber(v, min, max, step);

	const startDrag = (clientX: number) => {
		drag.current = { x: clientX, v: numeric ?? 0 };
		setDragging(true);
	};

	const moveDrag = (clientX: number) => {
		if (!drag.current) return;
		onChange(clamp(drag.current.v + ((clientX - drag.current.x) / 2) * step));
	};

	const endDrag = () => {
		drag.current = null;
		setDragging(false);
	};

	const nudge = (direction: 1 | -1, multiply: boolean) => {
		onChange(clamp((numeric ?? 0) + step * (multiply ? 10 : 1) * direction));
	};

	const handleProps = {
		onPointerDown: (e: PointerEvent<HTMLElement>) => {
			e.preventDefault();
			(e.target as HTMLElement).setPointerCapture(e.pointerId);
			startDrag(e.clientX);
		},
		onPointerMove: (e: PointerEvent<HTMLElement>) => {
			moveDrag(e.clientX);
		},
		onPointerUp: endDrag,
		onPointerCancel: endDrag,
		onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
			if (e.key === "ArrowUp" || e.key === "ArrowRight") {
				e.preventDefault();
				nudge(1, e.shiftKey);
			} else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
				e.preventDefault();
				nudge(-1, e.shiftKey);
			}
		},
	};

	return { numeric, clamp, dragging, nudge, handleProps };
}

type ScrubFieldProps = {
	label: string;
	value: string | number | undefined;
	onChange: (v: number | "") => void;
	min?: number;
	max?: number;
	step?: number;
	suffix?: string;
	prefix?: ReactNode;
	placeholder?: string;
	active?: boolean;
	className?: string;
};

export function ScrubField({
	label,
	value,
	onChange,
	min = 0,
	max = 999,
	step = 1,
	suffix = "",
	prefix,
	placeholder = "0",
	active,
	className,
}: ScrubFieldProps) {
	const { numeric, clamp, dragging, nudge, handleProps } = useScrub(
		value,
		onChange,
		min,
		max,
		step,
	);
	const [draft, setDraft] = useState<string | null>(null);
	const display = draft ?? (numeric !== null ? String(numeric) : "");

	return (
		<div
			className={cn(
				inspectorFieldClassName,
				(active || dragging) && inspectorFieldActiveClassName,
				className,
			)}
		>
			{prefix && (
				<span
					role="slider"
					aria-label={label}
					aria-valuenow={numeric ?? undefined}
					aria-valuemin={min}
					aria-valuemax={max}
					tabIndex={0}
					{...handleProps}
					className="shrink-0 cursor-ew-resize touch-none select-none text-text-sub-600 hover:text-text-strong-950 focus-visible:text-primary-base focus-visible:outline-none"
				>
					{prefix}
				</span>
			)}
			<input
				inputMode="decimal"
				value={display}
				placeholder={placeholder}
				aria-label={`${label} value`}
				onFocus={() => {
					setDraft(numeric !== null ? String(numeric) : "");
				}}
				onChange={(e) => {
					const raw = e.target.value.replace(/[^\d.-]/g, "");
					setDraft(raw);
					if (raw === "" || raw === "-" || raw === "." || raw === "-.") {
						return;
					}
					const n = Number(raw);
					if (!Number.isNaN(n)) onChange(n);
				}}
				onBlur={() => {
					setDraft(null);
					if (numeric === null) return;
					onChange(clamp(numeric));
				}}
				onKeyDown={(e) => {
					if (e.key === "ArrowUp" || e.key === "ArrowRight") {
						e.preventDefault();
						setDraft(null);
						nudge(1, e.shiftKey);
					} else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
						e.preventDefault();
						setDraft(null);
						nudge(-1, e.shiftKey);
					}
				}}
				className="min-w-0 flex-1 bg-transparent text-sm text-text-strong-950 tabular-nums outline-none placeholder:text-text-soft-400"
			/>
			{suffix && (
				<span
					role="slider"
					aria-label={label}
					aria-valuenow={numeric ?? undefined}
					aria-valuemin={min}
					aria-valuemax={max}
					tabIndex={0}
					{...handleProps}
					className="shrink-0 cursor-ew-resize touch-none select-none pr-0.5 text-[11.5px] text-text-sub-600 hover:text-text-strong-950 focus-visible:text-primary-base focus-visible:outline-none"
				>
					{suffix}
				</span>
			)}
		</div>
	);
}

export function ScrubHandle({
	label,
	value,
	onChange,
	min = 0,
	max = 999,
	step = 1,
	className,
	children,
}: {
	label: string;
	value: string | number | undefined;
	onChange: (v: number | "") => void;
	min?: number;
	max?: number;
	step?: number;
	className?: string;
	children?: ReactNode;
}) {
	const { numeric, handleProps } = useScrub(value, onChange, min, max, step);

	return (
		<span
			role="slider"
			aria-label={label}
			aria-valuenow={numeric ?? undefined}
			aria-valuemin={min}
			aria-valuemax={max}
			tabIndex={0}
			{...handleProps}
			className={cn(
				"cursor-ew-resize touch-none select-none focus-visible:text-primary-base focus-visible:outline-none",
				className,
			)}
		>
			{children ?? label}
		</span>
	);
}

export function ScrubRow({
	label,
	value,
	onChange,
	min = 0,
	max = 999,
	step = 1,
	suffix = "",
	placeholder,
	active,
}: Omit<ScrubFieldProps, "className">) {
	return (
		<div className="flex items-center gap-3 px-4 py-1">
			<ScrubHandle
				label={label}
				value={value}
				onChange={onChange}
				min={min}
				max={max}
				step={step}
				className="w-1/2 shrink-0 text-sm text-text-strong-950 hover:text-text-sub-600"
			/>
			<div className="flex w-1/2 min-w-0 items-center justify-end">
				<ScrubField
					label={label}
					value={value}
					onChange={onChange}
					min={min}
					max={max}
					step={step}
					suffix={suffix}
					placeholder={placeholder}
					active={active}
				/>
			</div>
		</div>
	);
}
