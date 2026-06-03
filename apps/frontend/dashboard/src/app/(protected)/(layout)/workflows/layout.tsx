"use client";

import { WorkflowsProvider } from "./components/workflows-provider";

const WorkflowsLayout = ({ children }: { children: React.ReactNode }) => {
	return <WorkflowsProvider>{children}</WorkflowsProvider>;
};

export default WorkflowsLayout;
