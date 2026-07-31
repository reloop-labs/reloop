import { mapAutomation } from "@be/workflow/routes/automation/automation.mappers";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, count, desc, eq, isNull } from "drizzle-orm";

export async function listAutomationsController(params: {
	organizationId: string;
	page: number;
	limit: number;
}) {
	const { organizationId, page, limit } = params;
	const offset = (page - 1) * limit;

	const where = and(
		eq(schema.automation.organizationId, organizationId),
		isNull(schema.automation.deletedAt),
	);

	const [rows, totalRow] = await Promise.all([
		db.query.automation.findMany({
			where,
			orderBy: [desc(schema.automation.updatedAt)],
			limit,
			offset,
		}),
		db
			.select({ total: count() })
			.from(schema.automation)
			.where(where)
			.then((r) => r[0]?.total ?? 0),
	]);

	return {
		automations: rows.map(mapAutomation),
		total: Number(totalRow),
		page,
		limit,
	};
}
