import { AutomationErrors } from "@be/workflow/error/automation.error-response";
import {
	extractTriggerEvent,
	validateAutomationGraph,
} from "@be/workflow/lib/automation/graph";
import {
	type ConnectionInput,
	type StepInput,
	stepsToGraph,
} from "@be/workflow/lib/automation/steps";
import { activateAutomationController } from "@be/workflow/routes/automation/activate-automation/activate-automation.controllers";
import { mapAutomation } from "@be/workflow/routes/automation/automation.mappers";
import { pauseAutomationController } from "@be/workflow/routes/automation/pause-automation/pause-automation.controllers";
import { db } from "@reloop/db/client";
import type { AutomationGraph } from "@reloop/db/schema";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { log } from "evlog";

export async function updateAutomationController(params: {
	organizationId: string;
	userId: string;
	automationId: string;
	name?: string;
	description?: string | null;
	graph?: AutomationGraph;
	steps?: StepInput[];
	connections?: ConnectionInput[];
	status?: "active" | "paused";
	reentry?: "once" | "restart" | "parallel";
}) {
	if (params.steps && params.graph) {
		throw AutomationErrors.invalidGraph([
			"Send either `steps` + `connections` or `graph`, not both.",
		]);
	}
	if (params.connections && !params.steps) {
		throw AutomationErrors.invalidGraph([
			"Send `steps` together with `connections` (they replace the whole flow).",
		]);
	}
	let graphInput = params.graph;
	if (params.steps) {
		const built = stepsToGraph(params.steps, params.connections);
		if (!built.ok) throw AutomationErrors.invalidGraph(built.errors);
		graphInput = built.graph;
	}

	const existing = await db.query.automation.findFirst({
		where: and(
			eq(schema.automation.id, params.automationId),
			eq(schema.automation.organizationId, params.organizationId),
			isNull(schema.automation.deletedAt),
		),
	});
	if (!existing) throw AutomationErrors.notFound(params.automationId);

	const patch: Partial<typeof schema.automation.$inferInsert> = {
		updatedAt: new Date(),
	};

	if (params.name !== undefined) {
		patch.name = params.name.trim();
	}
	if (params.description !== undefined) {
		patch.description =
			params.description === null ? null : params.description.trim() || null;
	}
	if (params.reentry !== undefined) {
		patch.reentry = params.reentry;
	}
	if (graphInput !== undefined) {
		// Soft-validate structure; full validation required only on activate
		const graph = graphInput;
		if (!Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
			throw AutomationErrors.invalidGraph([
				"Graph must include nodes and edges.",
			]);
		}
		patch.graph = graph;
		const triggerEvent = extractTriggerEvent(graph);
		if (triggerEvent) {
			patch.triggerEvent = triggerEvent;
		}
		// Editing an active automation only updates draft graph; published version stays until re-activate
		if (existing.status === "active") {
			// Keep status active but note that new enrollments still use active version
			// User must re-activate (or we auto-publish on save when active) — for v1: auto-publish on save when active
			const validation = validateAutomationGraph(graph);
			if (!validation.isValid) {
				throw AutomationErrors.invalidGraph(validation.errors);
			}
		}
	}

	let updated: ReturnType<typeof mapAutomation>;
	try {
		const [row] = await db
			.update(schema.automation)
			.set(patch)
			.where(eq(schema.automation.id, params.automationId))
			.returning();
		if (!row) throw AutomationErrors.updateFailed(params.automationId);
		updated = mapAutomation(row);
	} catch (error) {
		log.error({
			message: "Error updating automation",
			error: error instanceof Error ? error.message : String(error),
		});
		if (error && typeof error === "object" && "status" in error) throw error;
		throw AutomationErrors.updateFailed(params.automationId);
	}

	if (params.status === "active") {
		return activateAutomationController({
			organizationId: params.organizationId,
			userId: params.userId,
			automationId: params.automationId,
		});
	}
	if (params.status === "paused" && updated.status !== "paused") {
		return pauseAutomationController({
			organizationId: params.organizationId,
			automationId: params.automationId,
		});
	}
	return updated;
}
