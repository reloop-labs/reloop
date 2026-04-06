"use client";

import { cn } from "@reloop/ui/cn";

interface LevelStats {
	debug: number;
	info: number;
	warn: number;
	error: number;
	fatal: number;
}

interface LogStatsBarProps {
	stats: LevelStats | undefined;
	total: number;
	activeLevel: string | null;
	onLevelClick: (level: string | null) => void;
}

const STAT_ITEMS = [
	{
		key: "error" as const,
		label: "errors",
		dotColor: "bg-error-base",
		textColor: "text-error-base",
		activeColor: "bg-error-alpha-10 ring-1 ring-error-base/20",
	},
	{
		key: "warn" as const,
		label: "warnings",
		dotColor: "bg-warning-base",
		textColor: "text-warning-base",
		activeColor: "bg-warning-alpha-10 ring-1 ring-warning-base/20",
	},
	{
		key: "info" as const,
		label: "info",
		dotColor: "bg-primary-base",
		textColor: "text-primary-base",
		activeColor: "bg-primary-alpha-10 ring-1 ring-primary-base/20",
	},
	{
		key: "debug" as const,
		label: "debug",
		dotColor: "bg-text-sub-600",
		textColor: "text-text-sub-600",
		activeColor: "bg-neutral-alpha-10 ring-1 ring-stroke-soft-200",
	},
	{
		key: "fatal" as const,
		label: "fatal",
		dotColor: "bg-error-base",
		textColor: "text-error-base",
		activeColor: "bg-error-alpha-10 ring-1 ring-error-base/20",
	},
];

export const LogStatsBar = ({
	stats,
	total,
	activeLevel,
	onLevelClick,
}: LogStatsBarProps) => {
	if (!stats) return null;

	// Only show stats that have values > 0, always keeping error/warn visible
	const visibleStats = STAT_ITEMS.filter(
		(item) =>
			stats[item.key] > 0 || item.key === "error" || item.key === "warn",
	);

	return (
		<div className="flex items-center gap-1.5 overflow-x-auto">
			{visibleStats.map((item) => {
				const count = stats[item.key];
				const isActive = activeLevel === item.key;

				return (
					<button
						key={item.key}
						type="button"
						onClick={() => onLevelClick(isActive ? null : item.key)}
						className={cn(
							"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium text-xs transition-all duration-150",
							isActive
								? item.activeColor
								: "text-text-sub-600 hover:bg-bg-weak-50",
							isActive && item.textColor,
						)}
					>
						<span
							className={cn(
								"inline-flex h-1.5 w-1.5 rounded-full",
								item.dotColor,
							)}
						/>
						<span className={cn("tabular-nums", isActive && item.textColor)}>
							{count.toLocaleString()}
						</span>
						<span
							className={cn(isActive ? item.textColor : "text-text-soft-400")}
						>
							{item.label}
						</span>
					</button>
				);
			})}

			<span className="ml-1 text-text-disabled-300">·</span>
			<span className="text-text-soft-400 text-xs tabular-nums">
				{total.toLocaleString()} total
			</span>
		</div>
	);
};
