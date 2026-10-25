import { AutomationErrors } from "@be/workflow/error/automation.error-response";
import { mapEnrollment } from "@be/workflow/routes/automation/automation.mappers";
import { db } from "@reloop/db/client";
import {
	afterCursor,
	cursorOrderBy,
	decodeCursor,
	toCursorPage,
} from "@reloop/db/pagination";
import * as schema from "@reloop/db/schema";
import { and, count, eq, gte, isNull } from "drizzle-orm";

// Enrollments are ordered by enrolledAt, which never changes once set, so it
// is a stable keyset for cursors.
const enrollmentKeyset = {
	createdAt: schema.automationEnrollment.enrolledAt,
	id: schema.automationEnrollment.id,
};

export async function listEnrollmentsController(params: {
	organizationId: string;
	automationId: string;
	page: number;
	limit: number;
	status?: "active" | "completed" | "cancelled" | "failed";
	since?: string;
	cursor?: string;
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

	// With a cursor, pagination is keyset-based and `page` is ignored.
	const position = params.cursor ? decodeCursor(params.cursor) : null;
	const offset = position ? 0 : (params.page - 1) * params.limit;
	const filters = [
		eq(schema.automationEnrollment.organizationId, params.organizationId),
		eq(schema.automationEnrollment.automationId, params.automationId),
	];
	if (params.status) {
		filters.push(eq(schema.automationEnrollment.status, params.status));
	}
	if (params.since) {
		filters.push(
			gte(schema.automationEnrollment.enrolledAt, new Date(params.since)),
		);
	}
	const where = and(...filters);

	const [rows, totalRow] = await Promise.all([
		db.query.automationEnrollment.findMany({
			where: position
				? and(where, afterCursor(enrollmentKeyset, position))
				: where,
			with: {
				contact: {
					columns: {
						email: true,
						firstName: true,
						lastName: true,
					},
				},
			},
			orderBy: cursorOrderBy(enrollmentKeyset),
			limit: params.limit + 1,
			offset,
		}),
		db
			.select({ total: count() })
			.from(schema.automationEnrollment)
			.where(where)
			.then((r) => r[0]?.total ?? 0),
	]);

	const { items, hasMore, nextCursor } = toCursorPage(
		rows,
		params.limit,
		(row) => ({ createdAt: row.enrolledAt, id: row.id }),
	);

	return {
		enrollments: items.map((row) =>
			mapEnrollment({
				row,
				contact: row.contact,
			}),
		),
		total: Number(totalRow),
		page: params.page,
		limit: params.limit,
		hasMore,
		nextCursor,
	};
}
