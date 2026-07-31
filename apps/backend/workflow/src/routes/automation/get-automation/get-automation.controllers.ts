import { AutomationErrors } from "@be/workflow/error/automation.error-response";
import { mapAutomation } from "@be/workflow/routes/automation/automation.mappers";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export async function getAutomationController(params: {
	organizationId: string;
	automationId: string;
}) {
	const row = await db.query.automation.findFirst({
		where: and(
			eq(schema.automation.id, params.automationId),
			eq(schema.automation.organizationId, params.organizationId),
			isNull(schema.automation.deletedAt),
		),
	});
	if (!row) throw AutomationErrors.notFound(params.automationId);
	return mapAutomation(row);
}
