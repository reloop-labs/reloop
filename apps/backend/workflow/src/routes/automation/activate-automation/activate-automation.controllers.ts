import { AutomationErrors } from "@be/workflow/error/automation.error-response";
import {
	extractTriggerEvent,
	validateAutomationGraph,
} from "@be/workflow/lib/automation/graph";
import { mapAutomation } from "@be/workflow/routes/automation/automation.mappers";
import { db } from "@reloop/db/client";
import type { AutomationGraph } from "@reloop/db/schema";
import * as schema from "@reloop/db/schema";
import { and, desc, eq, isNull } from "drizzle-orm";
import { log } from "evlog";

export async function activateAutomationController(params: {
	organizationId: string;
	userId: string;
	automationId: string;
}) {
	const existing = await db.query.automation.findFirst({
		where: and(
			eq(schema.automation.id, params.automationId),
			eq(schema.automation.organizationId, params.organizationId),
			isNull(schema.automation.deletedAt),
		),
	});
	if (!existing) throw AutomationErrors.notFound(params.automationId);

	const graph = (existing.graph ?? { nodes: [], edges: [] }) as AutomationGraph;
	const validation = validateAutomationGraph(graph);
	if (!validation.isValid) {
		throw AutomationErrors.cannotActivate(validation.errors.join(" "));
	}

	const triggerEvent =
		validation.triggerEvent ??
		extractTriggerEvent(graph) ??
		existing.triggerEvent;
	if (!triggerEvent) {
		throw AutomationErrors.cannotActivate(
			"Select a custom event as the trigger.",
		);
	}

	// Ensure the custom event still exists for this org
	const customEvent = await db.query.customEvent.findFirst({
		where: and(
			eq(schema.customEvent.organizationId, params.organizationId),
			eq(schema.customEvent.key, triggerEvent),
			isNull(schema.customEvent.deletedAt),
		),
		columns: { id: true, key: true },
	});
	if (!customEvent) {
		throw AutomationErrors.cannotActivate(
			`Custom event "${triggerEvent}" was not found. Create it under Events first.`,
		);
	}

	try {
		const latest = await db.query.automationVersion.findFirst({
			where: eq(schema.automationVersion.automationId, params.automationId),
			orderBy: [desc(schema.automationVersion.version)],
			columns: { version: true },
		});
		const nextVersion = (latest?.version ?? 0) + 1;

		const [version] = await db
			.insert(schema.automationVersion)
			.values({
				automationId: params.automationId,
				version: nextVersion,
				triggerEvent,
				graph,
				createdByUserId: params.userId,
			})
			.returning();

		if (!version) throw AutomationErrors.updateFailed(params.automationId);

		const [row] = await db
			.update(schema.automation)
			.set({
				status: "active",
				triggerEvent,
				activeVersionId: version.id,
				updatedAt: new Date(),
			})
			.where(eq(schema.automation.id, params.automationId))
			.returning();

		if (!row) throw AutomationErrors.updateFailed(params.automationId);
		return mapAutomation(row);
	} catch (error) {
		log.error({
			message: "Error activating automation",
			error: error instanceof Error ? error.message : String(error),
		});
		if (error && typeof error === "object" && "status" in error) throw error;
		throw AutomationErrors.updateFailed(params.automationId);
	}
}
