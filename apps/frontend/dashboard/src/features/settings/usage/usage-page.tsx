import { useNavigate } from "#/lib/navigation";
import { useEffect } from "react";
import { SETTINGS_MEMBER_HOME } from "#/features/dashboard/navigation";
import { useBillingUsage } from "#/features/settings/billing/use-billing-usage";
import { useOrgPermissions } from "#/features/settings/use-org-permissions";
import { UsageSection } from "./usage-section";

export function UsagePage() {
	const navigate = useNavigate();
	const { canManageBilling, isPending: rolePending } = useOrgPermissions();
	const { error: usageError, refetch: refetchUsage } = useBillingUsage();

	useEffect(() => {
		if (!rolePending && !canManageBilling) {
			// Members land on settings via "/settings" — send them to profile
			// instead of rendering an empty usage page.
			void navigate({
				to: SETTINGS_MEMBER_HOME,
				search: { from: undefined },
			});
		}
	}, [canManageBilling, rolePending, navigate]);

	if (rolePending || !canManageBilling) {
		return null;
	}

	return (
		<div className="w-full space-y-6 pt-5">
			<div>
				<h1 className="font-semibold text-text-strong-950 text-title-h5">
					Usage
				</h1>
				<p className="mt-1 text-paragraph-sm text-text-sub-600">
					Track your plan limits and resource usage for this billing period.
				</p>
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
		</div>
	);
}
