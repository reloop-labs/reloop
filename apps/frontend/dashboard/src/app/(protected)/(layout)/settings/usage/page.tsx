"use client";

import { useBillingUsage } from "@fe/dashboard/hooks/useBillingUsage";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
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

	const getStatusColor = (status: string) => {
		switch (status) {
			case "Limit reached":
				return "border-error-base bg-error-light/20 text-error-base";
			case "High usage":
				return "border-warning-base bg-warning-light/20 text-warning-base";
			case "On track":
			default:
				return "border-success-base bg-success-light/20 text-success-base";
		}
	};

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
		<div className="w-full space-y-6 pt-5">
			{/* Header */}
			<div className="flex items-start justify-between">
				<div>
					<h1 className="font-semibold text-text-strong-950 text-title-h5 dark:text-white">
						Usage
					</h1>
					<p className="mt-1 text-paragraph-sm text-text-sub-600 dark:text-white/60">
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
			<div className="flex items-center justify-between rounded-xl border border-stroke-soft-100 bg-white p-4 dark:border-white/5 dark:bg-white/[0.02]">
				<div className="flex items-center gap-3">
					<Icon
						name="calendar"
						className="h-5 w-5 text-text-sub-600 dark:text-white/60"
					/>
					{isLoading ? (
						<Skeleton className="h-4 w-52" />
					) : (
						<p className="font-medium text-label-sm text-text-strong-950 dark:text-white">
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
					<p className="font-medium text-paragraph-xs text-text-sub-600 dark:text-white/60">
						Resets in{" "}
						<span className="font-semibold text-text-strong-950 dark:text-white">
							{data ? daysUntil(data.subscription.currentPeriodEnd) : "—"} days
						</span>
					</p>
				)}
			</div>

			{/* Main Usage Card */}
			<div className="group flex w-full flex-col">
				{/* Header */}
				<div className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-3 pb-3 dark:border-white/5 dark:bg-white/[0.02]">
					<div className="flex items-center gap-2 font-medium text-sm text-text-strong-950 dark:text-white">
						<Icon
							name="mail-send"
							className="h-4 w-4 shrink-0 text-text-sub-600 dark:text-white/60"
						/>
						<span>Emails sent</span>
					</div>
					{isLoading ? (
						<Skeleton className="h-5 w-16 rounded-full" />
					) : (
						<span
							className={cn(
								"inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 font-medium text-[10px] text-white",
								getStatusColor(statusLabel),
							)}
						>
							{statusLabel}
						</span>
					)}
				</div>

				{/* Body Container */}
				<div className="-mt-1.5 flex flex-col overflow-hidden rounded-xl border border-stroke-soft-100 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
					<p className="mb-4 text-paragraph-xs text-text-sub-600 dark:text-white/60">
						Total outbound sends this period
					</p>

					<div className="mb-6">
						{isLoading ? (
							<Skeleton className="h-9 w-48" />
						) : (
							<div className="flex items-baseline gap-2">
								<span className="font-bold text-text-strong-950 text-title-h3 dark:text-white">
									{data ? formatNumber(data.subscription.creditsUsed) : "—"}
								</span>
								<span className="font-medium text-paragraph-sm text-text-sub-600 dark:text-white/60">
									of {data ? formatNumber(data.plan.monthlyCredits) : "—"}{" "}
									included
								</span>
							</div>
						)}
					</div>

					{/* Progress bar */}
					<div className="relative h-2 w-full overflow-hidden rounded-full bg-bg-soft-200 dark:bg-white/10">
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
								<p className="font-medium text-[11px] text-text-sub-600 uppercase tracking-tight dark:text-white/60">
									{usagePercent.toFixed(1)}% used
								</p>
								<p className="font-medium text-[11px] text-text-sub-600 uppercase tracking-tight dark:text-white/60">
									{data
										? formatNumber(data.subscription.creditsRemaining)
										: "—"}{" "}
									remaining
								</p>
							</>
						)}
					</div>
				</div>
			</div>

			{/* Rate Limits Card */}
			<div className="group flex w-full flex-col">
				{/* Header */}
				<div className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-3 pb-3 dark:border-white/5 dark:bg-white/[0.02]">
					<div className="flex items-center gap-2 font-medium text-sm text-text-strong-950 dark:text-white">
						<Icon
							name="clock"
							className="h-4 w-4 shrink-0 text-text-sub-600 dark:text-white/60"
						/>
						<span>Rate limits</span>
					</div>
				</div>

				{/* Body Container */}
				<div className="-mt-1.5 flex flex-col overflow-hidden rounded-xl border border-stroke-soft-100 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
					<p className="mb-6 text-paragraph-xs text-text-sub-600 dark:text-white/60">
						{data
							? `${data.plan.name} plan thresholds`
							: "Current plan thresholds"}
					</p>

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
										<div className="flex items-center gap-3 text-text-sub-600 dark:text-white/60">
											<Icon name={limit.icon} className="h-4 w-4" />
											<span className="font-medium text-paragraph-sm">
												{limit.label}
											</span>
										</div>
										<span className="font-semibold text-paragraph-sm text-text-strong-950 tracking-tight dark:text-white">
											{limit.value}
										</span>
									</div>
								))}
					</div>

					<div className="mt-8 flex items-center justify-between border-stroke-soft-200/50 border-t pt-6 dark:border-white/5">
						<div />
						<Button.Root
							variant="neutral"
							size="xsmall"
							className="font-semibold"
						>
							<Icon name="arrow-top-circle" className="h-3.5 w-3.5" />
							Upgrade plan
						</Button.Root>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UsagePage;
