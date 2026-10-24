import {
	creditPack,
	defaultPlan,
	formatPrice,
	getNextPlan,
	getPlanById,
	isCheckoutPlanId,
	planDisplayName,
} from "@reloop/pricing";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { useRouter } from "next/navigation";

import { useEffect, useRef } from "react";
import { AnimatedForwardButton } from "#/features/dashboard/animated-forward-button";
import { SETTINGS_MEMBER_HOME } from "#/features/dashboard/navigation";
import { openHelpWithMessage } from "#/features/help/open-help";
import { useOrgPermissions } from "#/features/settings/use-org-permissions";
import { GrantedPlanBanner } from "./granted-plan-banner";
import { resolvePlanId } from "./plan-id";
import { SwitchPlanModal, useOpenSwitchPlanModal } from "./switch-plan-modal";
import {
	contactEnterprise,
	useBillingCheckout,
	useBillingPortal,
} from "./use-billing-actions";
import {
	emailUsage,
	useBillingPeriods,
	useBillingUsage,
} from "./use-billing-usage";

const CARD =
	"rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/30 p-5 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]";

function formatPeriodDate(value: string): string {
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "";
	return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatExpiryDate(value: string): string {
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "";
	return d.toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export function BillingPage() {
	const router = useRouter();
	const setPlanModal = useOpenSwitchPlanModal();
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

	// Back from Polar checkout: the payment webhook can land a moment later,
	// so refetch a few times until the new plan or credits show up.
	const refetchUsageRef = useRef(refetchUsage);
	refetchUsageRef.current = refetchUsage;
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		if (params.get("checkout") !== "success") return;
		const timers = [2_000, 5_000, 10_000].map((ms) =>
			window.setTimeout(() => void refetchUsageRef.current(), ms),
		);
		return () => {
			for (const t of timers) window.clearTimeout(t);
		};
	}, []);

	if (rolePending || !canManageBilling) {
		return null;
	}

	if (usageData?.selfHosted) {
		return (
			<div className="w-full space-y-6 pt-5">
				<div>
					<h1 className="font-semibold text-text-strong-950 text-title-h5">
						Billing
					</h1>
					<p className="mt-1 text-paragraph-sm text-text-sub-600">
						This Reloop is self-hosted. No plan limits apply and there is
						nothing to pay.
					</p>
				</div>
			</div>
		);
	}

	const error = usageError;
	const currentPlanId = resolvePlanId({
		id: usageData?.plan.id ?? usageData?.subscription.planId,
		name: usageData?.plan.name,
	});
	const isPayg = currentPlanId === "payg";
	const currentPlan = getPlanById(currentPlanId) ?? defaultPlan;
	const planName = planDisplayName(currentPlanId);
	// Pay as you go sits between Free and Pro, so Pro is the next step up.
	const nextPlan = isPayg
		? getPlanById("individual")
		: getNextPlan(currentPlanId);
	const monthlyIncluded =
		usageData?.plan.entitlements?.monthlyEmails ??
		usageData?.plan.monthlyCredits ??
		0;
	const remaining = usageData
		? emailUsage(usageData.subscription).remaining
		: 0;
	const prepaidBalance = usageData?.prepaid?.balance ?? 0;
	const prepaidExpiresAt = usageData?.prepaid?.expiresAt ?? null;
	const hasCredits = prepaidBalance > 0 || prepaidExpiresAt != null;
	const canBuyCredits = currentPlanId !== "enterprise";

	const nextPlanPriceLabel = nextPlan
		? nextPlan.monthlyPrice === null
			? nextPlan.priceSubline
			: `${formatPrice(nextPlan.monthlyPrice)} ${nextPlan.priceSubline}`
		: "";

	const handleUpgrade = () => {
		if (!nextPlan) return;
		if (nextPlan.monthlyPrice === null) {
			contactEnterprise(router);
			return;
		}
		if (isCheckoutPlanId(nextPlan.id)) {
			checkout.mutate(nextPlan.id);
			return;
		}
		contactEnterprise(router);
	};

	const handleManage = () => {
		void portal.mutateAsync().catch(() => {
			setPlanModal("monthly");
		});
	};

	const periods = periodsQuery.data ?? [];
	// Nothing to manage in the billing portal on Free, Pay as you go (no
	// subscription) or an admin-granted plan.
	const canManageSubscription =
		currentPlanId !== "free" && !isPayg && !usageData?.grantedPlan;

	return (
		<div className="w-full space-y-6 pt-5">
			<div className="flex items-end justify-between">
				<div>
					<h1 className="font-semibold text-text-strong-950 text-title-h5">
						Billing
					</h1>
					<p className="mt-1 text-paragraph-sm text-text-sub-600">
						{usageData
							? `${remaining.toLocaleString()} of ${monthlyIncluded.toLocaleString()} emails remaining this period${
									prepaidBalance > 0
										? `, plus ${prepaidBalance.toLocaleString()} credits`
										: ""
								}.`
							: "Plan, usage, and invoices for this organization."}{" "}
						For questions,{" "}
						<button
							type="button"
							onClick={() =>
								openHelpWithMessage(
									router,
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

			{usageData?.grantedPlan ? (
				<GrantedPlanBanner
					planName={usageData.grantedPlan.name}
					grantedAt={usageData.grantedPlan.grantedAt}
				/>
			) : null}

			<div className={CARD}>
				<div className="flex items-center justify-between gap-4">
					<div className="min-w-0">
						<div className="flex items-center gap-2">
							<h2 className="font-medium text-label-md text-text-strong-950">
								{isPayg ? planName : `${planName} plan`}
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
							{isPayg
								? "No subscription"
								: currentPlan.monthlyPrice === null
									? currentPlan.priceSubline
									: currentPlan.monthlyPrice === 0
										? "Free for everyone"
										: `${formatPrice(currentPlan.monthlyPrice)} / month`}
							{monthlyIncluded > 0
								? ` · ${monthlyIncluded.toLocaleString()} emails included`
								: null}
						</p>
						{canBuyCredits ? (
							<p className="mt-1 font-medium text-paragraph-xs text-text-soft-400">
								{hasCredits
									? `${prepaidBalance.toLocaleString()} credits left${
											prepaidExpiresAt
												? ` · Valid until ${formatExpiryDate(prepaidExpiresAt)}`
												: ""
										}`
									: `Need more? Buy credits once: $${creditPack.usdPerThousand.toFixed(2)} per 1,000 emails, valid for ${creditPack.validityMonths} months.`}
							</p>
						) : null}
					</div>
					<div className="flex shrink-0 items-center gap-2">
						{canBuyCredits ? (
							<FancyButton.Root
								variant={hasCredits || isPayg ? "neutral" : "basic"}
								size="xsmall"
								className="shrink-0 rounded-full font-medium"
								onClick={() => setPlanModal("credits")}
							>
								{hasCredits ? "Buy more" : "Buy credits"}
							</FancyButton.Root>
						) : null}
						{canManageSubscription ? (
							<FancyButton.Root
								variant="basic"
								size="xsmall"
								className="rounded-full font-medium"
								disabled={portal.isPending}
								onClick={handleManage}
							>
								{portal.isPending ? "Opening…" : "Manage"}
							</FancyButton.Root>
						) : null}
					</div>
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
								variant="neutral"
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
				currentPlanId={currentPlanId}
				creditsExpireAt={prepaidExpiresAt}
			/>
		</div>
	);
}
