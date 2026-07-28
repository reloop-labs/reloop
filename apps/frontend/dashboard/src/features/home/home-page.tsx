import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useSessionQuery } from "#/features/auth/session-query";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { useApiKeysQuery } from "#/features/api-keys/hooks/use-api-keys-query";
import { useDomainsQuery } from "#/features/domain/hooks/use-domains-query";
import { useBillingUsage } from "#/features/settings/billing/use-billing-usage";
import { useOrgPermissions } from "#/features/settings/use-org-permissions";
import { navigatePostAuth } from "#/utils/navigate-post-auth";
import { resolvePostAuthDestinationWithQuery } from "#/utils/post-auth-destination";
import {
	AttentionAlerts,
	buildAttentionItems,
} from "./components/attention-alerts";
import { DomainsSummaryCard } from "./components/domains-summary-card";
import { InboxSummaryCard } from "./components/inbox-summary-card";
import { OverviewHeader } from "./components/overview-header";
import { RecentEmailsCard } from "./components/recent-emails-card";
import { SendFirstEmailModal } from "./components/send-first-email-modal";
import {
	SendHealthCard,
	useSendHealthTotals,
} from "./components/send-health-card";
import {
	SetupChecklist,
	buildSetupSteps,
} from "./components/setup-checklist";

/**
 * Dashboard overview — health, attention, setup, and recent activity.
 * Redirects orgless users to onboarding / invite.
 */
export function HomePage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { data: session, isPending } = useSessionQuery();
	const {
		activeOrganization,
		organizations,
		isPending: orgPending,
	} = useActiveOrganization();
	const { canManageBilling } = useOrgPermissions();
	const [sendFirstOpen, setSendFirstOpen] = useState(false);

	const orgReady = Boolean(activeOrganization?.id) && !orgPending;

	const domainsQuery = useDomainsQuery({
		page: 1,
		limit: 20,
		status: "",
		q: "",
		enabled: orgReady,
	});
	const apiKeysQuery = useApiKeysQuery({
		page: 1,
		limit: 1,
		status: "",
		creator: "",
		q: "",
		enabled: orgReady,
	});
	const { bounceRate, hasSent } = useSendHealthTotals(orgReady);
	const billing = useBillingUsage();

	useEffect(() => {
		if (isPending || !session || orgPending) return;
		// User already has a workspace — never bounce them back to onboarding.
		if (organizations && organizations.length > 0) return;

		let cancelled = false;
		void (async () => {
			const destination =
				await resolvePostAuthDestinationWithQuery(queryClient);
			if (cancelled) return;
			if (destination !== "/") {
				await navigatePostAuth(router, destination);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [session, isPending, orgPending, organizations, router, queryClient]);

	const domains = domainsQuery.data?.domains ?? [];
	const hasDomain = (domainsQuery.data?.total ?? 0) > 0;
	const hasActiveDomain = domains.some((d) => d.status === "active");
	const firstActiveDomainId =
		domains.find((d) => d.status === "active")?.id ?? null;
	const hasApiKey = (apiKeysQuery.data?.total ?? 0) > 0;

	const setupSteps = useMemo(
		() =>
			buildSetupSteps({
				hasDomain,
				hasActiveDomain,
				hasApiKey,
				hasSentEmail: hasSent,
			}),
		[hasDomain, hasActiveDomain, hasApiKey, hasSent],
	);

	const usageRatio = useMemo(() => {
		if (!canManageBilling || !billing.data) return null;
		const monthly = billing.data.plan.monthlyCredits;
		if (!monthly || monthly <= 0) return null;
		return billing.data.subscription.creditsUsed / monthly;
	}, [billing.data, canManageBilling]);

	const attentionItems = useMemo(
		() =>
			buildAttentionItems({
				domains: domains.map((d) => ({
					id: d.id,
					domain: d.domain,
					status: d.status,
				})),
				bounceRate,
				usageRatio,
			}),
		[domains, bounceRate, usageRatio],
	);

	return (
		<div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
			<OverviewHeader
				organizationName={activeOrganization?.name}
				canSendFirstEmail={hasActiveDomain}
				onSendFirstEmail={() => setSendFirstOpen(true)}
			/>

			<AttentionAlerts items={attentionItems} />

			<SetupChecklist
				steps={setupSteps}
				onSendFirstEmail={
					hasActiveDomain ? () => setSendFirstOpen(true) : undefined
				}
			/>

			<SendHealthCard enabled={orgReady} />

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<RecentEmailsCard
					enabled={orgReady}
					onSendFirstEmail={
						hasActiveDomain ? () => setSendFirstOpen(true) : undefined
					}
				/>
				<div className="flex flex-col gap-6">
					<DomainsSummaryCard enabled={orgReady} />
					<InboxSummaryCard enabled={orgReady} />
				</div>
			</div>

			<SendFirstEmailModal
				open={sendFirstOpen}
				onOpenChange={setSendFirstOpen}
				preferredDomainId={firstActiveDomainId}
			/>
		</div>
	);
}
