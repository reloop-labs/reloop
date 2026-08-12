"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { queryKeys } from "#/lib/query-keys";
import { WorkflowEditor } from "./components/workflow-editor";
import { WorkflowNotFound } from "./components/workflow-not-found";
import { useWorkflows } from "./components/workflows-provider";
import {
	getAutomation,
	mapAutomationToWorkflow,
} from "./hooks/use-automations-api";
import type {
	Workflow,
	WorkflowEdge,
	WorkflowNode,
	WorkflowStatus,
} from "./workflow-types";

export function WorkflowEditorPage({ workflowId }: { workflowId: string }) {
	const { getWorkflow, updateWorkflow, setWorkflowStatus, isHydrated } =
		useWorkflows();

	const cached = getWorkflow(workflowId);

	const detailQuery = useQuery({
		queryKey: queryKeys.workflows.detail(workflowId),
		queryFn: async () => {
			const row = await getAutomation(workflowId);
			return mapAutomationToWorkflow(row);
		},
		enabled: !!workflowId,
		initialData: cached,
	});

	const workflow = detailQuery.data ?? cached;
	const [localName, setLocalName] = useState(workflow?.name ?? "");
	const [localNodes, setLocalNodes] = useState<WorkflowNode[] | null>(null);
	const [localEdges, setLocalEdges] = useState<WorkflowEdge[] | null>(null);

	useEffect(() => {
		if (workflow) {
			setLocalName(workflow.name);
			setLocalNodes(null);
			setLocalEdges(null);
		}
	}, [workflow?.id, workflow?.updatedAt]);

	const handleNameChange = useCallback((name: string) => {
		setLocalName(name);
	}, []);

	const handleGraphChange = useCallback(
		(nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
			setLocalNodes(nodes);
			setLocalEdges(edges);
		},
		[],
	);

	const handleStatusChange = useCallback(
		async (status: WorkflowStatus) => {
			if (!workflow) return;
			await setWorkflowStatus(workflow.id, status);
			await detailQuery.refetch();
		},
		[workflow, setWorkflowStatus, detailQuery],
	);

	const handleSave = useCallback(
		async (nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
			if (!workflow) return;
			await updateWorkflow(workflow.id, {
				name: localName,
				nodes,
				edges,
			});
			await detailQuery.refetch();
		},
		[workflow, localName, updateWorkflow, detailQuery],
	);

	if (!isHydrated && !workflow && detailQuery.isLoading) {
		return (
			<div className="flex h-[calc(100vh-8rem)] items-center justify-center">
				<div className="h-8 w-8 animate-pulse rounded-lg bg-bg-weak-50" />
			</div>
		);
	}

	if (detailQuery.isError && !workflow) {
		return <WorkflowNotFound />;
	}

	if (!workflow) {
		return (
			<div className="flex h-[calc(100vh-8rem)] items-center justify-center">
				<div className="h-8 w-8 animate-pulse rounded-lg bg-bg-weak-50" />
			</div>
		);
	}

	const editorWorkflow: Workflow = {
		...workflow,
		name: localName,
		nodes: localNodes ?? workflow.nodes,
		edges: localEdges ?? workflow.edges,
	};

	return (
		<div className="-mx-2 sm:-mx-0 flex h-[calc(100vh-7rem)] min-h-[480px] flex-col">
			<WorkflowEditor
				workflow={editorWorkflow}
				onNameChange={handleNameChange}
				onGraphChange={handleGraphChange}
				onStatusChange={handleStatusChange}
				onSave={handleSave}
			/>
		</div>
	);
}
