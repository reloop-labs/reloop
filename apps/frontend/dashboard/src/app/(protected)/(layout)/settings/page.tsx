"use client";

import { AnimatedForwardButton } from "@fe/dashboard/components/animated-forward-button";
import { useOrgPermissions } from "@fe/dashboard/hooks/use-org-permissions";
import { useBillingUsage } from "@fe/dashboard/hooks/useBillingUsage";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UsageSection } from "./usage-section";

const UsagePage = () => {
	const router = useRouter();
	const { canManageBilling, isPending: rolePending } = useOrgPermissions();
	const { error: usageError, refetch: refetchUsage } = useBillingUsage();

	useEffect(() => {
		if (!rolePending && !canManageBilling) {
			router.replace("/settings");
		}
	}, [canManageBilling, rolePending, router]);

	if (rolePending || !canManageBilling) {
		return null;
	}

	return (
		<div className="w-full space-y-6 pt-5">
			{/* Header */}
			<div className="flex items-end justify-between">
				<div>
					<h1 className="font-semibold text-text-strong-950 text-title-h5">
						Usage
					</h1>
					<p className="mt-1 text-paragraph-sm text-text-sub-600">
						Track your plan limits and resource usage for this billing period.
					</p>
				</div>
				<AnimatedForwardButton
					label="Manage billing"
					onClick={() => router.push("/settings/billing")}
				/>
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

			<UsageSection onUpgrade={() => router.push("/settings/billing")} />
		</div>
	);
};

export default UsagePage;
