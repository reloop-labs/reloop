import { getNextPlan } from "@reloop/pricing";
import * as FancyButton from "@reloop/ui/fancy-button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SETTINGS_MEMBER_HOME } from "#/features/dashboard/navigation";
import { resolvePlanId } from "#/features/settings/billing/plan-id";
import {
	defaultBillingMode,
	SwitchPlanModal,
	useOpenSwitchPlanModal,
} from "#/features/settings/billing/switch-plan-modal";
import {
	emailUsage,
	useBillingUsage,
} from "#/features/settings/billing/use-billing-usage";
import { useOrgPermissions } from "#/features/settings/use-org-permissions";
import { UsageSection } from "./usage-section";

export function UsagePage() {
	const router = useRouter();
	const { canManageBilling, isPending: rolePending } = useOrgPermissions();
	const { data, error: usageError, refetch: refetchUsage } = useBillingUsage();
	const openSwitchPlan = useOpenSwitchPlanModal();

	useEffect(() => {
		if (!rolePending && !canManageBilling) {
			// Members land on settings via "/settings", so send them to profile
			// instead of rendering an empty usage page.
			router.push(SETTINGS_MEMBER_HOME);
		}
	}, [canManageBilling, rolePending, router]);

	if (rolePending || !canManageBilling) {
		return null;
	}

	const currentPlanId = resolvePlanId({
		id: data?.plan.id ?? data?.subscription.planId,
		name: data?.plan.name,
	});
	// Pay as you go can still move to a monthly plan or buy more credits.
	const canUpgrade =
		data != null &&
		!data.selfHosted &&
		(currentPlanId === "payg" || getNextPlan(currentPlanId) != null);
	const prepaidBalance = data?.prepaid?.balance ?? 0;

	return (
		<div className="w-full space-y-6 pt-5">
			<div className="flex items-end justify-between gap-4">
				<div>
					<h1 className="font-semibold text-text-strong-950 text-title-h5">
						Usage
					</h1>
					<p className="mt-1 text-paragraph-sm text-text-sub-600">
						{data
							? `${emailUsage(data.subscription).remaining.toLocaleString()} of ${data.plan.monthlyCredits.toLocaleString()} emails remaining this period${
									prepaidBalance > 0
										? `, plus ${prepaidBalance.toLocaleString()} credits`
										: ""
								}.`
							: "Track your plan limits and resource usage for this billing period."}
					</p>
				</div>
				{canUpgrade ? (
					<FancyButton.Root
						variant="neutral"
						size="xsmall"
						className="shrink-0 rounded-full font-medium"
						onClick={() => openSwitchPlan(defaultBillingMode(currentPlanId))}
					>
						Upgrade plan
					</FancyButton.Root>
				) : null}
			</div>

			{usageError && (
				<div className="rounded-xl border border-error-light bg-error-lighter p-4 text-error-base text-paragraph-sm">
					Failed to load usage data.{" "}
					<button
						type="button"
						onClick={() => void refetchUsage()}
						className="underline"
					>
						Retry
					</button>
				</div>
			)}

			<UsageSection />

			<SwitchPlanModal
				currentPlanId={currentPlanId}
				creditsExpireAt={data?.prepaid?.expiresAt}
			/>
		</div>
	);
}
