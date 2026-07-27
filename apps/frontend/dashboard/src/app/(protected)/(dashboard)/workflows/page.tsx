import { pageMetadata } from "#/app/_lib/page-metadata";
import { WorkflowsPage } from "./client";

export const metadata = pageMetadata(
	"Workflows · Reloop",
	"Build automation workflows for email and agent events.",
);

export default function WorkflowsRoute() {
	return <WorkflowsPage />;
}
