"use client";

import { useBetterAuth } from "@fe/dashboard/providers/org-provider";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Plan {
	code: string;
	name: string;
	monthlyCredits: number;
	priceUsd: string;
}

interface Subscription {
	status: string | null;
	creditsRemaining: number;
	monthlyCredits: number;
	currentPeriodEnd: string | null;
	lagoSubscriptionId: string | null;
}

interface Invoice {
	lago_id: string;
	number: string;
	status: string;
	payment_status: string;
	total_amount_cents: number;
	currency: string;
	issuing_date: string;
	file_url?: string;
}

interface BillingData {
	plan: Plan;
	subscription: Subscription;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PLAN_ORDER = ["free", "starter", "growth", "scale"];

const statusColors: Record<string, string> = {
	active: "bg-green-500/15 text-green-600 dark:text-green-400",
	trialing: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
	past_due: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
	cancelled: "bg-red-500/15 text-red-600 dark:text-red-400",
};

function formatCredits(n: number) {
	return n >= 1000 ? `${(n / 1000).toLocaleString()}k` : String(n);
}

function formatAmount(cents: number, currency: string) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency.toUpperCase(),
	}).format(cents / 100);
}

// ─── Components ───────────────────────────────────────────────────────────────

function UsageBar({ used, total }: { used: number; total: number }) {
	const pct = total > 0 ? Math.min(100, ((total - used) / total) * 100) : 0;
	const usedPct = 100 - pct;

	const barColor =
		usedPct >= 90
			? "bg-red-500"
			: usedPct >= 75
				? "bg-amber-500"
				: "bg-primary-base";

	return (
		<div className="space-y-1.5">
			<div className="flex items-center justify-between text-sm">
				<span className="text-text-sub-600">Credits remaining</span>
				<span className="font-medium text-text-strong-950 tabular-nums">
					{formatCredits(used)}{" "}
					<span className="text-text-sub-600">/ {formatCredits(total)}</span>
				</span>
			</div>
			<div className="h-2 w-full overflow-hidden rounded-full bg-bg-weak-50 dark:bg-white/10">
				<div
					className={cn(
						"h-full rounded-full transition-all duration-700",
						barColor,
					)}
					style={{ width: `${usedPct}%` }}
				/>
			</div>
		</div>
	);
}

function PlanBadge({ status }: { status: string | null }) {
	const label = status
		? status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())
		: "Unknown";
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs",
				statusColors[status ?? ""] ?? "bg-neutral-100 text-neutral-600",
			)}
		>
			{label}
		</span>
	);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillingPage() {
	const [billing, setBilling] = useState<BillingData | null>(null);
	const [plans, setPlans] = useState<Plan[]>([]);
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [loading, setLoading] = useState(true);
	const [upgrading, setUpgrading] = useState<string | null>(null);

	const fetchData = useCallback(async () => {
		try {
			const [subRes, plansRes, invRes] = await Promise.all([
				fetch("/api/auth/v1/billing/subscription", { credentials: "include" }),
				fetch("/api/auth/v1/billing/plans", { credentials: "include" }),
				fetch("/api/auth/v1/billing/invoices", { credentials: "include" }),
			]);

			if (subRes.ok) setBilling(await subRes.json());
			if (plansRes.ok) {
				const raw: Plan[] = await plansRes.json();
				setPlans(
					raw.sort(
						(a, b) => PLAN_ORDER.indexOf(a.code) - PLAN_ORDER.indexOf(b.code),
					),
				);
			}
			if (invRes.ok) setInvoices(await invRes.json());
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleUpgrade = async (planCode: string) => {
		setUpgrading(planCode);
		try {
			const res = await fetch("/api/auth/v1/billing/upgrade", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ planCode }),
			});
			if (res.ok) await fetchData();
		} finally {
			setUpgrading(null);
		}
	};

	if (loading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-base border-t-transparent" />
			</div>
		);
	}

	const currentPlanCode = billing?.plan.code ?? "free";
	const creditsUsed =
		(billing?.subscription.monthlyCredits ?? 0) -
		(billing?.subscription.creditsRemaining ?? 0);

	return (
		<div className="mx-auto max-w-3xl space-y-8 px-8 py-10">
			{/* Header */}
			<div>
				<h1 className="font-semibold text-2xl text-text-strong-950">Billing</h1>
				<p className="mt-1 text-sm text-text-sub-600">
					Manage your plan, credits, and invoices.
				</p>
			</div>

			{/* Past-due banner */}
			{billing?.subscription.status === "past_due" && (
				<div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/40 dark:bg-amber-900/20">
					<Icon name="warning" className="h-4 w-4 shrink-0 text-amber-600" />
					<p className="text-amber-700 text-sm dark:text-amber-400">
						Your last payment failed. Please update your payment method to avoid
						service interruption.
					</p>
					<Link
						href="/billing/portal"
						className="ml-auto shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 font-medium text-white text-xs hover:bg-amber-700"
					>
						Update card
					</Link>
				</div>
			)}

			{/* Current plan card */}
			<section className="rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-6 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
				<div className="flex items-start justify-between">
					<div className="space-y-0.5">
						<div className="flex items-center gap-2">
							<h2 className="font-semibold text-text-strong-950">
								{billing?.plan.name ?? "Free"} Plan
							</h2>
							<PlanBadge status={billing?.subscription.status ?? null} />
						</div>
						<p className="text-sm text-text-sub-600">
							${billing?.plan.priceUsd ?? "0"} / month ·{" "}
							{formatCredits(billing?.plan.monthlyCredits ?? 0)} emails included
						</p>
					</div>
					{billing?.subscription.currentPeriodEnd && (
						<p className="text-right text-text-sub-600 text-xs">
							Renews{" "}
							{new Date(
								billing.subscription.currentPeriodEnd,
							).toLocaleDateString("en-US", {
								month: "short",
								day: "numeric",
								year: "numeric",
							})}
						</p>
					)}
				</div>

				<div className="mt-6">
					<UsageBar
						used={billing?.subscription.creditsRemaining ?? 0}
						total={billing?.subscription.monthlyCredits ?? 1}
					/>
				</div>
			</section>

			{/* Plan picker */}
			<section className="space-y-3">
				<h2 className="font-medium text-sm text-text-sub-600 uppercase tracking-wider">
					Choose a plan
				</h2>
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
					{plans.map((plan) => {
						const isCurrent = plan.code === currentPlanCode;
						const isUpgrade =
							PLAN_ORDER.indexOf(plan.code) >
							PLAN_ORDER.indexOf(currentPlanCode);
						const isLoading = upgrading === plan.code;

						return (
							<button
								key={plan.code}
								type="button"
								disabled={isCurrent || isLoading}
								onClick={() => !isCurrent && handleUpgrade(plan.code)}
								className={cn(
									"relative flex flex-col rounded-xl border p-4 text-left transition-all",
									isCurrent
										? "border-primary-base bg-primary-base/5 dark:bg-primary-base/10"
										: isUpgrade
											? "border-stroke-soft-100 hover:border-primary-base/50 hover:bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:hover:bg-white/5"
											: "cursor-default border-stroke-soft-100 opacity-50 dark:border-stroke-soft-100/40",
								)}
							>
								{isCurrent && (
									<span className="absolute top-2 right-2 rounded-full bg-primary-base px-1.5 py-0.5 font-medium text-[10px] text-white">
										Current
									</span>
								)}
								<span className="font-semibold text-sm text-text-strong-950">
									{plan.name}
								</span>
								<span className="mt-1 font-bold text-[22px] text-text-strong-950 tabular-nums">
									${plan.priceUsd}
									<span className="font-normal text-sm text-text-sub-600">
										/mo
									</span>
								</span>
								<span className="mt-2 text-text-sub-600 text-xs">
									{formatCredits(plan.monthlyCredits)} emails
								</span>
								{isUpgrade && !isCurrent && (
									<span className="mt-3 flex items-center gap-1 font-medium text-primary-base text-xs">
										{isLoading ? (
											<>
												<span className="h-3 w-3 animate-spin rounded-full border border-primary-base border-t-transparent" />
												Upgrading…
											</>
										) : (
											<>
												Upgrade
												<Icon name="arrow-right" className="h-3 w-3" />
											</>
										)}
									</span>
								)}
							</button>
						);
					})}
				</div>
			</section>

			{/* Invoice history */}
			{invoices.length > 0 && (
				<section className="space-y-3">
					<h2 className="font-medium text-sm text-text-sub-600 uppercase tracking-wider">
						Invoice history
					</h2>
					<div className="overflow-hidden rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-stroke-soft-100 border-b bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:bg-white/5">
									<th className="px-4 py-3 text-left font-medium text-text-sub-600">
										Invoice
									</th>
									<th className="px-4 py-3 text-left font-medium text-text-sub-600">
										Date
									</th>
									<th className="px-4 py-3 text-left font-medium text-text-sub-600">
										Status
									</th>
									<th className="px-4 py-3 text-right font-medium text-text-sub-600">
										Amount
									</th>
									<th className="px-4 py-3" />
								</tr>
							</thead>
							<tbody>
								{invoices.map((inv, i) => (
									<tr
										key={inv.lago_id}
										className={cn(
											"transition-colors",
											i !== invoices.length - 1 &&
												"border-stroke-soft-100 border-b dark:border-stroke-soft-100/40",
										)}
									>
										<td className="px-4 py-3 font-mono text-text-strong-950 text-xs">
											{inv.number}
										</td>
										<td className="px-4 py-3 text-text-sub-600">
											{new Date(inv.issuing_date).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
												year: "numeric",
											})}
										</td>
										<td className="px-4 py-3">
											<span
												className={cn(
													"inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs",
													inv.payment_status === "succeeded"
														? "bg-green-500/15 text-green-600 dark:text-green-400"
														: inv.payment_status === "failed"
															? "bg-red-500/15 text-red-600 dark:text-red-400"
															: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
												)}
											>
												{inv.payment_status === "succeeded"
													? "Paid"
													: inv.payment_status === "failed"
														? "Failed"
														: "Pending"}
											</span>
										</td>
										<td className="px-4 py-3 text-right font-medium text-text-strong-950 tabular-nums">
											{formatAmount(inv.total_amount_cents, inv.currency)}
										</td>
										<td className="px-4 py-3 text-right">
											{inv.file_url && (
												<a
													href={inv.file_url}
													target="_blank"
													rel="noreferrer"
													className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-text-sub-600 text-xs hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/5"
												>
													<Icon name="download" className="h-3 w-3" />
													PDF
												</a>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>
			)}

			{/* Empty invoice state */}
			{invoices.length === 0 && (
				<section className="flex flex-col items-center justify-center rounded-xl border border-stroke-soft-100 border-dashed py-12 text-center dark:border-stroke-soft-100/40">
					<Icon
						name="invoice"
						className="mb-3 h-8 w-8 text-text-sub-600 opacity-40"
					/>
					<p className="font-medium text-sm text-text-strong-950">
						No invoices yet
					</p>
					<p className="mt-1 text-text-sub-600 text-xs">
						Your invoices will appear here after your first billing cycle.
					</p>
				</section>
			)}
		</div>
	);
}
