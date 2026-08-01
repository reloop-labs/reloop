import { AutomationErrors } from "@be/workflow/error/automation.error-response";
import { emptyGraph } from "@be/workflow/lib/automation/graph";
import { mapAutomation } from "@be/workflow/routes/automation/automation.mappers";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { log } from "evlog";

export async function createAutomationController(params: {
	organizationId: string;
	userId: string;
	name: string;
	description?: string;
}) {
	try {
		const [row] = await db
			.insert(schema.automation)
			.values({
				organizationId: params.organizationId,
				userId: params.userId,
				name: params.name.trim(),
				description: params.description?.trim() || null,
				status: "draft",
				graph: emptyGraph(),
			})
			.returning();

		if (!row) throw AutomationErrors.createFailed();
		return mapAutomation(row);
	} catch (error) {
		log.error({
			message: "Error creating automation",
			error: error instanceof Error ? error.message : String(error),
		});
		if (error && typeof error === "object" && "status" in error) throw error;
		throw AutomationErrors.createFailed();
	}
}
