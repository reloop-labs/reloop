import { WorkflowsLayoutClient } from "./layout-client";

export default function WorkflowsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <WorkflowsLayoutClient>{children}</WorkflowsLayoutClient>;
}
