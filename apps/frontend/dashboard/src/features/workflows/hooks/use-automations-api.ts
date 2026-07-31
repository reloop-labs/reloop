import type {
	Workflow,
	WorkflowEdge,
	WorkflowNode,
	WorkflowStatus,
} from "../workflow-types";

export type AutomationApiResponse = {
	id: string;
	organizationId: string;
	name: string;
	description: string | null;
	status: WorkflowStatus;
	triggerEvent: string | null;
	graph: {
		nodes: WorkflowNode[];
		edges: WorkflowEdge[];
	};
	activeVersionId: string | null;
	createdAt: string;
	updatedAt: string;
};

export type AutomationListResponse = {
	automations: AutomationApiResponse[];
	total: number;
	page: number;
	limit: number;
};

export function mapAutomationToWorkflow(
	row: AutomationApiResponse,
): Workflow {
	return {
		id: row.id,
		organizationId: row.organizationId,
		name: row.name,
		description: row.description,
		status: row.status,
		triggerEvent: row.triggerEvent,
		nodes: (row.graph?.nodes ?? []) as WorkflowNode[],
		edges: (row.graph?.edges ?? []) as WorkflowEdge[],
		activeVersionId: row.activeVersionId,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

async function parseJson<T>(res: Response): Promise<T> {
	const data = (await res.json().catch(() => ({}))) as T & {
		message?: string;
		why?: string;
	};
	if (!res.ok) {
		const msg =
			data.why || data.message || `Request failed (${res.status})`;
		throw new Error(msg);
	}
	return data;
}

export async function listAutomations(
	limit = 100,
): Promise<AutomationListResponse> {
	const res = await fetch(`/api/workflow/v1/automations?limit=${limit}`, {
		credentials: "include",
	});
	return parseJson<AutomationListResponse>(res);
}

export async function getAutomation(
	id: string,
): Promise<AutomationApiResponse> {
	const res = await fetch(`/api/workflow/v1/automations/${id}`, {
		credentials: "include",
	});
	return parseJson<AutomationApiResponse>(res);
}

export async function createAutomation(input: {
	name: string;
	description?: string;
}): Promise<AutomationApiResponse> {
	const res = await fetch("/api/workflow/v1/automations", {
		method: "POST",
		credentials: "include",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(input),
	});
	return parseJson<AutomationApiResponse>(res);
}

export async function updateAutomation(
	id: string,
	patch: {
		name?: string;
		description?: string | null;
		graph?: { nodes: WorkflowNode[]; edges: WorkflowEdge[] };
	},
): Promise<AutomationApiResponse> {
	const res = await fetch(`/api/workflow/v1/automations/${id}`, {
		method: "PATCH",
		credentials: "include",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(patch),
	});
	return parseJson<AutomationApiResponse>(res);
}

export async function activateAutomation(
	id: string,
): Promise<AutomationApiResponse> {
	const res = await fetch(`/api/workflow/v1/automations/${id}/activate`, {
		method: "POST",
		credentials: "include",
	});
	return parseJson<AutomationApiResponse>(res);
}

export async function pauseAutomation(
	id: string,
): Promise<AutomationApiResponse> {
	const res = await fetch(`/api/workflow/v1/automations/${id}/pause`, {
		method: "POST",
		credentials: "include",
	});
	return parseJson<AutomationApiResponse>(res);
}

export async function deleteAutomation(
	id: string,
): Promise<{ success: boolean; id: string }> {
	const res = await fetch(`/api/workflow/v1/automations/${id}`, {
		method: "DELETE",
		credentials: "include",
	});
	return parseJson(res);
}
