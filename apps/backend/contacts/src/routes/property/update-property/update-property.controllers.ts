import type { PropertyTypes } from "@be/contacts/types/property.type";
import { PropertyErrors, ContactErrors } from "@be/contacts/error/contacts.error-response";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { PROPERTY_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
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
	const log = useLogger();
	log.info("Updating property", { property_id, fallbackValue });

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
			log.warn("Property not found", { property_id });
			throw PropertyErrors.notFound(property_id);
		}

		const [updatedProperty] = await db
			.update(schema.contactProperty)
			.set({ defaultValue: fallbackValue, updatedAt: new Date() })
			.where(eq(schema.contactProperty.id, property_id))
			.returning();

		if (!updatedProperty) {
			log.error("Failed to update property - no data returned", {
				property_id,
			});
			throw ContactErrors.databaseError("Failed to update property");
		}

		log.info("Property updated successfully", { property_id });

		const result = {
			...updatedProperty,
			object: "contact_property" as const,
			event: PROPERTY_UPDATE_WEBHOOK_EVENT.id,
		};

		return result;
	} catch (error) {
		log.error("Debug updating property", {
			property_id,
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
};
