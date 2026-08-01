"use client";

import { useSessionQuery } from "#/features/auth/session-query";
import { DashboardContentSkeleton } from "#/features/dashboard/dashboard-content-skeleton";
import { DashboardShell } from "#/features/dashboard/dashboard-shell";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";

export function DashboardLayoutClient({
	children,
}: {
	children: React.ReactNode;
}) {
	const { data: session, isPending } = useSessionQuery();
	const { isMembershipReady } = useActiveOrganization();

	// Keep shell (sidebar + header) mounted for the whole reload; only the main
	// panel shows a loader until session and workspace membership are ready.
	const showContentSkeleton = isPending || !session || !isMembershipReady;

	return (
		<DashboardShell>
			{showContentSkeleton ? <DashboardContentSkeleton /> : children}
		</DashboardShell>
	);
}
