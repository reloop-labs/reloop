"use client";

import { useBillingUsage } from "@fe/dashboard/hooks/useBillingUsage";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
	return n.toLocaleString("en-US");
}

function formatPeriod(start: string, end: string): string {
	const fmt = (d: string) =>
		new Date(d).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	return `${fmt(start)} – ${fmt(end)}`;
}

function daysUntil(isoDate: string): number {
	const end = new Date(isoDate).getTime();
	const now = Date.now();
	return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = ({ className }: { className?: string }) => (
	<div className={`animate-pulse rounded bg-bg-soft-200 ${className ?? ""}`} />
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const UsagePage = () => {
	const { data, isLoading, error, refetch } = useBillingUsage();

	const usagePercent =
		data && data.plan?.monthlyCredits > 0
			? (data.subscription.creditsUsed / data.plan.monthlyCredits) * 100
			: 0;

	const isNearLimit = usagePercent >= 80;
	const isOverLimit = usagePercent >= 100;
	const statusLabel = isOverLimit
		? "Limit reached"
		: isNearLimit
			? "High usage"
			: "On track";
	const statusColor = isOverLimit
		? "border-error-light bg-error-lighter text-error-base"
		: isNearLimit
			? "border-warning-light bg-warning-lighter text-warning-base"
			: "border-success-light bg-success-lighter text-success-base";

	if (isLoading) {
		return (
			<div className="w-full space-y-5 pt-5">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-16 w-full rounded-xl" />
				<Skeleton className="h-48 w-full rounded-2xl" />
			</div>
		);
	}

	return (
		<div className="w-full space-y-5 pt-5">
			{/* Header */}
			<div className="flex items-start justify-between">
				<div>
					<h1 className="font-semibold text-text-strong-950 text-title-h5">
						Usage
					</h1>
					<p className="mt-1 text-paragraph-sm text-text-sub-600">
						Email sends for your current billing period.
					</p>
				</div>
			</div>

			{/* Error state */}
			{error && (
				<div className="rounded-xl border border-error-light bg-error-lighter p-4 text-error-base text-paragraph-sm">
					Failed to load usage data.{" "}
					<button type="button" onClick={refetch} className="underline">
						Retry
					</button>
				</div>
			)}

			{/* Billing Period Banner */}
			<div className="flex items-center justify-between rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-4">
				<div className="flex items-center gap-3">
					<Icon name="calendar" className="h-5 w-5 text-text-sub-600" />
					{isLoading ? (
						<Skeleton className="h-4 w-52" />
					) : (
						<p className="font-medium text-label-sm text-text-strong-950">
							Billing period:{" "}
							{data
								? formatPeriod(
										data.subscription.currentPeriodStart,
										data.subscription.currentPeriodEnd,
									)
								: "—"}
						</p>
					)}
				</div>
				{isLoading ? (
					<Skeleton className="h-4 w-24" />
				) : (
					<p className="font-medium text-paragraph-xs text-text-sub-600">
						Resets in{" "}
						<span className="font-semibold text-text-strong-950">
							{data ? daysUntil(data.subscription.currentPeriodEnd) : "—"} days
						</span>
					</p>
				)}
			</div>

			{/* Main Usage Card */}
			<div className="rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 p-6">
				<div className="mb-4 flex items-center justify-between">
					<div>
						<p className="font-semibold text-label-md text-text-strong-950">
							Emails sent
						</p>
						<p className="text-paragraph-xs text-text-sub-600">
							Total outbound sends this period
						</p>
					</div>
					{isLoading ? (
						<Skeleton className="h-5 w-20 rounded-full" />
					) : (
						<div className={`rounded-full border px-2.5 py-0.5 ${statusColor}`}>
							<span className="font-semibold text-[11px] uppercase tracking-wider">
								{statusLabel}
							</span>
						</div>
					)}
				</div>

				<div className="mb-6">
					{isLoading ? (
						<Skeleton className="h-9 w-48" />
					) : (
						<div className="flex items-baseline gap-2">
							<span className="font-bold text-text-strong-950 text-title-h3">
								{data ? formatNumber(data.subscription.creditsUsed) : "—"}
							</span>
							<span className="font-medium text-paragraph-sm text-text-sub-600">
								of {data ? formatNumber(data.plan.monthlyCredits) : "—"}{" "}
								included
							</span>
						</div>
					)}
				</div>

				{/* Progress bar */}
				<div className="relative h-2 w-full overflow-hidden rounded-full bg-bg-soft-200">
					<div
						className={`absolute top-0 left-0 h-full transition-all duration-500 ${
							isOverLimit
								? "bg-error-base"
								: isNearLimit
									? "bg-warning-base"
									: "bg-blue-500"
						}`}
						style={{ width: `${Math.min(100, usagePercent)}%` }}
					/>
				</div>

				<div className="mt-3 flex justify-between">
					{isLoading ? (
						<>
							<Skeleton className="h-3 w-16" />
							<Skeleton className="h-3 w-24" />
						</>
					) : (
						<>
							<p className="font-medium text-[11px] text-text-sub-600 uppercase tracking-tight">
								{usagePercent.toFixed(1)}% used
							</p>
							<p className="font-medium text-[11px] text-text-sub-600 uppercase tracking-tight">
								{data ? formatNumber(data.subscription.creditsRemaining) : "—"}{" "}
								remaining
							</p>
						</>
					)}
				</div>
			</div>

			{/* Rate Limits Card */}
			<div className="relative overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 p-6">
				<div className="mb-6">
					<p className="font-semibold text-label-md text-text-strong-950">
						Rate limits
					</p>
					<p className="mt-0.5 text-paragraph-xs text-text-sub-600">
						{data
							? `${data.plan.name} plan thresholds`
							: "Current plan thresholds"}
					</p>
				</div>

				<div className="space-y-4">
					{isLoading
						? Array.from({ length: 5 }).map((_, i) => (
								<div key={i} className="flex items-center justify-between">
									<Skeleton className="h-4 w-32" />
									<Skeleton className="h-4 w-28" />
								</div>
							))
						: [
								{
									label: "Per second",
									value: data
										? `${formatNumber(data.plan.ratePerSecond)} emails / sec`
										: "—",
									icon: "clock",
								},
								{
									label: "Per minute",
									value: data
										? `${formatNumber(data.plan.ratePerMinute)} emails / min`
										: "—",
									icon: "clock",
								},
								{
									label: "Per hour",
									value: data
										? `${formatNumber(data.plan.ratePerHour)} emails / hr`
										: "—",
									icon: "clock",
								},
								{
									label: "Monthly quota",
									value: data
										? `${formatNumber(data.plan.monthlyCredits)} emails`
										: "—",
									icon: "calendar",
								},
								{
									label: "Max attachment size",
									value: data ? `${data.plan.maxAttachmentSizeMb} MB` : "—",
									icon: "file-text",
								},
							].map((limit) => (
								<div
									key={limit.label}
									className="group flex items-center justify-between"
								>
									<div className="flex items-center gap-3 text-text-sub-600">
										<Icon name={limit.icon} className="h-4 w-4" />
										<span className="font-medium text-paragraph-sm">
											{limit.label}
										</span>
									</div>
									<span className="font-semibold text-paragraph-sm text-text-strong-950 tracking-tight">
										{limit.value}
									</span>
								</div>
							))}
				</div>

				<div className="mt-8 flex items-center justify-between border-stroke-soft-200/50 border-t pt-6">
					<button
						type="button"
						className="mx-auto rounded-full p-2 text-text-sub-600 transition-colors hover:bg-bg-soft-200"
					>
						<Icon name="chevron-down" className="h-5 w-5" />
					</button>
					<div className="absolute right-6 bottom-6">
						<Button.Root
							variant="neutral"
							size="xsmall"
							className="font-semibold"
						>
							Upgrade plan
							<Icon
								name="arrow-swap"
								className="ml-2 h-3.5 w-3.5 rotate-[135deg]"
							/>
						</Button.Root>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UsagePage;
