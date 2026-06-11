"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { WorkflowEditor } from "../components/workflow-editor";
import { WorkflowNotFound } from "../components/workflow-not-found";
import { useWorkflows } from "../components/workflows-provider";
import type { WorkflowEdge, WorkflowNode } from "../workflow-types";

const WorkflowEditorPage = () => {
	const { workflowId } = useParams<{ workflowId: string }>();
	const { getWorkflow, updateWorkflow, setWorkflowGraph, isHydrated } =
		useWorkflows();
	const workflow = getWorkflow(workflowId);
	const [localName, setLocalName] = useState("");

	useEffect(() => {
		if (workflow) {
			setLocalName(workflow.name);
		}
	}, [workflow?.id, workflow?.name, workflow]);

	const handleNameChange = useCallback(
		(name: string) => {
			if (!workflow) return;
			setLocalName(name);
			updateWorkflow(workflow.id, { name });
		},
		[workflow, updateWorkflow],
	);

	const handleGraphChange = useCallback(
		(nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
			if (!workflow) return;
			setWorkflowGraph(workflow.id, nodes, edges);
		},
		[workflow, setWorkflowGraph],
	);

	const handleStatusChange = useCallback(
		(status: NonNullable<typeof workflow>["status"]) => {
			if (!workflow) return;
			updateWorkflow(workflow.id, { status });
		},
		[workflow, updateWorkflow],
	);

	const handleSave = useCallback(() => {
		toast.success("Workflow saved");
	}, []);

	if (!isHydrated) {
		return (
			<div className="flex h-[calc(100vh-8rem)] items-center justify-center">
				<div className="h-8 w-8 animate-pulse rounded-lg bg-bg-weak-50" />
			</div>
		);
	}

	if (!workflow) {
		return <WorkflowNotFound />;
	}

	return (
		<div className="-mx-2 sm:-mx-0 flex h-[calc(100vh-7rem)] min-h-[480px] flex-col">
			<WorkflowEditor
				workflow={{ ...workflow, name: localName }}
				onNameChange={handleNameChange}
				onGraphChange={handleGraphChange}
				onStatusChange={handleStatusChange}
				onSave={handleSave}
			/>
		</div>
	);
};

export default WorkflowEditorPage;
