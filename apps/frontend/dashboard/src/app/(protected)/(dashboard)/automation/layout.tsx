import { WorkflowsLayoutClient } from "./layout-client";

export const instant = false;

export default function WorkflowsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <WorkflowsLayoutClient>{children}</WorkflowsLayoutClient>;
}
