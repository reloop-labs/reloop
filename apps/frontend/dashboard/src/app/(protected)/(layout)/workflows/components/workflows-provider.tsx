"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import {
	createEmptyWorkflow,
	getStorageKey,
	seedWorkflows,
} from "../mock-data";
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
	getWorkflow: (id: string) => Workflow | undefined;
	createWorkflow: (input: Omit<CreateWorkflowInput, "organizationId">) => Workflow;
	updateWorkflow: (
		id: string,
		patch: Partial<
			Pick<Workflow, "name" | "description" | "status" | "nodes" | "edges">
		>,
	) => void;
	setWorkflowGraph: (
		id: string,
		nodes: WorkflowNode[],
		edges: WorkflowEdge[],
	) => void;
	setWorkflowStatus: (id: string, status: WorkflowStatus) => void;
	deleteWorkflow: (id: string) => void;
}

const WorkflowsContext = createContext<WorkflowsContextValue | null>(null);

const loadFromStorage = (key: string): Workflow[] | null => {
	if (typeof window === "undefined") return null;
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return null;
		return JSON.parse(raw) as Workflow[];
	} catch {
		return null;
	}
};

const saveToStorage = (key: string, workflows: Workflow[]) => {
	if (typeof window === "undefined") return;
	localStorage.setItem(key, JSON.stringify(workflows));
};

export const WorkflowsProvider = ({ children }: { children: ReactNode }) => {
	const { activeOrganization } = useUserOrganization();
	const orgId = activeOrganization?.id ?? "";
	const orgSlug = activeOrganization?.slug ?? "";
	const storageKey = orgSlug ? getStorageKey(orgSlug) : "";

	const [workflows, setWorkflows] = useState<Workflow[]>([]);
	const [isHydrated, setIsHydrated] = useState(false);

	useEffect(() => {
		if (!storageKey || !orgId) {
			setWorkflows([]);
			setIsHydrated(true);
			return;
		}

		const stored = loadFromStorage(storageKey);
		if (stored && stored.length > 0) {
			setWorkflows(stored);
		} else {
			const seeds = seedWorkflows(orgId);
			setWorkflows(seeds);
			saveToStorage(storageKey, seeds);
		}
		setIsHydrated(true);
	}, [storageKey, orgId]);

	useEffect(() => {
		if (!isHydrated || !storageKey || workflows.length === 0) return;
		saveToStorage(storageKey, workflows);
	}, [workflows, storageKey, isHydrated]);

	const getWorkflow = useCallback(
		(id: string) => workflows.find((w) => w.id === id),
		[workflows],
	);

	const createWorkflow = useCallback(
		(input: Omit<CreateWorkflowInput, "organizationId">) => {
			const workflow = createEmptyWorkflow({
				...input,
				organizationId: orgId,
			});
			setWorkflows((prev) => [...prev, workflow]);
			return workflow;
		},
		[orgId],
	);

	const updateWorkflow = useCallback(
		(
			id: string,
			patch: Partial<
				Pick<Workflow, "name" | "description" | "status" | "nodes" | "edges">
			>,
		) => {
			setWorkflows((prev) =>
				prev.map((w) =>
					w.id === id
						? { ...w, ...patch, updatedAt: new Date().toISOString() }
						: w,
				),
			);
		},
		[],
	);

	const setWorkflowGraph = useCallback(
		(id: string, nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
			updateWorkflow(id, { nodes, edges });
		},
		[updateWorkflow],
	);

	const setWorkflowStatus = useCallback(
		(id: string, status: WorkflowStatus) => {
			updateWorkflow(id, { status });
		},
		[updateWorkflow],
	);

	const deleteWorkflow = useCallback((id: string) => {
		setWorkflows((prev) => prev.filter((w) => w.id !== id));
	}, []);

	const value = useMemo(
		() => ({
			workflows,
			isHydrated,
			getWorkflow,
			createWorkflow,
			updateWorkflow,
			setWorkflowGraph,
			setWorkflowStatus,
			deleteWorkflow,
		}),
		[
			workflows,
			isHydrated,
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
