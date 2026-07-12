"use client";

import { AnimatedForwardButton } from "@fe/dashboard/components/animated-forward-button";
import { useOrgPermissions } from "@fe/dashboard/hooks/use-org-permissions";
import { useBillingUsage } from "@fe/dashboard/hooks/useBillingUsage";
import { useUIStore } from "@fe/dashboard/store/use-ui-store";
import {
	defaultPlan,
	formatPrice,
	getNextPlan,
	getPlanById,
	type PlanId,
	pricingPlans,
} from "@reloop/pricing";
import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SwitchPlanModal } from "./switch-plan-modal";

const CARD =
	"rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/30 p-5 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]";

function resolvePlanId(name: string | undefined): PlanId {
	const normalized = (name ?? "free").toLowerCase();
	const match = pricingPlans.find((p) => p.id === normalized);
	return match?.id ?? "free";
}

const BillingPage = () => {
	const router = useRouter();
	const setIsAiPanelOpen = useUIStore((s) => s.setIsAiPanelOpen);
	const setAiPanelActiveTab = useUIStore((s) => s.setAiPanelActiveTab);
	const [switchOpen, setSwitchOpen] = useState(false);

	const openSupport = () => {
		setAiPanelActiveTab("support");
		setIsAiPanelOpen(true);
	};
	const { canManageBilling, isPending: rolePending } = useOrgPermissions();

	const {
		data: usageData,
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

	const error = usageError;

	// Resolve the current plan and the next tier to upgrade to
	const currentPlanId = resolvePlanId(usageData?.plan?.name);
	const currentPlan = getPlanById(currentPlanId) ?? defaultPlan;
	const nextPlan = getNextPlan(currentPlanId);

	// Format the next plan's price line
	const nextPlanPriceLabel = nextPlan
		? nextPlan.monthlyPrice === null
			? nextPlan.priceSubline
			: `${formatPrice(nextPlan.monthlyPrice)} ${nextPlan.priceSubline}`
		: "";

	return (
		<div className="w-full space-y-6 pt-5">
			{/* Header */}
			<div className="flex items-end justify-between">
				<div>
					<h1 className="font-semibold text-text-strong-950 text-title-h5">
						Billing
					</h1>
					<p className="mt-1 text-paragraph-sm text-text-sub-600">
						For questions about billing,{" "}
						<button
							type="button"
							onClick={openSupport}
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

			{/* Error state */}
			{error && (
				<div className="rounded-xl border border-error-light bg-error-lighter p-4 text-error-base text-paragraph-sm">
					Failed to load billing details.{" "}
					<button type="button" onClick={refetchUsage} className="underline">
						Retry
					</button>
				</div>
			)}

			{/* Card 1: Current plan */}
			<div className={CARD}>
				<div className="flex items-center justify-between">
					<div>
						<div className="flex items-center gap-2">
							<h2 className="font-medium text-label-md text-text-strong-950">
								{currentPlan.name} plan
							</h2>
							<span className="inline-flex h-5 items-center gap-1.5 rounded-full border border-stroke-soft-200 bg-bg-white-0 pr-2 pl-1.5 font-medium text-label-xs text-text-sub-600 dark:border-stroke-soft-100/40 dark:bg-white/[0.04]">
								Current
							</span>
						</div>
						<p className="mt-1 font-medium text-paragraph-sm text-text-sub-600">
							{currentPlan.priceSubline}
						</p>
					</div>
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xxsmall"
						className="rounded-full"
						onClick={() => setSwitchOpen(true)}
					>
						Manage
					</Button.Root>
				</div>
			</div>

			{/* Card 2: Upgrade to the next tier */}
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
							<p className="mt-1 font-medium text-paragraph-sm text-text-sub-600">
								{nextPlanPriceLabel}
							</p>
						</div>
						<div className="flex items-center gap-3">
							<Button.Root
								variant="neutral"
								mode="ghost"
								size="small"
								className="font-medium text-text-sub-600 hover:text-text-strong-950"
								onClick={() => router.push("/settings/billing/plans")}
							>
								View all plans
							</Button.Root>
							<Button.Root
								variant="neutral"
								mode="filled"
								size="small"
								className="rounded-full font-semibold"
							>
								Upgrade now
							</Button.Root>
						</div>
					</div>

					{/* Features checklist (3 columns grid layout) */}
					<div className="grid grid-cols-1 gap-x-6 gap-y-3.5 pt-5 sm:grid-cols-3">
						{nextPlan.features.map((feature) => (
							<div key={feature} className="flex items-start gap-2">
								<Icon
									name="check"
									className="mt-0.5 h-4 w-4 shrink-0 text-primary-base"
								/>
								<span className="text-paragraph-sm text-text-sub-600">
									{feature}
								</span>
							</div>
						))}
					</div>
				</div>
			) : (
				<div className={CARD}>
					<h2 className="font-medium text-label-md text-text-strong-950">
						You're on the {currentPlan.name} plan
					</h2>
					<p className="mt-1 text-paragraph-sm text-text-sub-600">
						You have access to the highest plan available.
					</p>
				</div>
			)}

			{/* Card 4: Recent Invoices */}
			<div className="space-y-3">
				<h2 className="font-semibold text-paragraph-lg text-text-strong-950">
					Recent invoices
				</h2>
				<div className="flex h-32 items-center justify-center rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/30 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
					<p className="text-paragraph-sm text-text-soft-400">
						No invoices yet
					</p>
				</div>
			</div>

			<SwitchPlanModal
				open={switchOpen}
				onOpenChange={setSwitchOpen}
				currentPlanId={currentPlanId}
			/>
		</div>
	);
};

export default BillingPage;
