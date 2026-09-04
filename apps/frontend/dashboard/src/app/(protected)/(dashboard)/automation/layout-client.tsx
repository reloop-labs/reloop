"use client";

import { AutomationShell } from "#/features/workflows/automation-shell";
import { WorkflowsProvider } from "#/features/workflows/components/workflows-provider";

export function WorkflowsLayoutClient({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<WorkflowsProvider>
			<AutomationShell>{children}</AutomationShell>
		</WorkflowsProvider>
	);
}
