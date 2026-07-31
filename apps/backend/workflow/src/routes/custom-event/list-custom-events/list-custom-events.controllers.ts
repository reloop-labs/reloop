import { mapCustomEvent } from "@be/workflow/routes/custom-event/custom-event.mappers";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, count, desc, eq, inArray, isNull } from "drizzle-orm";

export async function listCustomEventsController(params: {
	organizationId: string;
	page: number;
	limit: number;
}) {
	const { organizationId, page, limit } = params;
	const offset = (page - 1) * limit;
	const where = and(
		eq(schema.customEvent.organizationId, organizationId),
		isNull(schema.customEvent.deletedAt),
	);

	const [rows, totalRow] = await Promise.all([
		db.query.customEvent.findMany({
			where,
			orderBy: [desc(schema.customEvent.updatedAt)],
			limit,
			offset,
		}),
		db
			.select({ total: count() })
			.from(schema.customEvent)
			.where(where)
			.then((r) => r[0]?.total ?? 0),
	]);

	const ids = rows.map((r) => r.id);
	const props =
		ids.length === 0
			? []
			: await db.query.customEventProperty.findMany({
					where: inArray(schema.customEventProperty.eventId, ids),
				});

	const byEvent = new Map<string, typeof props>();
	for (const p of props) {
		const list = byEvent.get(p.eventId) ?? [];
		list.push(p);
		byEvent.set(p.eventId, list);
	}

	return {
		events: rows.map((r) => mapCustomEvent(r, byEvent.get(r.id) ?? [])),
		total: Number(totalRow),
		page,
		limit,
	};
}
