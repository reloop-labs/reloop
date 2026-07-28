import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useSessionQuery } from "#/features/auth/session-query";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
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
import {
	SendHealthCard,
	useSendHealthTotals,
} from "./components/send-health-card";

/**
 * Dashboard overview — health, attention, and recent activity.
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

	const orgReady = Boolean(activeOrganization?.id) && !orgPending;

	const domainsQuery = useDomainsQuery({
		page: 1,
		limit: 20,
		status: "",
		q: "",
		enabled: orgReady,
	});
	const { bounceRate } = useSendHealthTotals(orgReady);
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
	const readyDomains = useMemo(
		() =>
			domains
				.filter((d) => d.status === "active")
				.map((d) => ({ id: d.id, domain: d.domain })),
		[domains],
	);
	const hasActiveDomain = readyDomains.length > 0;
	const readyDomainName = readyDomains[0]?.domain ?? null;

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
			<OverviewHeader userEmail={session?.user?.email} />

			<AttentionAlerts items={attentionItems} />

			<SendHealthCard enabled={orgReady} />

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<RecentEmailsCard
					enabled={orgReady}
					canSendFirstEmail={hasActiveDomain}
					readyDomainName={readyDomainName}
				/>
				<div className="flex flex-col gap-6">
					<DomainsSummaryCard enabled={orgReady} />
					<InboxSummaryCard enabled={orgReady} />
				</div>
			</div>
		</div>
	);
}
