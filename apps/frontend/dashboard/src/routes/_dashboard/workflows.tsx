import { WorkflowsProvider } from "#/features/workflows/components/workflows-provider";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/workflows")({
	component: WorkflowsLayout,
});

function WorkflowsLayout() {
	return (
		<WorkflowsProvider>
			<Outlet />
		</WorkflowsProvider>
	);
}
