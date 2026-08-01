import { CustomEventErrors } from "@be/workflow/error/custom-event.error-response";
import { mapCustomEvent } from "@be/workflow/routes/custom-event/custom-event.mappers";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { log } from "evlog";

type PropertyInput = {
	name: string;
	propertyType?: "string" | "number" | "boolean";
	required?: boolean;
	defaultValue?: string | null;
	description?: string | null;
};

export async function updateCustomEventController(params: {
	organizationId: string;
	eventId: string;
	name?: string;
	description?: string | null;
	properties?: PropertyInput[];
}) {
	const existing = await db.query.customEvent.findFirst({
		where: and(
			eq(schema.customEvent.id, params.eventId),
			eq(schema.customEvent.organizationId, params.organizationId),
			isNull(schema.customEvent.deletedAt),
		),
	});
	if (!existing) throw CustomEventErrors.notFound(params.eventId);

	const patch: Partial<typeof schema.customEvent.$inferInsert> = {
		updatedAt: new Date(),
	};
	if (params.name !== undefined) patch.name = params.name.trim();
	if (params.description !== undefined) {
		patch.description =
			params.description === null ? null : params.description.trim() || null;
	}

	try {
		const [row] = await db
			.update(schema.customEvent)
			.set(patch)
			.where(eq(schema.customEvent.id, params.eventId))
			.returning();
		if (!row) throw CustomEventErrors.updateFailed();

		let propertyRows = await db.query.customEventProperty.findMany({
			where: eq(schema.customEventProperty.eventId, params.eventId),
		});

		if (params.properties !== undefined) {
			await db
				.delete(schema.customEventProperty)
				.where(eq(schema.customEventProperty.eventId, params.eventId));

			const seen = new Set<string>();
			const values = [];
			for (const p of params.properties) {
				const name = p.name.trim();
				if (!name || seen.has(name)) continue;
				seen.add(name);
				values.push({
					eventId: params.eventId,
					organizationId: params.organizationId,
					name,
					propertyType: p.propertyType ?? ("string" as const),
					required: p.required ?? false,
					defaultValue: p.defaultValue ?? null,
					description: p.description ?? null,
				});
			}
			propertyRows =
				values.length > 0
					? await db
							.insert(schema.customEventProperty)
							.values(values)
							.returning()
					: [];
		}

		return mapCustomEvent(row, propertyRows);
	} catch (error) {
		log.error({
			message: "Error updating custom event",
			error: error instanceof Error ? error.message : String(error),
		});
		if (error && typeof error === "object" && "status" in error) throw error;
		throw CustomEventErrors.updateFailed();
	}
}
