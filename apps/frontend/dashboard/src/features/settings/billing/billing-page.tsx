import {
	defaultPlan,
	formatPrice,
	getNextPlan,
	getPlanById,
	type PlanId,
	pricingPlans,
} from "@reloop/pricing";
import * as Badge from "@reloop/ui/badge";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { useNavigate } from "#/lib/navigation";
import { useEffect, useState } from "react";
import { AnimatedForwardButton } from "#/features/dashboard/animated-forward-button";
import { SETTINGS_MEMBER_HOME } from "#/features/dashboard/navigation";
import { useOrgPermissions } from "#/features/settings/use-org-permissions";
import { requestPlanSupport } from "./request-support";
import { SwitchPlanModal } from "./switch-plan-modal";
import { useBillingUsage } from "./use-billing-usage";

const CARD =
	"rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/30 p-5 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]";

function resolvePlanId(name: string | undefined): PlanId {
	const normalized = (name ?? "free").toLowerCase();
	const match = pricingPlans.find((p) => p.id === normalized);
	return match?.id ?? "free";
}

export function BillingPage() {
	const navigate = useNavigate();
	const [switchOpen, setSwitchOpen] = useState(false);
	const { canManageBilling, isPending: rolePending } = useOrgPermissions();
	const {
		data: usageData,
		error: usageError,
		refetch: refetchUsage,
	} = useBillingUsage();

	useEffect(() => {
		if (!rolePending && !canManageBilling) {
			void navigate({
				to: SETTINGS_MEMBER_HOME,
				search: { from: undefined },
			});
		}
	}, [canManageBilling, rolePending, navigate]);

	if (rolePending || !canManageBilling) {
		return null;
	}

	const error = usageError;
	const currentPlanId = resolvePlanId(usageData?.plan?.name);
	const currentPlan = getPlanById(currentPlanId) ?? defaultPlan;
	const nextPlan = getNextPlan(currentPlanId);

	const nextPlanPriceLabel = nextPlan
		? nextPlan.monthlyPrice === null
			? nextPlan.priceSubline
			: `${formatPrice(nextPlan.monthlyPrice)} ${nextPlan.priceSubline}`
		: "";

	const handleUpgrade = () => {
		if (!nextPlan) return;
		const message =
			nextPlan.monthlyPrice === null
				? `Hi! I'm interested in the ${nextPlan.name} plan. Can you help me get set up?`
				: `Hi! I'd like to upgrade to the ${nextPlan.name} plan (${formatPrice(
						nextPlan.monthlyPrice,
					)}/month). Can you help me with that?`;
		requestPlanSupport(message);
	};

	return (
		<div className="w-full space-y-6 pt-5">
			<div className="flex items-end justify-between">
				<div>
					<h1 className="font-semibold text-text-strong-950 text-title-h5">
						Billing
					</h1>
					<p className="mt-1 text-paragraph-sm text-text-sub-600">
						For questions about billing,{" "}
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
					onClick={() =>
						void navigate({
							to: "/settings/billing/plans",
							search: { from: undefined },
						})
					}
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
								Current
							</span>
						</div>
						<p className="mt-1 font-medium text-paragraph-sm text-text-sub-600">
							{currentPlan.priceSubline}
						</p>
					</div>
					<FancyButton.Root
						variant="basic"
						size="xsmall"
						className="rounded-full font-medium"
						onClick={() => setSwitchOpen(true)}
					>
						Manage
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
								onClick={() =>
									void navigate({
										to: "/settings/billing/plans",
										search: { from: undefined },
									})
								}
							>
								View all plans
							</FancyButton.Root>
							<FancyButton.Root
								variant="blue"
								size="small"
								className="rounded-full font-semibold"
								onClick={handleUpgrade}
							>
								Upgrade now
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
}
