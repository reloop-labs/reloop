import type { PropertyTypes } from "@be/contacts/types/property.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { PROPERTY_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";
import { useLogger } from "evlog/elysia";

export const updatePropertyController = async ({
	organizationId,
	property_id,
	fallbackValue,
}: {
	organizationId: string;
	property_id: string;
	fallbackValue: string | null;
}): Promise<PropertyTypes.PropertyResponse> => {
	const logger = useLogger();
	logger?.info("Updating property", { property_id, fallbackValue });

	try {
		const existingProperty = await db
			.select()
			.from(schema.contactProperty)
			.where(
				and(
					eq(schema.contactProperty.id, property_id),
					eq(schema.contactProperty.organizationId, organizationId),
					isNull(schema.contactProperty.deletedAt),
				),
			)
			.limit(1);

		if (existingProperty.length === 0) {
			logger?.warn("Property not found", { property_id });
			throw status(404, { message: "Property not found" });
		}

		const [updatedProperty] = await db
			.update(schema.contactProperty)
			.set({ defaultValue: fallbackValue, updatedAt: new Date() })
			.where(eq(schema.contactProperty.id, property_id))
			.returning();

		if (!updatedProperty) {
			logger?.error("Failed to update property - no data returned", {
				property_id,
			});
			throw status(500, { message: "Failed to update property" });
		}

		logger?.info("Property updated successfully", { property_id });

		const result = {
			...updatedProperty,
			object: "contact_property" as const,
			event: PROPERTY_UPDATE_WEBHOOK_EVENT.id,
		};

		return result;
	} catch (error) {
		logger?.error("Debug updating property", {
			property_id,
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
};
