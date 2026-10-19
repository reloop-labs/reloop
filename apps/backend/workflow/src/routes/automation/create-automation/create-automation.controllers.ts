import { AutomationErrors } from "@be/workflow/error/automation.error-response";
import {
	emptyGraph,
	extractTriggerEvent,
} from "@be/workflow/lib/automation/graph";
import {
	type ConnectionInput,
	type StepInput,
	stepsToGraph,
} from "@be/workflow/lib/automation/steps";
import { activateAutomationController } from "@be/workflow/routes/automation/activate-automation/activate-automation.controllers";
import { mapAutomation } from "@be/workflow/routes/automation/automation.mappers";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { eq } from "drizzle-orm";
import { log } from "evlog";

export async function createAutomationController(params: {
	organizationId: string;
	userId: string;
	name: string;
	description?: string;
	status?: "draft" | "active";
	steps?: StepInput[];
	connections?: ConnectionInput[];
	reentry?: "once" | "restart" | "parallel";
}) {
	if (params.connections && !params.steps) {
		throw AutomationErrors.invalidGraph([
			"Send `steps` together with `connections`.",
		]);
	}
	let graph = emptyGraph();
	if (params.steps) {
		const built = stepsToGraph(params.steps, params.connections);
		if (!built.ok) throw AutomationErrors.invalidGraph(built.errors);
		graph = built.graph;
	}

	let created: ReturnType<typeof mapAutomation>;
	try {
		const [row] = await db
			.insert(schema.automation)
			.values({
				organizationId: params.organizationId,
				userId: params.userId,
				name: params.name.trim(),
				description: params.description?.trim() || null,
				status: "draft",
				graph,
				triggerEvent: extractTriggerEvent(graph) ?? null,
				reentry: params.reentry ?? "once",
			})
			.returning();

		if (!row) throw AutomationErrors.createFailed();
		created = mapAutomation(row);
	} catch (error) {
		log.error({
			message: "Error creating automation",
			error: error instanceof Error ? error.message : String(error),
		});
		if (error && typeof error === "object" && "status" in error) throw error;
		throw AutomationErrors.createFailed();
	}

	if (params.status !== "active") return created;
	try {
		return await activateAutomationController({
			organizationId: params.organizationId,
			userId: params.userId,
			automationId: created.id,
		});
	} catch (error) {
		// Starting failed (e.g. unknown event): don't leave a half-made draft.
		await db
			.delete(schema.automation)
			.where(eq(schema.automation.id, created.id))
			.catch(() => {});
		throw error;
	}
}
