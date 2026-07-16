import { WorkflowEditorPage } from "#/features/workflows/workflow-editor-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/workflows/$workflowId")({
	component: WorkflowEditorRoute,
	head: () => ({
		meta: [
			{ title: "Workflow Editor · Reloop" },
			{
				name: "description",
				content: "Design and activate an automation workflow.",
			},
		],
	}),
});

function WorkflowEditorRoute() {
	const { workflowId } = Route.useParams();
	return <WorkflowEditorPage workflowId={workflowId} />;
}
