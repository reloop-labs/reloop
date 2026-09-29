"use client";

import { useState } from "react";
import { WorkflowEditor } from "#/features/workflows/components/workflow-editor";
import { createTriggerNode } from "#/features/workflows/mock-data";
import type {
	Workflow,
	WorkflowEdge,
	WorkflowNode,
} from "#/features/workflows/workflow-types";

export default function DebugFlowPage() {
	const [workflow, setWorkflow] = useState<Workflow>(() => ({
		id: "debug-flow",
		organizationId: "debug-org",
		name: "Debug flow",
		description: null,
		status: "draft",
		nodes: [createTriggerNode()],
		edges: [],
		activeVersionId: null,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	}));

	return (
		<div className="h-screen w-screen">
			<WorkflowEditor
				workflow={workflow}
				onNameChange={(name) => setWorkflow((w) => ({ ...w, name }))}
				onGraphChange={(nodes: WorkflowNode[], edges: WorkflowEdge[]) =>
					setWorkflow((w) => ({ ...w, nodes, edges }))
				}
				onStatusChange={() => {}}
				onSave={() => {}}
			/>
		</div>
	);
}
