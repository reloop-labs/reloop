import { pageMetadata } from "#/app/_lib/page-metadata";
import { WorkflowEditorPage } from "./client";

export const instant = false;

export const metadata = pageMetadata(
	"Automation Editor · Reloop",
	"Design and activate an automation.",
);

export default async function WorkflowEditorRoute({
	params,
}: {
	params: Promise<{ workflowId: string }>;
}) {
	const { workflowId } = await params;
	return <WorkflowEditorPage workflowId={workflowId} />;
}
