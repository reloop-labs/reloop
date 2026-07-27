"use client";

import { useSessionQuery } from "#/features/auth/session-query";
import { DashboardContentSkeleton } from "#/features/dashboard/dashboard-content-skeleton";
import { DashboardShell } from "#/features/dashboard/dashboard-shell";

export function DashboardLayoutClient({
	children,
}: {
	children: React.ReactNode;
}) {
	const { data: session, isPending } = useSessionQuery();

	return (
		<DashboardShell>
			{isPending || !session ? <DashboardContentSkeleton /> : children}
		</DashboardShell>
	);
}
