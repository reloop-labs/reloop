"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanData {
	plan: {
		name: string;
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

interface Invoice {
	id: string;
	createdAt: string;
	totalUsd: string;
	status: "draft" | "open" | "paid" | "void" | "uncollectible";
	periodStart: string;
	periodEnd: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BILLING_BASE =
	process.env.NEXT_PUBLIC_BILLING_URL ?? "http://localhost:8023/api/billing";

function formatDate(iso: string): string {
	return new Date(iso).toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

function formatCurrency(usd: string): string {
	return `$${Number.parseFloat(usd).toFixed(2)}`;
}

const Skeleton = ({ className }: { className?: string }) => (
	<div className={`animate-pulse rounded bg-bg-soft-200 ${className ?? ""}`} />
);

const statusStyles: Record<string, string> = {
	paid: "bg-green-50 text-green-700",
	open: "bg-blue-50 text-blue-700",
	draft: "bg-neutral-100 text-neutral-600",
	void: "bg-neutral-100 text-neutral-400",
	uncollectible: "bg-red-50 text-red-700",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const BillingPage = () => {
	const [planData, setPlanData] = useState<PlanData | null>(null);
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchAll = async () => {
			try {
				const [planRes, invoicesRes] = await Promise.all([
					fetch(`${BILLING_BASE}/plan`, { credentials: "include" }),
					fetch(`${BILLING_BASE}/invoices`, { credentials: "include" }),
				]);

				if (!planRes.ok) throw new Error(`Plan fetch failed: HTTP ${planRes.status}`);
				if (!invoicesRes.ok) throw new Error(`Invoices fetch failed: HTTP ${invoicesRes.status}`);

				const [planJson, invoicesJson] = await Promise.all([
					planRes.json() as Promise<PlanData>,
					invoicesRes.json() as Promise<Invoice[]>,
				]);

				setPlanData(planJson);
				setInvoices(invoicesJson);
				setError(null);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load billing data");
			} finally {
				setIsLoading(false);
			}
		};

		fetchAll();
	}, []);

	return (
		<div className="w-full space-y-8 pt-5">
			<div>
				<div className="mb-6">
					<p className="font-medium text-label-md text-text-strong-950">
						Billing &amp; Subscription
					</p>
					<p className="text-paragraph-sm text-text-sub-600">
						Manage your subscription plan, payment methods, and invoices.
					</p>
				</div>

				{/* Error state */}
				{error && (
					<div className="mb-4 rounded-xl border border-error-light bg-error-lighter p-4 text-paragraph-sm text-error-base">
						{error}
					</div>
				)}

				{/* Plan Overview */}
				<div className="rounded-xl border border-stroke-soft-200 bg-white p-6 shadow-sm">
					<div className="flex items-start justify-between">
						<div className="space-y-1">
							<p className="font-medium text-label-sm text-text-sub-600">Current Plan</p>
							{isLoading ? (
								<Skeleton className="h-8 w-32" />
							) : (
								<p className="font-semibold text-2xl text-text-strong-950">
									{planData?.plan.name ?? "—"} Plan
								</p>
							)}
						</div>
						<Button.Root variant="neutral" size="xsmall">
							Upgrade Plan
						</Button.Root>
					</div>

					<div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
						<div className="space-y-1">
							<p className="text-paragraph-xs text-text-sub-600">Next billing date</p>
							{isLoading ? (
								<Skeleton className="h-5 w-28" />
							) : (
								<p className="font-medium text-label-sm text-text-strong-950">
									{planData ? formatDate(planData.subscription.currentPeriodEnd) : "—"}
								</p>
							)}
						</div>
						<div className="space-y-1">
							<p className="text-paragraph-xs text-text-sub-600">Billing interval</p>
							{isLoading ? (
								<Skeleton className="h-5 w-20" />
							) : (
								<p className="font-medium text-label-sm text-text-strong-950 capitalize">
									{planData?.plan.billingCycle ?? "—"}
								</p>
							)}
						</div>
						<div className="space-y-1">
							<p className="text-paragraph-xs text-text-sub-600">Amount</p>
							{isLoading ? (
								<Skeleton className="h-5 w-16" />
							) : (
								<p className="font-medium text-label-sm text-text-strong-950">
									{planData ? formatCurrency(planData.plan.basePriceUsd) : "—"}
								</p>
							)}
						</div>
					</div>
				</div>

				{/* Billing History */}
				<div className="mt-10">
					<p className="font-medium text-label-sm text-text-strong-950">Billing History</p>
					<div className="mt-4 overflow-hidden rounded-xl border border-stroke-soft-200 bg-white">
						<table className="w-full text-left text-sm">
							<thead className="border-stroke-soft-200 border-b bg-neutral-alpha-5">
								<tr>
									<th className="px-4 py-3 font-medium text-text-sub-600">Date</th>
									<th className="px-4 py-3 font-medium text-text-sub-600">Amount</th>
									<th className="px-4 py-3 font-medium text-text-sub-600">Status</th>
									<th className="px-4 py-3 text-right font-medium text-text-sub-600">
										Invoice
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
												<Skeleton className="h-4 w-16" />
											</td>
											<td className="px-4 py-3">
												<Skeleton className="h-4 w-12 rounded-full" />
											</td>
											<td className="px-4 py-3 text-right">
												<Skeleton className="ml-auto h-6 w-6" />
											</td>
										</tr>
									))
								) : invoices.length === 0 ? (
									<tr>
										<td
											colSpan={4}
											className="px-4 py-8 text-center text-paragraph-sm text-text-sub-600"
										>
											No invoices yet.
										</td>
									</tr>
								) : (
									invoices.map((invoice) => (
										<tr
											key={invoice.id}
											className="transition-colors hover:bg-neutral-alpha-5/5"
										>
											<td className="px-4 py-3 text-text-strong-950">
												{formatDate(invoice.createdAt)}
											</td>
											<td className="px-4 py-3 text-text-strong-950">
												{formatCurrency(invoice.totalUsd)}
											</td>
											<td className="px-4 py-3">
												<span
													className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium text-[10px] capitalize ${statusStyles[invoice.status] ?? "bg-neutral-100 text-neutral-600"}`}
												>
													{invoice.status}
												</span>
											</td>
											<td className="px-4 py-3 text-right">
												<Button.Root variant="neutral" mode="ghost" size="xsmall">
													<Icon name="file-text" className="h-4 w-4" />
												</Button.Root>
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

export default BillingPage;
