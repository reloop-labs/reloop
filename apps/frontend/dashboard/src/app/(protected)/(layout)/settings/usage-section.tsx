"use client";

import { useBillingUsage } from "@fe/dashboard/hooks/useBillingUsage";
import NumberFlow from "@number-flow/react";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";

type UsageStatus = "healthy" | "warning" | "critical";

function statusFromRatio(ratio: number): UsageStatus {
	if (ratio >= 1) return "critical";
	if (ratio >= 0.8) return "warning";
	return "healthy";
}

const STATUS_META: Record<
	UsageStatus,
	{ label: string; pill: string; bar: string }
> = {
	healthy: {
		label: "Healthy",
		pill: "bg-success-lighter text-success-base",
		bar: "bg-success-base",
	},
	warning: {
		label: "Approaching limit",
		pill: "bg-warning-lighter text-warning-base",
		bar: "bg-warning-base",
	},
	critical: {
		label: "Limit reached",
		pill: "bg-error-lighter text-error-base",
		bar: "bg-error-base",
	},
};

function daysUntil(dateStr: string): number {
	const end = new Date(dateStr).getTime();
	if (Number.isNaN(end)) return 0;
	return Math.max(0, Math.ceil((end - Date.now()) / 86_400_000));
}

function formatDate(dateStr: string): string {
	const d = new Date(dateStr);
	if (Number.isNaN(d.getTime())) return "";
	return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function LimitTile({
	icon,
	label,
	value,
	unit,
}: {
	icon: string;
	label: string;
	value: string;
	unit?: string;
}) {
	return (
		<div className="rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-3.5 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
			<div className="flex items-center gap-1.5 text-text-sub-600">
				<Icon name={icon} className="h-3.5 w-3.5 shrink-0" />
				<span className="text-paragraph-xs">{label}</span>
			</div>
			<p className="mt-1.5 font-semibold text-label-md text-text-strong-950">
				{value}
				{unit ? (
					<span className="ml-1 font-normal text-paragraph-xs text-text-sub-600">
						{unit}
					</span>
				) : null}
			</p>
		</div>
	);
}

export function UsageSection({ onUpgrade }: { onUpgrade?: () => void }) {
	const { data, isLoading } = useBillingUsage();

	if (isLoading || !data) {
		return (
			<div className="rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-5 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
				<div className="h-4 w-28 animate-pulse rounded bg-bg-weak-100 dark:bg-white/5" />
				<div className="mt-4 h-8 w-44 animate-pulse rounded bg-bg-weak-100 dark:bg-white/5" />
				<div className="mt-4 h-2.5 w-full animate-pulse rounded-full bg-bg-weak-100 dark:bg-white/5" />
				<div className="mt-6 grid grid-cols-3 gap-3">
					{["a", "b", "c"].map((k) => (
						<div
							key={k}
							className="h-16 animate-pulse rounded-xl bg-bg-weak-100 dark:bg-white/5"
						/>
					))}
				</div>
			</div>
		);
	}

	const { plan, subscription } = data;
	const total = Math.max(0, plan.monthlyCredits);
	const used = Math.max(0, subscription.creditsUsed);
	const remaining = Math.max(0, subscription.creditsRemaining);
	const ratio = total > 0 ? used / total : 0;
	const percent = Math.min(100, Math.round(ratio * 100));
	const status = statusFromRatio(ratio);
	const meta = STATUS_META[status];

	const resetDays = daysUntil(subscription.currentPeriodEnd);
	const periodRange = `${formatDate(subscription.currentPeriodStart)} – ${formatDate(
		subscription.currentPeriodEnd,
	)}`;

	return (
		<div className="rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-5 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
			{/* Hero: monthly emails meter */}
			<div className="flex items-center justify-between">
				<p className="text-paragraph-sm text-text-sub-600">Monthly emails</p>
				<span className="text-paragraph-xs text-text-sub-600">
					{periodRange} · Resets in {resetDays}d
				</span>
			</div>

			<div className="mt-1.5 flex items-end justify-between gap-3">
				<p className="flex items-baseline gap-1.5">
					<span className="font-semibold text-text-strong-950 text-title-h4 tabular-nums">
						<NumberFlow value={used} />
					</span>
					<span className="text-paragraph-sm text-text-sub-600">
						/ {total.toLocaleString()}
					</span>
				</p>
				<span
					className={cn(
						"inline-flex h-6 shrink-0 items-center rounded-full px-2.5 font-medium text-label-xs",
						meta.pill,
					)}
				>
					{meta.label}
				</span>
			</div>

			{/* Progress bar */}
			<div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-bg-weak-100 dark:bg-white/10">
				<div
					className={cn("h-full rounded-full transition-all", meta.bar)}
					style={{ width: `${Math.max(percent, ratio > 0 ? 2 : 0)}%` }}
				/>
			</div>

			<div className="mt-2 flex items-center justify-between text-paragraph-xs text-text-sub-600">
				<span>{percent}% used</span>
				<span>
					<NumberFlow value={remaining} className="tabular-nums" /> remaining
				</span>
			</div>

			{/* Contextual nudge when approaching / over the limit */}
			{status !== "healthy" && onUpgrade ? (
				<div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-bg-weak-50 p-3 dark:bg-white/[0.03]">
					<p className="text-paragraph-sm text-text-sub-600">
						{status === "critical"
							? "You've hit your monthly email limit."
							: "You're close to your monthly email limit."}
					</p>
					<Button.Root
						variant="neutral"
						mode="filled"
						size="xxsmall"
						className="shrink-0 rounded-full font-medium"
						onClick={onUpgrade}
					>
						Upgrade
					</Button.Root>
				</div>
			) : null}

			{/* Plan limits */}
			<div className="mt-6 grid grid-cols-1 gap-3 border-stroke-soft-100 border-t pt-5 sm:grid-cols-3 dark:border-stroke-soft-100/40">
				<LimitTile
					icon="zap"
					label="Send rate"
					value={plan.ratePerSecond.toLocaleString()}
					unit="/ sec"
				/>
				<LimitTile
					icon="file"
					label="Max attachment"
					value={String(plan.maxAttachmentSizeMb)}
					unit="MB"
				/>
				<LimitTile
					icon="activity"
					label="Overage buffer"
					value={plan.overageLimit.toLocaleString()}
					unit="emails"
				/>
			</div>
		</div>
	);
}
