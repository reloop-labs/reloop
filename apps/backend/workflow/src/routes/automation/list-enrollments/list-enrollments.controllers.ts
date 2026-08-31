import { AutomationErrors } from "@be/workflow/error/automation.error-response";
import { mapEnrollment } from "@be/workflow/routes/automation/automation.mappers";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, count, desc, eq, isNull } from "drizzle-orm";

export async function listEnrollmentsController(params: {
	organizationId: string;
	automationId: string;
	page: number;
	limit: number;
	status?: "active" | "completed" | "cancelled" | "failed";
}) {
	const automation = await db.query.automation.findFirst({
		where: and(
			eq(schema.automation.id, params.automationId),
			eq(schema.automation.organizationId, params.organizationId),
			isNull(schema.automation.deletedAt),
		),
		columns: { id: true },
	});
	if (!automation) throw AutomationErrors.notFound(params.automationId);

	const offset = (params.page - 1) * params.limit;
	const filters = [
		eq(schema.automationEnrollment.organizationId, params.organizationId),
		eq(schema.automationEnrollment.automationId, params.automationId),
	];
	if (params.status) {
		filters.push(eq(schema.automationEnrollment.status, params.status));
	}
	const where = and(...filters);

	const [rows, totalRow] = await Promise.all([
		db.query.automationEnrollment.findMany({
			where,
			with: {
				contact: {
					columns: {
						email: true,
						firstName: true,
						lastName: true,
					},
				},
			},
			orderBy: [desc(schema.automationEnrollment.enrolledAt)],
			limit: params.limit,
			offset,
		}),
		db
			.select({ total: count() })
			.from(schema.automationEnrollment)
			.where(where)
			.then((r) => r[0]?.total ?? 0),
	]);

	return {
		enrollments: rows.map((row) =>
			mapEnrollment({
				row,
				contact: row.contact,
			}),
		),
		total: Number(totalRow),
		page: params.page,
		limit: params.limit,
	};
}
