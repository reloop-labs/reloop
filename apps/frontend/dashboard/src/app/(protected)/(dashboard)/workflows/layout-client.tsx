"use client";

import { WorkflowsProvider } from "#/features/workflows/components/workflows-provider";

export function WorkflowsLayoutClient({
	children,
}: {
	children: React.ReactNode;
}) {
	return <WorkflowsProvider>{children}</WorkflowsProvider>;
}
