"use client";

import { useEffect, useState } from "react";
import type { DelayNodeData, DelayUnit } from "../workflow-types";

interface DelayConfigFormProps {
	value: DelayNodeData;
	onChange: (data: DelayNodeData) => void;
	/** Prefix for label/input ids so multiple nodes can share the canvas. */
	idPrefix?: string;
}

const MINUTE_ALIASES = ["m", "min", "mins", "minute", "minutes"];
const HOUR_ALIASES = ["h", "hr", "hrs", "hour", "hours"];
const DAY_ALIASES = ["d", "day", "days"];
const SECOND_ALIASES = ["s", "sec", "secs", "second", "seconds"];

const DURATION_RE =
	/(\d+(?:\.\d+)?)\s*(days?|hours?|hrs?|minutes?|mins?|seconds?|secs?|[dhms])/gi;

const unitOf = (
	raw: string,
): "days" | "hours" | "minutes" | "seconds" | null => {
	const u = raw.toLowerCase();
	if ((DAY_ALIASES as string[]).includes(u)) return "days";
	if ((HOUR_ALIASES as string[]).includes(u)) return "hours";
	if ((MINUTE_ALIASES as string[]).includes(u)) return "minutes";
	if ((SECOND_ALIASES as string[]).includes(u)) return "seconds";
	return null;
};

/**
 * Parse natural-language durations like "10 minutes", "2h", "1h 30m", "1d".
 * Returns the normalized amount+unit pair, or null when invalid.
 */
export const parseDelayInput = (
	text: string,
): { amount: number; unit: DelayUnit } | null => {
	const trimmed = text.trim().toLowerCase();
	if (!trimmed) return null;

	const matches = [...trimmed.matchAll(DURATION_RE)];
	if (matches.length === 0) return null;

	// Anything left over besides whitespace/separators means garbage input.
	const leftover = trimmed
		.replace(DURATION_RE, " ")
		.replace(/and|\+|,/g, " ")
		.trim();
	if (/[a-z0-9]/.test(leftover)) return null;

	let totalMinutes = 0;
	for (const m of matches) {
		const num = Number(m[1]);
		const unit = unitOf(m[2] ?? "");
		if (!Number.isFinite(num) || num < 0 || !unit) return null;
		if (unit === "days") totalMinutes += num * 1440;
		else if (unit === "hours") totalMinutes += num * 60;
		else if (unit === "minutes") totalMinutes += num;
		else totalMinutes += num / 60;
	}
	if (!Number.isFinite(totalMinutes)) return null;

	const rounded = Math.round(totalMinutes * 100) / 100;
	if (rounded % 1440 === 0) return { amount: rounded / 1440, unit: "days" };
	if (rounded % 60 === 0) return { amount: rounded / 60, unit: "hours" };
	return { amount: rounded, unit: "minutes" };
};

const pluralize = (n: number, singular: string) =>
	`${n} ${singular}${n === 1 ? "" : "s"}`;

const totalMinutesOf = (
	amount: number,
	unit: DelayUnit | undefined,
): number => {
	if (unit === "days") return amount * 1440;
	if (unit === "hours") return amount * 60;
	return amount;
};

/**
 * Canonical display text for a persisted amount+unit pair, always in the
 * shortest memorable form: single-unit values use words ("2 hours"),
 * combos decompose ("1h 30m", "15h 48m 58s").
 */
export const formatDelayAmount = (
	amount: number,
	unit: DelayUnit | undefined,
): string => {
	if (!Number.isFinite(amount) || amount < 0) return "";
	const total = Math.round(totalMinutesOf(amount, unit) * 100) / 100;
	if (total === 0) return "0 minutes";

	let rem = total;
	const days = Math.floor(rem / 1440);
	rem = Math.round((rem - days * 1440) * 100) / 100;
	let hours = Math.floor(rem / 60);
	rem = Math.round((rem - hours * 60) * 100) / 100;
	let mins = Math.floor(rem);
	let secs = Math.round((rem - mins) * 60);
	if (secs === 60) {
		secs = 0;
		mins += 1;
	}
	if (mins === 60) {
		mins = 0;
		hours += 1;
	}
	let d = days;
	let h = hours;
	if (h >= 24) {
		d += Math.floor(h / 24);
		h = h % 24;
	}

	const parts: string[] = [];
	if (d) parts.push(`${d}d`);
	if (h) parts.push(`${h}h`);
	if (mins) parts.push(`${mins}m`);
	if (secs) parts.push(`${secs}s`);
	if (parts.length === 0) return "0 minutes";
	if (parts.length === 1) {
		if (d) return pluralize(d, "day");
		if (h) return pluralize(h, "hour");
		if (mins) return pluralize(mins, "minute");
		return pluralize(secs, "second");
	}
	return parts.join(" ");
};

export const DelayConfigForm = ({
	value,
	onChange,
	idPrefix = "",
}: DelayConfigFormProps) => {
	const inputId = `${idPrefix}delay-duration`;
	const [text, setText] = useState(() =>
		formatDelayAmount(value.amount, value.unit),
	);
	const [focused, setFocused] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (focused) return;
		setText(formatDelayAmount(value.amount, value.unit));
		setError(null);
	}, [value.amount, value.unit, focused]);

	const handleChange = (raw: string) => {
		setText(raw);
		const parsed = parseDelayInput(raw);
		if (!parsed) {
			setError("Use e.g. 10 minutes, 2h, 1h 30m");
			return;
		}
		setError(null);
		if (parsed.amount !== value.amount || parsed.unit !== value.unit) {
			onChange({ ...value, ...parsed });
		}
	};

	const handleBlur = () => {
		setFocused(false);
		if (!text.trim()) {
			setError("Enter a wait time");
			return;
		}
		const parsed = parseDelayInput(text);
		if (parsed) {
			setError(null);
			setText(formatDelayAmount(parsed.amount, parsed.unit));
			if (parsed.amount !== value.amount || parsed.unit !== value.unit) {
				onChange({ ...value, ...parsed });
			}
		} else {
			setError("Use e.g. 10 minutes, 2h, 1h 30m");
		}
	};

	const summary = formatDelayAmount(value.amount, value.unit);

	return (
		<div className="flex flex-col gap-1.5">
			<label htmlFor={inputId} className="sr-only">
				Wait duration
			</label>
			<input
				id={inputId}
				type="text"
				placeholder="e.g. 10 minutes, 2h, 1h 30m"
				value={text}
				onFocus={() => setFocused(true)}
				onChange={(e) => handleChange(e.target.value)}
				onBlur={handleBlur}
				onKeyDown={(e) => e.stopPropagation()}
				aria-label="Wait duration"
				aria-invalid={error ? true : undefined}
				className="w-full rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-3 py-2 text-sm text-text-strong-950 outline-none placeholder:text-text-soft-400 focus:border-blue-500"
			/>
			{error ? (
				<p className="px-1 text-text-sub-600 text-xs">{error}</p>
			) : summary ? (
				<p className="px-1 text-text-sub-600 text-xs">
					Waits {summary} before the next step runs.
				</p>
			) : null}
		</div>
	);
};
