"use client";

import type { ReactNode } from "react";

/*
 * Pieces of the vertical activity timeline shared by the contact history
 * and the email Timeline tab: day headers, the icon node on a thin connector,
 * and the "6:19 pm · 2h ago" meta.
 */

/** Compact time: "4h ago", "2d ago" */
export function formatCompactTime(date: string | Date): string {
	const target = new Date(date).getTime();
	if (Number.isNaN(target)) return "-";

	const diffSec = Math.max(0, Math.floor((Date.now() - target) / 1000));
	if (diffSec < 45) return "just now";
	if (diffSec < 60) return `${diffSec}s ago`;

	const diffMin = Math.floor(diffSec / 60);
	if (diffMin < 60) return `${diffMin}m ago`;

	const diffHr = Math.floor(diffMin / 60);
	if (diffHr < 24) return `${diffHr}h ago`;

	const diffDay = Math.floor(diffHr / 24);
	if (diffDay < 7) return `${diffDay}d ago`;
	if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;

	const diffMonth = Math.floor(diffDay / 30);
	if (diffMonth < 12) return `${diffMonth}mo ago`;
	return `${Math.floor(diffMonth / 12)}y ago`;
}

export function dayKey(date: string | Date): string {
	const d = new Date(date);
	if (Number.isNaN(d.getTime())) return "unknown";
	return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** "FRIDAY, SEPTEMBER 11, 2026" */
export function formatDayHeader(date: string | Date): string {
	const d = new Date(date);
	if (Number.isNaN(d.getTime())) return "-";
	const now = new Date();
	const withYear = d.getFullYear() !== now.getFullYear();
	return d
		.toLocaleDateString("en-US", {
			weekday: "long",
			month: "long",
			day: "numeric",
			...(withYear ? { year: "numeric" } : {}),
		})
		.toUpperCase();
}

/** "6:19 pm" */
export function formatTimeAmPm(date: string | Date): string {
	const d = new Date(date);
	if (Number.isNaN(d.getTime())) return "-";
	return d
		.toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		})
		.toLowerCase();
}

export const timelineCardClass = "relative py-2";

export function TimelineMeta({
	createdAt,
	actor,
}: {
	createdAt: string;
	actor?: string | null;
}) {
	return (
		<div className="flex shrink-0 items-center gap-1.5 text-paragraph-xs text-text-soft-400">
			{actor && (
				<>
					<span
						className="max-w-[130px] truncate font-medium text-text-sub-600 sm:max-w-[180px]"
						title={actor}
					>
						{actor}
					</span>
					<span className="text-text-soft-400/80">·</span>
				</>
			)}
			<span className="font-medium text-text-sub-600 tabular-nums">
				{formatTimeAmPm(createdAt)}
			</span>
			<span className="text-text-soft-400/80">·</span>
			<span className="tabular-nums">{formatCompactTime(createdAt)}</span>
		</div>
	);
}

export function TimelineItemWrapper({
	isLast,
	node,
	children,
}: {
	isLast: boolean;
	node: ReactNode;
	children: ReactNode;
}) {
	return (
		<div className="relative flex items-start gap-2.5">
			{/* Connector line to next item */}
			{!isLast && (
				<div
					aria-hidden="true"
					className="-bottom-1.5 -translate-x-1/2 absolute top-[18px] left-3 w-px bg-stroke-soft-200 dark:bg-stroke-soft-100/40"
				/>
			)}

			{/* Node icon */}
			<div className="relative z-10 mt-1.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-bg-white-0 dark:bg-bg-weak-50">
				{node}
			</div>

			{/* Card content */}
			<div className="min-w-0 flex-1">{children}</div>
		</div>
	);
}
