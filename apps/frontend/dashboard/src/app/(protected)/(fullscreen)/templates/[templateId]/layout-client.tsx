"use client";

import { useSessionQuery } from "#/features/auth/session-query";
import { CommandMenuGlobal } from "#/features/dashboard/command-menu";
import { DashboardContentSkeleton } from "#/features/dashboard/dashboard-content-skeleton";

export function TemplateEditorLayoutClient({
	children,
}: {
	children: React.ReactNode;
}) {
	const { data: session, isPending } = useSessionQuery();

	return (
		<div className="flex h-screen flex-col overflow-hidden bg-bg-weak-50 dark:bg-black">
			{isPending || !session ? <DashboardContentSkeleton /> : children}
			<CommandMenuGlobal />
		</div>
	);
}
