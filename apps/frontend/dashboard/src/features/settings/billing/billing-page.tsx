import {
	defaultPlan,
	formatPrice,
	getNextPlan,
	getPlanById,
	isCheckoutPlanId,
} from "@reloop/pricing";
import * as Badge from "@reloop/ui/badge";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import { AnimatedForwardButton } from "#/features/dashboard/animated-forward-button";
import { SETTINGS_MEMBER_HOME } from "#/features/dashboard/navigation";
import { useOrgPermissions } from "#/features/settings/use-org-permissions";
import { resolvePlanId } from "./plan-id";
import { requestPlanSupport } from "./request-support";
import { SwitchPlanModal } from "./switch-plan-modal";
import {
	contactEnterprise,
	useBillingCheckout,
	useBillingPortal,
} from "./use-billing-actions";
import { useBillingPeriods, useBillingUsage } from "./use-billing-usage";

const CARD =
	"rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/30 p-5 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]";

function formatPeriodDate(value: string): string {
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "";
	return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function BillingPage() {
	const router = useRouter();
	const [switchOpen, setSwitchOpen] = useState(false);
	const { canManageBilling, isPending: rolePending } = useOrgPermissions();
	const {
		data: usageData,
		error: usageError,
		refetch: refetchUsage,
	} = useBillingUsage();
	const periodsQuery = useBillingPeriods();
	const checkout = useBillingCheckout();
	const portal = useBillingPortal();

	useEffect(() => {
		if (!rolePending && !canManageBilling) {
			router.push(SETTINGS_MEMBER_HOME);
		}
	}, [canManageBilling, rolePending, router]);

	if (rolePending || !canManageBilling) {
		return null;
	}

	const error = usageError;
	const currentPlanId = resolvePlanId({
		id: usageData?.plan.id ?? usageData?.subscription.planId,
		name: usageData?.plan.name,
	});
	const currentPlan = getPlanById(currentPlanId) ?? defaultPlan;
	const nextPlan = getNextPlan(currentPlanId);
	const remaining = usageData?.subscription.creditsRemaining ?? 0;
	const monthlyIncluded =
		usageData?.plan.entitlements?.monthlyEmails ??
		usageData?.plan.monthlyCredits ??
		0;

	const nextPlanPriceLabel = nextPlan
		? nextPlan.monthlyPrice === null
			? nextPlan.priceSubline
			: `${formatPrice(nextPlan.monthlyPrice)} ${nextPlan.priceSubline}`
		: "";

	const handleUpgrade = () => {
		if (!nextPlan) return;
		if (nextPlan.monthlyPrice === null) {
			contactEnterprise();
			return;
		}
		if (isCheckoutPlanId(nextPlan.id)) {
			checkout.mutate(nextPlan.id);
			return;
		}
		contactEnterprise();
	};

	const handleManage = () => {
		void portal.mutateAsync().catch(() => {
			setSwitchOpen(true);
		});
	};

	const periods = periodsQuery.data ?? [];

	return (
		<div className="w-full space-y-6 pt-5">
			<div className="flex items-end justify-between">
				<div>
					<h1 className="font-semibold text-text-strong-950 text-title-h5">
						Billing
					</h1>
					<p className="mt-1 text-paragraph-sm text-text-sub-600">
						{usageData
							? `${remaining.toLocaleString()} of ${monthlyIncluded.toLocaleString()} emails remaining this period.`
							: "Plan, usage, and invoices for this organization."}{" "}
						For questions,{" "}
						<button
							type="button"
							onClick={() =>
								requestPlanSupport(
									"Hi! I have a question about billing. Can you help?",
								)
							}
							className="-mx-1 cursor-pointer rounded-full px-1 font-medium text-text-strong-950 transition-colors hover:bg-bg-weak-50 dark:hover:bg-white/5"
						>
							contact us
						</button>
					</p>
				</div>
				<AnimatedForwardButton
					label="All plans"
					onClick={() => router.push("/settings/billing/plans")}
				/>
			</div>

			{error && (
				<div className="rounded-xl border border-error-light bg-error-lighter p-4 text-error-base text-paragraph-sm">
					Failed to load billing details.{" "}
					<button
						type="button"
						onClick={() => void refetchUsage()}
						className="underline"
					>
						Retry
					</button>
				</div>
			)}

			<div className={CARD}>
				<div className="flex items-center justify-between">
					<div>
						<div className="flex items-center gap-2">
							<h2 className="font-medium text-label-md text-text-strong-950">
								{currentPlan.name} plan
							</h2>
							<span className="inline-flex h-5 items-center rounded-full bg-bg-weak-50 px-2 font-medium text-label-xs text-text-sub-600 dark:bg-white/[0.06]">
								{usageData?.subscription.status === "past_due"
									? "Past due"
									: "Current"}
							</span>
							{usageData?.subscription.cancelAtPeriodEnd ? (
								<span className="inline-flex h-5 items-center rounded-full bg-warning-lighter px-2 font-medium text-label-xs text-warning-base">
									Cancels at period end
								</span>
							) : null}
						</div>
						<p className="mt-1 font-medium text-paragraph-sm text-text-sub-600">
							{currentPlan.monthlyPrice === null
								? currentPlan.priceSubline
								: currentPlan.monthlyPrice === 0
									? "Free for everyone"
									: `${formatPrice(currentPlan.monthlyPrice)} / month`}
							{monthlyIncluded > 0
								? ` · ${monthlyIncluded.toLocaleString()} emails included`
								: null}
						</p>
					</div>
					<FancyButton.Root
						variant="basic"
						size="xsmall"
						className="rounded-full font-medium"
						disabled={portal.isPending}
						onClick={handleManage}
					>
						{portal.isPending ? "Opening…" : "Manage"}
					</FancyButton.Root>
				</div>
			</div>

			{nextPlan ? (
				<div className={CARD}>
					<div className="flex items-center justify-between border-stroke-soft-100 border-b pb-5 dark:border-stroke-soft-100/40">
						<div>
							<div className="flex items-center gap-2">
								<h2 className="font-medium text-label-md text-text-strong-950">
									Upgrade to {nextPlan.name} plan
								</h2>
								{nextPlan.badge && (
									<Badge.Root size="small" variant="lighter" color="blue">
										{nextPlan.badge}
									</Badge.Root>
								)}
							</div>
							<p className="mt-1 font-medium text-[12px] text-text-sub-600">
								{nextPlanPriceLabel}
							</p>
						</div>
						<div className="flex items-center gap-3">
							<FancyButton.Root
								variant="ghost"
								size="small"
								className="rounded-full font-medium"
								onClick={() => router.push("/settings/billing/plans")}
							>
								View all plans
							</FancyButton.Root>
							<FancyButton.Root
								variant="blue"
								size="small"
								className="rounded-full font-semibold"
								disabled={checkout.isPending}
								onClick={handleUpgrade}
							>
								{checkout.isPending ? "Redirecting…" : "Upgrade now"}
							</FancyButton.Root>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-x-6 gap-y-3 pt-5 sm:grid-cols-2">
						{nextPlan.features.map((feature) => (
							<div key={feature} className="flex items-center gap-2">
								<Icon
									name="check-circle"
									className="h-4 w-4 shrink-0 text-text-sub-600"
								/>
								<span className="whitespace-nowrap font-medium text-paragraph-sm text-text-sub-600">
									{feature}
								</span>
							</div>
						))}
					</div>
				</div>
			) : (
				<div className={CARD}>
					<h2 className="font-medium text-label-md text-text-strong-950">
						You&apos;re on the {currentPlan.name} plan
					</h2>
					<p className="mt-1 text-paragraph-sm text-text-sub-600">
						You have access to the highest plan available.
					</p>
				</div>
			)}

			<div className="space-y-3">
				<h2 className="font-semibold text-paragraph-lg text-text-strong-950">
					Previous periods
				</h2>
				{periods.length === 0 ? (
					<div className="flex h-32 items-center justify-center rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/30 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
						<p className="text-paragraph-sm text-text-soft-400">
							No closed months yet. This period stays live until it resets.
						</p>
					</div>
				) : (
					<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
						{periods.map((period, index) => (
							<div
								key={period.id}
								className={`flex items-center justify-between px-5 py-3.5 ${
									index < periods.length - 1
										? "border-stroke-soft-100 border-b dark:border-stroke-soft-100/40"
										: ""
								}`}
							>
								<div>
									<p className="font-medium text-paragraph-sm text-text-strong-950">
										{formatPeriodDate(period.periodStart)} –{" "}
										{formatPeriodDate(period.periodEnd)}
									</p>
									<p className="text-paragraph-xs text-text-sub-600 capitalize">
										{period.planId} · {period.includedEmails.toLocaleString()}{" "}
										included
									</p>
								</div>
								<p className="font-medium text-paragraph-sm text-text-strong-950 tabular-nums">
									{period.emailsUsed.toLocaleString()} sent
									{period.emailsOverage > 0
										? ` · ${period.emailsOverage.toLocaleString()} overage`
										: ""}
								</p>
							</div>
						))}
					</div>
				)}
			</div>

			<SwitchPlanModal
				open={switchOpen}
				onOpenChange={setSwitchOpen}
				currentPlanId={currentPlanId}
			/>
		</div>
	);
}
