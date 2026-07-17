import { useSessionQuery } from "#/features/auth/session-query";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { navigatePostAuth } from "#/utils/navigate-post-auth";
import { resolvePostAuthDestinationWithQuery } from "#/utils/post-auth-destination";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ActivityChartCard } from "./components/activity-chart-card";
import { AgentInboxCard } from "./components/agent-inbox-card";
import { AgentIntegrationsCard } from "./components/agent-integrations-card";
import { AuditLogsCard } from "./components/audit-logs-card";
import { DomainCard } from "./components/domain-card";
import { EmailsCard } from "./components/emails-card";
import { FrameworkIntegrationsCard } from "./components/framework-integrations-card";
import { WebhooksCard } from "./components/webhooks-card";

/**
 * Dashboard overview — matches Next home: org greeting + feature cards.
 * Still redirects orgless users to onboarding / invite.
 */
export function HomePage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: session, isPending } = useSessionQuery();
	const {
		user,
		activeOrganization,
		organizations,
		isPending: orgPending,
	} = useActiveOrganization();

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
				await navigatePostAuth(navigate, destination);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [
		session,
		isPending,
		orgPending,
		organizations,
		navigate,
		queryClient,
	]);

	return (
		<div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-8">
			<div className="space-y-1">
				<p className="font-medium text-sm text-text-sub-600 dark:text-white/60">
					{activeOrganization?.name}
				</p>
				<h1 className="font-semibold text-3xl text-text-strong-950 tracking-tight dark:text-white">
					{user?.email ? `${user.email}'s Account` : "Your Account"}
				</h1>

				<div className="grid gap-6 pt-6 md:grid-cols-2 lg:grid-cols-3">
					<div className="md:col-span-2 lg:col-span-2">
						<ActivityChartCard />
					</div>
					<EmailsCard />
					<AgentInboxCard />
					<DomainCard />
					<AuditLogsCard />
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="flex flex-col gap-6 lg:col-span-1">
					<WebhooksCard />
					<FrameworkIntegrationsCard />
				</div>
				<div className="h-fit lg:col-span-2">
					<AgentIntegrationsCard />
				</div>
			</div>
		</div>
	);
}
