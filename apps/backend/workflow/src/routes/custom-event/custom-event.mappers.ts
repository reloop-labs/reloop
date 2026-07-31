import type * as schema from "@reloop/db/schema";

type EventRow = typeof schema.customEvent.$inferSelect;
type PropRow = typeof schema.customEventProperty.$inferSelect;

export function mapCustomEvent(row: EventRow, properties: PropRow[] = []) {
	return {
		id: row.id,
		organizationId: row.organizationId,
		name: row.name,
		key: row.key,
		description: row.description ?? null,
		properties: properties
			.slice()
			.sort((a, b) => a.name.localeCompare(b.name))
			.map((p) => ({
				id: p.id,
				name: p.name,
				propertyType: p.propertyType,
				required: p.required,
				defaultValue: p.defaultValue ?? null,
				description: p.description ?? null,
				createdAt: p.createdAt.toISOString(),
				updatedAt: p.updatedAt.toISOString(),
			})),
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	};
}
