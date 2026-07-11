"use client";

import { useBillingUsage } from "@fe/dashboard/hooks/useBillingUsage";
import { useOrgPermissions } from "@fe/dashboard/hooks/use-org-permissions";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Transaction {
	id: string;
	entryType:
		| "credit_purchased"
		| "email_sent"
		| "rollover_applied"
		| "manual_adjustment"
		| "refund"
		| "plan_change"
		| "period_reset";
	delta: number;
	balanceAfter: number;
	reason: string | null;
	createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
	return new Date(iso).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function formatNumber(num: number): string {
	return num.toLocaleString();
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

const Skeleton = ({ className }: { className?: string }) => (
	<div
		className={`animate-pulse rounded bg-bg-soft-200 dark:bg-white/10 ${className ?? ""}`}
	/>
);

const entryTypeLabels: Record<string, string> = {
	credit_purchased: "Quota Purchased",
	email_sent: "Email Delivery",
	rollover_applied: "Rollover",
	manual_adjustment: "Adjustment",
	refund: "Refund",
	plan_change: "Plan Change",
	period_reset: "Monthly Reset",
};

const entryTypeStyles: Record<string, string> = {
	credit_purchased:
		"bg-green-50 text-green-700 border border-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
	email_sent:
		"bg-neutral-50 text-neutral-600 border border-neutral-100 dark:bg-white/5 dark:text-white/60 dark:border-white/10",
	manual_adjustment:
		"bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
	period_reset:
		"bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const UsageCreditsPage = () => {
	const router = useRouter();
	const { canManageBilling, isPending: rolePending } = useOrgPermissions();

	const {
		data: usageData,
		isLoading: usageLoading,
		error: usageError,
		refetch: refetchUsage,
	} = useBillingUsage();

	const {
		data: transactions,
		isLoading: transactionsLoading,
		error: transactionsError,
	} = useSWR<Transaction[]>(
		canManageBilling ? "/api/credits/v1/transactions" : null,
	);

	useEffect(() => {
		if (!rolePending && !canManageBilling) {
			router.replace("/settings");
		}
	}, [canManageBilling, rolePending, router]);

	if (rolePending || !canManageBilling) {
		return null;
	}

	const isLoading = usageLoading || transactionsLoading;
	const error = usageError || transactionsError;

	const usagePercent =
		usageData && usageData.plan?.monthlyCredits > 0
			? (usageData.subscription.creditsUsed / usageData.plan.monthlyCredits) * 100
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

	return (
		<div className="w-full space-y-6 pt-5">
			{/* Header */}
			<div className="flex items-start justify-between">
				<div>
					<h1 className="font-semibold text-text-strong-950 text-title-h5 dark:text-white">
						Usage &amp; Credits
					</h1>
					<p className="mt-1 text-paragraph-sm text-text-sub-600 dark:text-white/60">
						Email sends, rate limits, and credit ledger for your organization.
					</p>
				</div>
			</div>

			{/* Error state */}
			{error && (
				<div className="rounded-xl border border-error-light bg-error-lighter p-4 text-error-base text-paragraph-sm">
					Failed to load usage and credits data.{" "}
					<button type="button" onClick={refetchUsage} className="underline">
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
					{usageLoading ? (
						<Skeleton className="h-4 w-52" />
					) : (
						<p className="font-medium text-label-sm text-text-strong-950 dark:text-white">
							Billing period:{" "}
							{usageData
								? formatPeriod(
										usageData.subscription.currentPeriodStart,
										usageData.subscription.currentPeriodEnd,
									)
								: "—"}
						</p>
					)}
				</div>
				{usageLoading ? (
					<Skeleton className="h-4 w-24" />
				) : (
					<p className="font-medium text-paragraph-xs text-text-sub-600 dark:text-white/60">
						Resets in{" "}
						<span className="font-semibold text-text-strong-950 dark:text-white">
							{usageData ? daysUntil(usageData.subscription.currentPeriodEnd) : "—"} days
						</span>
					</p>
				)}
			</div>

			{/* Grid of Usage Progress and Rate Limits */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				{/* Emails Sent Progress Card */}
				<div className="group flex flex-col">
					<div className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-3 pb-3 dark:border-white/5 dark:bg-white/[0.02]">
						<div className="flex items-center gap-2 font-medium text-sm text-text-strong-950 dark:text-white">
							<Icon
								name="mail-send"
								className="h-4 w-4 shrink-0 text-text-sub-600 dark:text-white/60"
							/>
							<span>Emails sent</span>
						</div>
						{usageLoading ? (
							<Skeleton className="h-5 w-16 rounded-full" />
						) : (
							<span
								className={cn(
									"inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 font-medium text-[10px]",
									getStatusColor(statusLabel),
								)}
							>
								{statusLabel}
							</span>
						)}
					</div>

					<div className="-mt-1.5 flex flex-1 flex-col overflow-hidden rounded-xl border border-stroke-soft-100 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
						<p className="mb-4 text-paragraph-xs text-text-sub-600 dark:text-white/60">
							Total outbound sends this period
						</p>

						<div className="mb-6">
							{usageLoading ? (
								<Skeleton className="h-9 w-48" />
							) : (
								<div className="flex items-baseline gap-2">
									<span className="font-bold text-text-strong-950 text-title-h3 dark:text-white">
										{usageData ? formatNumber(usageData.subscription.creditsUsed) : "—"}
									</span>
									<span className="font-medium text-paragraph-sm text-text-sub-600 dark:text-white/60">
										of {usageData ? formatNumber(usageData.plan.monthlyCredits) : "—"}{" "}
										included
									</span>
								</div>
							)}
						</div>

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
							{usageLoading ? (
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
										{usageData
											? formatNumber(usageData.subscription.creditsRemaining)
											: "—"}{" "}
										remaining
									</p>
								</>
							)}
						</div>
					</div>
				</div>

				{/* Rate Limits Card */}
				<div className="group flex flex-col">
					<div className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-3 pb-3 dark:border-white/5 dark:bg-white/[0.02]">
						<div className="flex items-center gap-2 font-medium text-sm text-text-strong-950 dark:text-white">
							<Icon
								name="clock"
								className="h-4 w-4 shrink-0 text-text-sub-600 dark:text-white/60"
							/>
							<span>Rate limits &amp; features</span>
						</div>
					</div>

					<div className="-mt-1.5 flex flex-1 flex-col justify-between overflow-hidden rounded-xl border border-stroke-soft-100 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
						<div className="space-y-4">
							{usageLoading
								? Array.from({ length: 5 }).map((_, i) => (
										<div key={i} className="flex items-center justify-between">
											<Skeleton className="h-4 w-32" />
											<Skeleton className="h-4 w-28" />
										</div>
									))
								: [
										{
											label: "Per second",
											value: usageData
												? `${formatNumber(usageData.plan.ratePerSecond)} emails / sec`
												: "—",
											icon: "clock",
										},
										{
											label: "Per minute",
											value: usageData
												? `${formatNumber(usageData.plan.ratePerMinute)} emails / min`
												: "—",
											icon: "clock",
										},
										{
											label: "Per hour",
											value: usageData
												? `${formatNumber(usageData.plan.ratePerHour)} emails / hr`
												: "—",
											icon: "clock",
										},
										{
											label: "Monthly quota",
											value: usageData
												? `${formatNumber(usageData.plan.monthlyCredits)} emails`
												: "—",
											icon: "calendar",
										},
										{
											label: "Max attachment size",
											value: usageData ? `${usageData.plan.maxAttachmentSizeMb} MB` : "—",
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

						<div className="mt-6 flex items-center justify-between border-stroke-soft-200/50 border-t pt-4 dark:border-white/5">
							<div />
							<Button.Root
								variant="neutral"
								size="xsmall"
								className="font-semibold"
							>
								<Icon name="arrow-top-circle" className="h-3.5 w-3.5" />
								Upgrade Plan
							</Button.Root>
						</div>
					</div>
				</div>
			</div>

			{/* Transactions History */}
			<div className="group flex w-full flex-col">
				<div className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-3 pb-3 dark:border-white/5 dark:bg-white/[0.02]">
					<div className="flex items-center gap-2 font-medium text-sm text-text-strong-950 dark:text-white">
						<Icon
							name="file-text"
							className="h-4 w-4 shrink-0 text-text-sub-600 dark:text-white/60"
						/>
						<span>Credit Ledger &amp; Transactions</span>
					</div>
					<Button.Root
						variant="neutral"
						size="xsmall"
						className="font-semibold"
					>
						Request Custom Quota
					</Button.Root>
				</div>

				<div className="-mt-1.5 overflow-hidden rounded-xl border border-stroke-soft-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
					<table className="w-full text-left text-sm">
						<thead className="border-stroke-soft-100 border-b bg-neutral-alpha-5 dark:border-white/5 dark:bg-white/[0.02]">
							<tr>
								<th className="px-4 py-3 font-medium text-text-sub-600 dark:text-white/60">
									Date
								</th>
								<th className="px-4 py-3 font-medium text-text-sub-600 dark:text-white/60">
									Type
								</th>
								<th className="px-4 py-3 font-medium text-text-sub-600 dark:text-white/60">
									Description
								</th>
								<th className="px-4 py-3 text-right font-medium text-text-sub-600 dark:text-white/60">
									Change
								</th>
								<th className="px-4 py-3 text-right font-medium text-text-sub-600 dark:text-white/60">
									Balance
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-stroke-soft-100 dark:divide-white/5">
							{isLoading ? (
								Array.from({ length: 3 }).map((_, i) => (
									<tr key={i} className="dark:border-white/5">
										<td className="px-4 py-3">
											<Skeleton className="h-4 w-28" />
										</td>
										<td className="px-4 py-3">
											<Skeleton className="h-4.5 w-20 rounded" />
										</td>
										<td className="px-4 py-3">
											<Skeleton className="h-4 w-40" />
										</td>
										<td className="px-4 py-3 text-right">
											<Skeleton className="ml-auto h-4 w-12" />
										</td>
										<td className="px-4 py-3 text-right">
											<Skeleton className="ml-auto h-4 w-16" />
										</td>
									</tr>
								))
							) : (transactions ?? []).length === 0 ? (
								<tr>
									<td
										colSpan={5}
										className="px-4 py-8 text-center text-paragraph-sm text-text-sub-600 dark:text-white/60"
									>
										No credit transactions recorded yet.
									</td>
								</tr>
							) : (
								(transactions ?? []).map((tx) => (
									<tr
										key={tx.id}
										className="transition-colors hover:bg-neutral-alpha-5/5 dark:hover:bg-white/[0.01]"
									>
										<td className="whitespace-nowrap px-4 py-3 text-text-strong-950 dark:text-white">
											{formatDate(tx.createdAt)}
										</td>
										<td className="whitespace-nowrap px-4 py-3">
											<span
												className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-medium text-[10px] capitalize ${entryTypeStyles[tx.entryType] ?? "bg-neutral-100 text-neutral-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60"}`}
											>
												{entryTypeLabels[tx.entryType] ?? tx.entryType}
											</span>
										</td>
										<td className="max-w-[240px] truncate px-4 py-3 text-text-sub-600 dark:text-white/60">
											{tx.reason ?? "—"}
										</td>
										<td
											className={`whitespace-nowrap px-4 py-3 text-right font-medium ${
												tx.delta > 0
													? "text-green-600 dark:text-green-400"
													: "text-text-strong-950 dark:text-white"
											}`}
										>
											{tx.delta > 0 ? "+" : ""}
											{formatNumber(tx.delta)}
										</td>
										<td className="whitespace-nowrap px-4 py-3 text-right font-medium text-text-strong-950 dark:text-white">
											{formatNumber(tx.balanceAfter)}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default UsageCreditsPage;
