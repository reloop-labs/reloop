import { pageMetadata } from "#/app/_lib/page-metadata";
import { WorkflowEditorPage } from "./client";

export const metadata = pageMetadata(
	"Workflow Editor · Reloop",
	"Design and activate an automation workflow.",
);

export default async function WorkflowEditorRoute({
	params,
}: {
	params: Promise<{ workflowId: string }>;
}) {
	const { workflowId } = await params;
	return <WorkflowEditorPage workflowId={workflowId} />;
}
