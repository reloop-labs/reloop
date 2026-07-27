"use client";

import AgentInboxSectionLayout from "#/features/agent-inbox/inbox-root-layout";
import { useSessionQuery } from "#/features/auth/session-query";
import { DashboardContentSkeleton } from "#/features/dashboard/dashboard-content-skeleton";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";

export function InboxLayoutClient({ children }: { children: React.ReactNode }) {
	const { data: session, isPending } = useSessionQuery();
	const { isMembershipReady } = useActiveOrganization();

	const loading = isPending || !session || !isMembershipReady;

	return (
		<AgentInboxSectionLayout>
			{loading ? (
				<div className="flex h-screen flex-col overflow-hidden bg-bg-weak-50 dark:bg-black">
					<DashboardContentSkeleton />
					<div className="hidden">{children}</div>
				</div>
			) : (
				children
			)}
		</AgentInboxSectionLayout>
	);
}
