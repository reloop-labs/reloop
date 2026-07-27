"use client";

import AgentInboxSectionLayout from "#/features/agent-inbox/inbox-root-layout";
import { useSessionQuery } from "#/features/auth/session-query";
import { DashboardContentSkeleton } from "#/features/dashboard/dashboard-content-skeleton";

export function InboxLayoutClient({ children }: { children: React.ReactNode }) {
	const { data: session, isPending } = useSessionQuery();

	if (isPending || !session) {
		return (
			<div className="flex h-screen flex-col overflow-hidden bg-bg-weak-50 dark:bg-black">
				<DashboardContentSkeleton />
			</div>
		);
	}

	return <AgentInboxSectionLayout>{children}</AgentInboxSectionLayout>;
}
