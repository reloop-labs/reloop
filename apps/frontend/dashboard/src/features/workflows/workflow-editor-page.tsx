"use client";

import { useQuery } from "@tanstack/react-query";
import {
	type ReactElement,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { toast } from "sonner";
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

/**
 * Automation editor route. Keeps name and graph edits locally, autosaves them
 * for draft and paused automations, and saves before Start.
 */
export function WorkflowEditorPage({
	workflowId,
}: {
	workflowId: string;
}): ReactElement {
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
	// Snapshot of what is persisted. Null until the editor reports its first
	// (laid-out) graph, so merely opening an automation never triggers a save.
	const savedSnapshotRef = useRef<string | null>(null);
	const pendingSaveRef = useRef<(() => Promise<void>) | null>(null);
	// Last snapshot whose save failed. Not retried until the edits change, so a
	// rejected save doesn't loop with an error toast every second.
	const failedSnapshotRef = useRef<string | null>(null);
	// updateWorkflow changes identity with every mutation state change; calling
	// it through a ref keeps that from re-running the autosave effect.
	const updateWorkflowRef = useRef(updateWorkflow);
	updateWorkflowRef.current = updateWorkflow;

	// Reset local edits only when switching to a different automation. Resetting
	// on every server update (updatedAt) discarded unsaved edits whenever an
	// unrelated PATCH (e.g. the re-entry toggle) refreshed the detail cache.
	// biome-ignore lint/correctness/useExhaustiveDependencies: reset per automation id only
	useEffect(() => {
		if (workflow) {
			setLocalName(workflow.name);
			setLocalNodes(null);
			setLocalEdges(null);
			savedSnapshotRef.current = null;
			failedSnapshotRef.current = null;
		}
	}, [workflow?.id]);

	// --- Autosave for draft / paused automations ---------------------------
	const canAutosave = !!workflow && workflow.status !== "active";

	const snapshot =
		localNodes && localEdges
			? JSON.stringify({
					name: localName,
					nodes: localNodes,
					edges: localEdges,
				})
			: null;

	useEffect(() => {
		if (!workflow || !snapshot || !localNodes || !localEdges) return;
		if (savedSnapshotRef.current === null) {
			savedSnapshotRef.current = JSON.stringify({
				name: workflow.name,
				nodes: localNodes,
				edges: localEdges,
			});
		}
		if (
			!canAutosave ||
			snapshot === savedSnapshotRef.current ||
			snapshot === failedSnapshotRef.current
		) {
			pendingSaveRef.current = null;
			return;
		}
		const id = workflow.id;
		const name = localName.trim();
		const nodes = localNodes;
		const edges = localEdges;
		const save = async () => {
			pendingSaveRef.current = null;
			try {
				await updateWorkflowRef.current(id, {
					...(name ? { name } : {}),
					nodes,
					edges,
				});
				savedSnapshotRef.current = snapshot;
				failedSnapshotRef.current = null;
			} catch (e) {
				failedSnapshotRef.current = snapshot;
				toast.error(
					e instanceof Error ? e.message : "Failed to save automation",
				);
			}
		};
		pendingSaveRef.current = save;
		const timer = setTimeout(() => void save(), 1000);
		return () => clearTimeout(timer);
	}, [snapshot, canAutosave, workflow, localName, localNodes, localEdges]);

	// Flush a pending save when leaving the editor, and warn on hard unload.
	useEffect(() => {
		const onBeforeUnload = (e: BeforeUnloadEvent) => {
			if (!pendingSaveRef.current) return;
			void pendingSaveRef.current();
			e.preventDefault();
		};
		window.addEventListener("beforeunload", onBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", onBeforeUnload);
			void pendingSaveRef.current?.();
		};
	}, []);

	const handleNameChange = useCallback(
		(name: string) => {
			setLocalName(name);
			// Seed local graph so a rename alone is still autosaved.
			if (workflow) {
				setLocalNodes((prev) => prev ?? workflow.nodes);
				setLocalEdges((prev) => prev ?? workflow.edges);
			}
		},
		[workflow],
	);

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
			<div className="flex h-full items-center justify-center">
				<div className="h-8 w-8 animate-pulse rounded-lg bg-bg-weak-50" />
			</div>
		);
	}

	if (detailQuery.isError && !workflow) {
		return <WorkflowNotFound />;
	}

	if (!workflow) {
		return (
			<div className="flex h-full items-center justify-center">
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
		<div className="flex h-full min-h-0 flex-col">
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
