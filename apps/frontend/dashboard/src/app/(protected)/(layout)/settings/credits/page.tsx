"use client";

import * as Button from "@reloop/ui/button";
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
	<div className={`animate-pulse rounded bg-bg-soft-200 ${className ?? ""}`} />
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
	credit_purchased: "bg-green-50 text-green-700 border border-green-100",
	email_sent: "bg-neutral-50 text-neutral-600 border border-neutral-100",
	manual_adjustment: "bg-blue-50 text-blue-700 border border-blue-100",
	period_reset: "bg-amber-50 text-amber-700 border border-amber-100",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const CreditsPage = () => {
	const {
		data: planData,
		isLoading: planLoading,
		error: planError,
	} = useSWR<PlanData>("/api/credits/v1/plan");
	const {
		data: transactions,
		isLoading: transactionsLoading,
		error: transactionsError,
	} = useSWR<Transaction[]>("/api/credits/v1/transactions");

	const isLoading = planLoading || transactionsLoading;
	const error = planError || transactionsError;

	return (
		<div className="w-full space-y-8 pt-5">
			<div>
				<div className="mb-6">
					<p className="font-medium text-label-md text-text-strong-950">
						Credits &amp; Quota
					</p>
					<p className="text-paragraph-sm text-text-sub-600">
						Manage your organization credit balance, track usage logs, and
						request quota adjustments.
					</p>
				</div>

				{/* Error state */}
				{error && (
					<div className="mb-4 rounded-xl border border-error-light bg-error-lighter p-4 text-error-base text-paragraph-sm">
						{error?.message ?? "Failed to load credits data."}
					</div>
				)}

				{/* Plan Overview */}
				<div className="rounded-xl border border-stroke-soft-200 bg-white p-6 shadow-sm">
					<div className="flex items-start justify-between">
						<div className="space-y-1">
							<p className="font-medium text-label-sm text-text-sub-600">
								Current Allocation
							</p>
							{isLoading ? (
								<Skeleton className="h-8 w-32" />
							) : (
								<p className="font-semibold text-2xl text-text-strong-950">
									{planData ? formatNumber(planData.plan.monthlyCredits) : "—"}{" "}
									credits / mo
								</p>
							)}
						</div>
						<Button.Root variant="neutral" size="xsmall">
							Request Custom Quota
						</Button.Root>
					</div>

					<div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
						<div className="space-y-1">
							<p className="text-paragraph-xs text-text-sub-600">
								Next reset date
							</p>
							{isLoading ? (
								<Skeleton className="h-5 w-28" />
							) : (
								<p className="font-medium text-label-sm text-text-strong-950">
									{planData
										? formatDate(planData.subscription.currentPeriodEnd)
										: "—"}
								</p>
							)}
						</div>
						<div className="space-y-1">
							<p className="text-paragraph-xs text-text-sub-600">
								Reset frequency
							</p>
							{isLoading ? (
								<Skeleton className="h-5 w-20" />
							) : (
								<p className="font-medium text-label-sm text-text-strong-950 capitalize">
									{planData?.plan.billingCycle ?? "—"}
								</p>
							)}
						</div>
						<div className="space-y-1">
							<p className="text-paragraph-xs text-text-sub-600">
								Credits remaining
							</p>
							{isLoading ? (
								<Skeleton className="h-5 w-16" />
							) : (
								<p className="font-medium text-label-sm text-text-strong-950">
									{planData
										? formatNumber(planData.subscription.creditsRemaining)
										: "—"}
								</p>
							)}
						</div>
					</div>
				</div>

				{/* Transactions History */}
				<div className="mt-10">
					<p className="font-medium text-label-sm text-text-strong-950">
						Credit Ledger &amp; Transactions
					</p>
					<div className="mt-4 overflow-hidden rounded-xl border border-stroke-soft-200 bg-white">
						<table className="w-full text-left text-sm">
							<thead className="border-stroke-soft-200 border-b bg-neutral-alpha-5">
								<tr>
									<th className="px-4 py-3 font-medium text-text-sub-600">
										Date
									</th>
									<th className="px-4 py-3 font-medium text-text-sub-600">
										Type
									</th>
									<th className="px-4 py-3 font-medium text-text-sub-600">
										Description
									</th>
									<th className="px-4 py-3 text-right font-medium text-text-sub-600">
										Change
									</th>
									<th className="px-4 py-3 text-right font-medium text-text-sub-600">
										Balance
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-stroke-soft-200">
								{isLoading ? (
									Array.from({ length: 3 }).map((_, i) => (
										<tr key={i}>
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
											className="px-4 py-8 text-center text-paragraph-sm text-text-sub-600"
										>
											No credit transactions recorded yet.
										</td>
									</tr>
								) : (
									(transactions ?? []).map((tx) => (
										<tr
											key={tx.id}
											className="transition-colors hover:bg-neutral-alpha-5/5"
										>
											<td className="whitespace-nowrap px-4 py-3 text-text-strong-950">
												{formatDate(tx.createdAt)}
											</td>
											<td className="whitespace-nowrap px-4 py-3">
												<span
													className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-medium text-[10px] capitalize ${entryTypeStyles[tx.entryType] ?? "bg-neutral-100 text-neutral-600"}`}
												>
													{entryTypeLabels[tx.entryType] ?? tx.entryType}
												</span>
											</td>
											<td className="max-w-[240px] truncate px-4 py-3 text-text-sub-600">
												{tx.reason ?? "—"}
											</td>
											<td
												className={`whitespace-nowrap px-4 py-3 text-right font-medium ${
													tx.delta > 0
														? "text-green-600"
														: "text-text-strong-950"
												}`}
											>
												{tx.delta > 0 ? "+" : ""}
												{formatNumber(tx.delta)}
											</td>
											<td className="whitespace-nowrap px-4 py-3 text-right font-medium text-text-strong-950">
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
		</div>
	);
};

export default CreditsPage;
