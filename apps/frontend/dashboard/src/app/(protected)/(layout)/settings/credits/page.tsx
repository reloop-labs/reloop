"use client";

import { useOrgPermissions } from "@fe/dashboard/hooks/use-org-permissions";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanData {
	plan: {
		name: string;
		monthlyCredits: number;
		basePriceUsd: string;
		billingCycle: "monthly" | "annual";
	};
	subscription: {
		status: string;
		currentPeriodStart: string;
		currentPeriodEnd: string;
		creditsUsed: number;
		creditsRemaining: number;
	};
}

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

const CreditsPage = () => {
	const router = useRouter();
	const { canManageBilling, isPending: rolePending } = useOrgPermissions();
	const {
		data: planData,
		isLoading: planLoading,
		error: planError,
	} = useSWR<PlanData>(canManageBilling ? "/api/credits/v1/plan" : null);
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

	const isLoading = planLoading || transactionsLoading;
	const error = planError || transactionsError;

	return (
		<div className="w-full space-y-6 pt-5">
			{/* Header */}
			<div className="flex items-start justify-between">
				<div>
					<h1 className="font-semibold text-text-strong-950 text-title-h5 dark:text-white">
						Credits &amp; Quota
					</h1>
					<p className="mt-1 text-paragraph-sm text-text-sub-600 dark:text-white/60">
						Manage your organization credit balance, track usage logs, and
						request quota adjustments.
					</p>
				</div>
			</div>

			{/* Error state */}
			{error && (
				<div className="rounded-xl border border-error-light bg-error-lighter p-4 text-error-base text-paragraph-sm">
					{error?.message ?? "Failed to load credits data."}
				</div>
			)}

			{/* Plan Overview */}
			<div className="group flex w-full flex-col">
				{/* Header */}
				<div className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-3 pb-3 dark:border-white/5 dark:bg-white/[0.02]">
					<div className="flex items-center gap-2 font-medium text-sm text-text-strong-950 dark:text-white">
						<Icon
							name="invoice"
							className="h-4 w-4 shrink-0 text-text-sub-600 dark:text-white/60"
						/>
						<span>Credits overview</span>
					</div>
					<Button.Root
						variant="neutral"
						size="xsmall"
						className="font-semibold"
					>
						Request Custom Quota
					</Button.Root>
				</div>

				{/* Body Container */}
				<div className="-mt-1.5 flex flex-col overflow-hidden rounded-xl border border-stroke-soft-100 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
					<div className="space-y-1">
						<p className="font-medium text-label-sm text-text-sub-600 dark:text-white/60">
							Current Allocation
						</p>
						{isLoading ? (
							<Skeleton className="h-8 w-32" />
						) : (
							<p className="font-semibold text-2xl text-text-strong-950 dark:text-white">
								{planData ? formatNumber(planData.plan.monthlyCredits) : "—"}{" "}
								credits / mo
							</p>
						)}
					</div>

					<div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
						<div className="space-y-1">
							<p className="text-paragraph-xs text-text-sub-600 dark:text-white/60">
								Next reset date
							</p>
							{isLoading ? (
								<Skeleton className="h-5 w-28" />
							) : (
								<p className="font-medium text-label-sm text-text-strong-950 dark:text-white">
									{planData
										? formatDate(planData.subscription.currentPeriodEnd)
										: "—"}
								</p>
							)}
						</div>
						<div className="space-y-1">
							<p className="text-paragraph-xs text-text-sub-600 dark:text-white/60">
								Reset frequency
							</p>
							{isLoading ? (
								<Skeleton className="h-5 w-20" />
							) : (
								<p className="font-medium text-label-sm text-text-strong-950 capitalize dark:text-white">
									{planData?.plan.billingCycle ?? "—"}
								</p>
							)}
						</div>
						<div className="space-y-1">
							<p className="text-paragraph-xs text-text-sub-600 dark:text-white/60">
								Credits remaining
							</p>
							{isLoading ? (
								<Skeleton className="h-5 w-16" />
							) : (
								<p className="font-medium text-label-sm text-text-strong-950 dark:text-white">
									{planData
										? formatNumber(planData.subscription.creditsRemaining)
										: "—"}
								</p>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Transactions History */}
			<div className="group flex w-full flex-col">
				{/* Header */}
				<div className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-3 pb-3 dark:border-white/5 dark:bg-white/[0.02]">
					<div className="flex items-center gap-2 font-medium text-sm text-text-strong-950 dark:text-white">
						<Icon
							name="file-text"
							className="h-4 w-4 shrink-0 text-text-sub-600 dark:text-white/60"
						/>
						<span>Credit Ledger &amp; Transactions</span>
					</div>
				</div>

				{/* Body Container */}
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

export default CreditsPage;
