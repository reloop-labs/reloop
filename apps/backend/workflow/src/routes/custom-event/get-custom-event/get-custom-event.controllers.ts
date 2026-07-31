import { CustomEventErrors } from "@be/workflow/error/custom-event.error-response";
import { mapCustomEvent } from "@be/workflow/routes/custom-event/custom-event.mappers";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull, or } from "drizzle-orm";

export async function getCustomEventController(params: {
	organizationId: string;
	/** Event id (evt_...) or key */
	eventIdOrKey: string;
}) {
	const row = await db.query.customEvent.findFirst({
		where: and(
			eq(schema.customEvent.organizationId, params.organizationId),
			isNull(schema.customEvent.deletedAt),
			or(
				eq(schema.customEvent.id, params.eventIdOrKey),
				eq(schema.customEvent.key, params.eventIdOrKey),
			),
		),
	});
	if (!row) throw CustomEventErrors.notFound(params.eventIdOrKey);

	const properties = await db.query.customEventProperty.findMany({
		where: eq(schema.customEventProperty.eventId, row.id),
	});

	return mapCustomEvent(row, properties);
}
