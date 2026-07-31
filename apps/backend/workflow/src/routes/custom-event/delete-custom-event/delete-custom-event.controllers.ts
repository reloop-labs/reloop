import { CustomEventErrors } from "@be/workflow/error/custom-event.error-response";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export async function deleteCustomEventController(params: {
	organizationId: string;
	eventId: string;
}) {
	const existing = await db.query.customEvent.findFirst({
		where: and(
			eq(schema.customEvent.id, params.eventId),
			eq(schema.customEvent.organizationId, params.organizationId),
			isNull(schema.customEvent.deletedAt),
		),
		columns: { id: true },
	});
	if (!existing) throw CustomEventErrors.notFound(params.eventId);

	await db
		.update(schema.customEvent)
		.set({ deletedAt: new Date(), updatedAt: new Date() })
		.where(eq(schema.customEvent.id, params.eventId));

	return { success: true, id: params.eventId };
}
