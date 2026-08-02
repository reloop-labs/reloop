"use client";

import { useSessionQuery } from "#/features/auth/session-query";
import { CommandMenuGlobal } from "#/features/dashboard/command-menu";
import { CommandMenuProvider } from "#/features/dashboard/command-menu-context";
import { DashboardContentSkeleton } from "#/features/dashboard/dashboard-content-skeleton";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";

export function TemplateEditorLayoutClient({
	children,
}: {
	children: React.ReactNode;
}) {
	const { data: session, isPending } = useSessionQuery();
	const { isMembershipReady } = useActiveOrganization();

	return (
		<CommandMenuProvider>
			<div className="flex h-screen flex-col overflow-hidden bg-bg-weak-50 dark:bg-black">
				{isPending || !session || !isMembershipReady ? (
					<DashboardContentSkeleton />
				) : (
					children
				)}
				<CommandMenuGlobal />
			</div>
		</CommandMenuProvider>
	);
}

