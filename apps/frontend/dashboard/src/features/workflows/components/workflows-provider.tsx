"use client";

import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { queryKeys } from "#/lib/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
} from "react";
import {
	activateAutomation,
	createAutomation,
	deleteAutomation,
	listAutomations,
	mapAutomationToWorkflow,
	pauseAutomation,
	updateAutomation,
} from "../hooks/use-automations-api";
import type {
	CreateWorkflowInput,
	Workflow,
	WorkflowEdge,
	WorkflowNode,
	WorkflowStatus,
} from "../workflow-types";

interface WorkflowsContextValue {
	workflows: Workflow[];
	isHydrated: boolean;
	isLoading: boolean;
	error: Error | null;
	getWorkflow: (id: string) => Workflow | undefined;
	createWorkflow: (
		input: Omit<CreateWorkflowInput, "organizationId">,
	) => Promise<Workflow>;
	updateWorkflow: (
		id: string,
		patch: Partial<
			Pick<Workflow, "name" | "description" | "nodes" | "edges">
		>,
	) => Promise<void>;
	setWorkflowGraph: (
		id: string,
		nodes: WorkflowNode[],
		edges: WorkflowEdge[],
	) => Promise<void>;
	setWorkflowStatus: (id: string, status: WorkflowStatus) => Promise<void>;
	deleteWorkflow: (id: string) => Promise<void>;
	refetch: () => void;
}

const WorkflowsContext = createContext<WorkflowsContextValue | null>(null);

export const WorkflowsProvider = ({ children }: { children: ReactNode }) => {
	const { activeOrganization } = useActiveOrganization();
	const orgId = activeOrganization?.id ?? "";
	const queryClient = useQueryClient();

	const listQuery = useQuery({
		queryKey: queryKeys.workflows.list(orgId),
		queryFn: async () => {
			const res = await listAutomations(100);
			return res.automations.map(mapAutomationToWorkflow);
		},
		enabled: !!orgId,
	});

	const workflows = listQuery.data ?? [];
	const isHydrated = !listQuery.isLoading || !orgId;
	const isLoading = listQuery.isLoading && !!orgId;

	const invalidate = useCallback(() => {
		void queryClient.invalidateQueries({
			queryKey: queryKeys.workflows.all,
		});
	}, [queryClient]);

	const createMutation = useMutation({
		mutationFn: createAutomation,
		onSuccess: invalidate,
	});

	const updateMutation = useMutation({
		mutationFn: ({
			id,
			patch,
		}: {
			id: string;
			patch: Parameters<typeof updateAutomation>[1];
		}) => updateAutomation(id, patch),
		onSuccess: (data) => {
			const mapped = mapAutomationToWorkflow(data);
			queryClient.setQueryData<Workflow[]>(
				queryKeys.workflows.list(orgId),
				(prev) =>
					prev?.map((w) => (w.id === mapped.id ? mapped : w)) ?? [mapped],
			);
			queryClient.setQueryData(queryKeys.workflows.detail(mapped.id), mapped);
		},
	});

	const getWorkflow = useCallback(
		(id: string) => workflows.find((w) => w.id === id),
		[workflows],
	);

	const createWorkflow = useCallback(
		async (input: Omit<CreateWorkflowInput, "organizationId">) => {
			const row = await createMutation.mutateAsync({
				name: input.name,
				description: input.description,
			});
			return mapAutomationToWorkflow(row);
		},
		[createMutation],
	);

	const updateWorkflow = useCallback(
		async (
			id: string,
			patch: Partial<
				Pick<Workflow, "name" | "description" | "nodes" | "edges">
			>,
		) => {
			const body: Parameters<typeof updateAutomation>[1] = {};
			if (patch.name !== undefined) body.name = patch.name;
			if (patch.description !== undefined) body.description = patch.description;
			if (patch.nodes !== undefined || patch.edges !== undefined) {
				const current = workflows.find((w) => w.id === id);
				body.graph = {
					nodes: patch.nodes ?? current?.nodes ?? [],
					edges: patch.edges ?? current?.edges ?? [],
				};
			}
			await updateMutation.mutateAsync({ id, patch: body });
		},
		[updateMutation, workflows],
	);

	const setWorkflowGraph = useCallback(
		async (id: string, nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
			await updateWorkflow(id, { nodes, edges });
		},
		[updateWorkflow],
	);

	const setWorkflowStatus = useCallback(
		async (id: string, status: WorkflowStatus) => {
			if (status === "active") {
				const row = await activateAutomation(id);
				const mapped = mapAutomationToWorkflow(row);
				queryClient.setQueryData<Workflow[]>(
					queryKeys.workflows.list(orgId),
					(prev) =>
						prev?.map((w) => (w.id === mapped.id ? mapped : w)) ?? [mapped],
				);
				return;
			}
			if (status === "paused" || status === "draft") {
				const row = await pauseAutomation(id);
				const mapped = mapAutomationToWorkflow(row);
				queryClient.setQueryData<Workflow[]>(
					queryKeys.workflows.list(orgId),
					(prev) =>
						prev?.map((w) => (w.id === mapped.id ? mapped : w)) ?? [mapped],
				);
			}
		},
		[orgId, queryClient],
	);

	const deleteWorkflow = useCallback(
		async (id: string) => {
			await deleteAutomation(id);
			invalidate();
		},
		[invalidate],
	);

	const value = useMemo(
		() => ({
			workflows,
			isHydrated,
			isLoading,
			error: listQuery.error,
			getWorkflow,
			createWorkflow,
			updateWorkflow,
			setWorkflowGraph,
			setWorkflowStatus,
			deleteWorkflow,
			refetch: () => {
				void listQuery.refetch();
			},
		}),
		[
			workflows,
			isHydrated,
			isLoading,
			listQuery,
			getWorkflow,
			createWorkflow,
			updateWorkflow,
			setWorkflowGraph,
			setWorkflowStatus,
			deleteWorkflow,
		],
	);

	return (
		<WorkflowsContext.Provider value={value}>
			{children}
		</WorkflowsContext.Provider>
	);
};

export const useWorkflows = () => {
	const ctx = useContext(WorkflowsContext);
	if (!ctx) {
		throw new Error("useWorkflows must be used within WorkflowsProvider");
	}
	return ctx;
};
