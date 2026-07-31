import { AutomationErrors } from "@be/workflow/error/automation.error-response";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { log } from "evlog";

export async function deleteAutomationController(params: {
	organizationId: string;
	automationId: string;
}) {
	const existing = await db.query.automation.findFirst({
		where: and(
			eq(schema.automation.id, params.automationId),
			eq(schema.automation.organizationId, params.organizationId),
			isNull(schema.automation.deletedAt),
		),
		columns: { id: true },
	});
	if (!existing) throw AutomationErrors.notFound(params.automationId);

	try {
		await db
			.update(schema.automation)
			.set({
				deletedAt: new Date(),
				status: "paused",
				updatedAt: new Date(),
			})
			.where(eq(schema.automation.id, params.automationId));

		return { success: true, id: params.automationId };
	} catch (error) {
		log.error({
			message: "Error deleting automation",
			error: error instanceof Error ? error.message : String(error),
		});
		throw AutomationErrors.deleteFailed(params.automationId);
	}
}
