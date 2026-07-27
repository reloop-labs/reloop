"use client";

import AgentInboxSectionLayout from "#/features/agent-inbox/inbox-root-layout";
import { useSessionQuery } from "#/features/auth/session-query";
import { DashboardContentSkeleton } from "#/features/dashboard/dashboard-content-skeleton";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";

export function InboxLayoutClient({ children }: { children: React.ReactNode }) {
	const { data: session, isPending } = useSessionQuery();
	const { isMembershipReady } = useActiveOrganization();

	if (isPending || !session || !isMembershipReady) {
		return (
			<div className="flex h-screen flex-col overflow-hidden bg-bg-weak-50 dark:bg-black">
				<DashboardContentSkeleton />
			</div>
		);
	}

	return <AgentInboxSectionLayout>{children}</AgentInboxSectionLayout>;
}
