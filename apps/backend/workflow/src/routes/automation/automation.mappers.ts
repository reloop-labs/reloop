import type * as schema from "@reloop/db/schema";
import type { AutomationGraph } from "@reloop/db/schema";

function iso(value: Date | null | undefined): string | null {
	return value ? value.toISOString() : null;
}

export function mapEnrollment(params: {
	row: typeof schema.automationEnrollment.$inferSelect;
	contact?: {
		email: string;
		firstName: string | null;
		lastName: string | null;
	} | null;
}) {
	const { row, contact } = params;
	return {
		id: row.id,
		automationId: row.automationId,
		contactId: row.contactId,
		contactEmail: contact?.email ?? null,
		contactFirstName: contact?.firstName ?? null,
		contactLastName: contact?.lastName ?? null,
		status: row.status,
		currentNodeId: row.currentNodeId ?? null,
		enrolledAt: row.enrolledAt.toISOString(),
		completedAt: iso(row.completedAt),
		cancelledAt: iso(row.cancelledAt),
	};
}

export function mapStepRun(row: typeof schema.automationStepRun.$inferSelect) {
	return {
		id: row.id,
		nodeId: row.nodeId,
		nodeType: row.nodeType,
		status: row.status,
		scheduledFor: row.scheduledFor.toISOString(),
		startedAt: iso(row.startedAt),
		finishedAt: iso(row.finishedAt),
		emailLogId: row.emailLogId ?? null,
		error: row.error ?? null,
	};
}

export function mapAutomation(row: typeof schema.automation.$inferSelect) {
	const graph = (row.graph ?? { nodes: [], edges: [] }) as AutomationGraph;
	return {
		id: row.id,
		organizationId: row.organizationId,
		name: row.name,
		description: row.description ?? null,
		status: row.status,
		triggerEvent: row.triggerEvent ?? null,
		graph: {
			nodes: graph.nodes ?? [],
			edges: graph.edges ?? [],
		},
		activeVersionId: row.activeVersionId ?? null,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	};
}
