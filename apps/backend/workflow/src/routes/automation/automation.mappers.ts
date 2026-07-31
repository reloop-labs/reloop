import type { AutomationGraph } from "@reloop/db/schema";
import type * as schema from "@reloop/db/schema";

export function mapAutomation(
	row: typeof schema.automation.$inferSelect,
) {
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
