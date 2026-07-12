"use client";

import { useBillingUsage } from "@fe/dashboard/hooks/useBillingUsage";
import { useOrgPermissions } from "@fe/dashboard/hooks/use-org-permissions";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Skeleton = ({ className }: { className?: string }) => (
	<div
		className={`animate-pulse rounded bg-bg-soft-200 dark:bg-white/10 ${className ?? ""}`}
	/>
);

function formatNumber(num: number): string {
	return num.toLocaleString();
}

const UsagePage = () => {
	const router = useRouter();
	const { canManageBilling, isPending: rolePending } = useOrgPermissions();

	const {
		data: usageData,
		isLoading: usageLoading,
		error: usageError,
		refetch: refetchUsage,
	} = useBillingUsage();

	useEffect(() => {
		if (!rolePending && !canManageBilling) {
			router.replace("/settings");
		}
	}, [canManageBilling, rolePending, router]);

	if (rolePending || !canManageBilling) {
		return null;
	}

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
						Usage
					</h1>
					<p className="mt-1 text-paragraph-sm text-text-sub-600 dark:text-white/60">
						Email sends and rate limits for your organization.
					</p>
				</div>
			</div>

			{/* Error state */}
			{usageError && (
				<div className="rounded-xl border border-error-light bg-error-lighter p-4 text-error-base text-paragraph-sm">
					Failed to load usage data.{" "}
					<button type="button" onClick={refetchUsage} className="underline">
						Retry
					</button>
				</div>
			)}

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
								onClick={() => router.push("/settings/billing")}
							>
								<Icon name="arrow-top-circle" className="h-3.5 w-3.5" />
								Upgrade Plan
							</Button.Root>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UsagePage;
