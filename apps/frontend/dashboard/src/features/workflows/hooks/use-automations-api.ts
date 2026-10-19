import type {
	Workflow,
	WorkflowEdge,
	WorkflowNode,
	WorkflowReentry,
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
	reentry: WorkflowReentry;
	createdAt: string;
	updatedAt: string;
};

export type AutomationListResponse = {
	automations: AutomationApiResponse[];
	total: number;
	page: number;
	limit: number;
};

export function mapAutomationToWorkflow(row: AutomationApiResponse): Workflow {
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
		reentry: row.reentry,
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
		const msg = data.why || data.message || `Request failed (${res.status})`;
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
	reentry?: WorkflowReentry;
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
		reentry?: WorkflowReentry;
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

export type EnrollmentStatus = "active" | "completed" | "cancelled" | "failed";

export type AutomationEnrollment = {
	id: string;
	automationId: string;
	contactId: string;
	contactEmail: string | null;
	contactFirstName: string | null;
	contactLastName: string | null;
	status: EnrollmentStatus;
	currentNodeId: string | null;
	enrolledAt: string;
	completedAt: string | null;
	cancelledAt: string | null;
	/** The newer run that cancelled this one (re-entry "restart"). */
	replacedByEnrollmentId: string | null;
	/** When it completed, was cancelled or failed. */
	endedAt: string | null;
};

export type EnrollContactResponse = {
	enrollment: AutomationEnrollment;
	contactCreated: boolean;
	delayMs: number;
};

export type EnrollmentListResponse = {
	enrollments: AutomationEnrollment[];
	total: number;
	page: number;
	limit: number;
};

export async function enrollContact(
	automationId: string,
	input: {
		contactId?: string;
		email?: string;
		firstName?: string;
		lastName?: string;
	},
): Promise<EnrollContactResponse> {
	const res = await fetch(
		`/api/workflow/v1/automations/${automationId}/enroll`,
		{
			method: "POST",
			credentials: "include",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(input),
		},
	);
	return parseJson<EnrollContactResponse>(res);
}

export async function listEnrollments(
	automationId: string,
	options: {
		limit?: number;
		page?: number;
		status?: EnrollmentStatus;
		/** Only runs that started at or after this time. */
		since?: Date;
	} = {},
): Promise<EnrollmentListResponse> {
	const params = new URLSearchParams({
		limit: String(options.limit ?? 50),
		page: String(options.page ?? 1),
	});
	if (options.status) params.set("status", options.status);
	if (options.since) params.set("since", options.since.toISOString());
	const res = await fetch(
		`/api/workflow/v1/automations/${automationId}/enrollments?${params}`,
		{ credentials: "include" },
	);
	return parseJson<EnrollmentListResponse>(res);
}

export type StepRunStatus =
	| "pending"
	| "running"
	| "completed"
	| "skipped"
	| "failed";

export type StepRun = {
	id: string;
	nodeId: string;
	nodeType: string;
	status: StepRunStatus;
	scheduledFor: string;
	startedAt: string | null;
	finishedAt: string | null;
	emailLogId: string | null;
	error: string | null;
	/** When it was scheduled; a delay starts waiting here. */
	createdAt: string;
};

/** The email a send step sends this contact (or sent, once `sent`). */
export type StepEmail = {
	from: string | null;
	to: string;
	subject: string;
	templateId: string | null;
	templateName: string | null;
	html: string | null;
	sent: boolean;
	emailId: string | null;
	deliveryStatus: string | null;
	/** Why it can't be sent as configured. */
	problem: string | null;
};

export type EnrollmentDetail = {
	enrollment: AutomationEnrollment;
	/** The event that started it; `eventKey` is null when enrolled directly. */
	trigger: { eventKey: string | null; properties: Record<string, unknown> };
	/** The published version of the steps this run follows. */
	graph: { nodes: WorkflowNode[]; edges: WorkflowEdge[] };
	/** Per send_email step ID. */
	emails: Record<string, StepEmail>;
	steps: StepRun[];
};

export async function getEnrollment(
	automationId: string,
	enrollmentId: string,
): Promise<EnrollmentDetail> {
	const res = await fetch(
		`/api/workflow/v1/automations/${automationId}/enrollments/${enrollmentId}`,
		{ credentials: "include" },
	);
	return parseJson<EnrollmentDetail>(res);
}

type RunCounts = {
	total: number;
	active: number;
	completed: number;
	cancelled: number;
	failed: number;
};

export type EmailCounts = {
	sent: number;
	delivered: number;
	opened: number;
	clicked: number;
	bounced: number;
};

export type AutomationMetrics = {
	runs: RunCounts & { averageDurationMs: number | null };
	emails: EmailCounts;
	steps: (Record<StepRunStatus, number> & {
		nodeId: string;
		nodeType: string;
		emails: EmailCounts;
	})[];
	/** Per day: runs started, and what happened to the emails. */
	daily: (RunCounts & { date: string; emails: EmailCounts })[];
};

export async function getAutomationMetrics(
	automationId: string,
	days: number,
): Promise<AutomationMetrics> {
	const res = await fetch(
		`/api/workflow/v1/automations/${automationId}/metrics?days=${days}`,
		{ credentials: "include" },
	);
	return parseJson<AutomationMetrics>(res);
}
