import { AutomationErrors } from "@be/workflow/error/automation.error-response";
import { mapAutomation } from "@be/workflow/routes/automation/automation.mappers";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export async function pauseAutomationController(params: {
	organizationId: string;
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

	const [row] = await db
		.update(schema.automation)
		.set({
			status: "paused",
			updatedAt: new Date(),
		})
		.where(eq(schema.automation.id, params.automationId))
		.returning();

	if (!row) throw AutomationErrors.updateFailed(params.automationId);
	return mapAutomation(row);
}
