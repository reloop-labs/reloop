import {
	ContactErrors,
	PropertyErrors,
} from "@be/contacts/error/contacts.error-response";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { PROPERTY_DELETE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export const deletePropertyController = async ({
	organizationId,
	property_id,
}: {
	organizationId: string;
	property_id: string;
}): Promise<{
	object: "contact_property";
	success: boolean;
	id: string;
	name: string;
	event: string;
}> => {
	const log = useLogger();
	log.info("Deleting property", { property_id });

	try {
		const property = await db.query.contactProperty.findFirst({
			where: and(
				eq(schema.contactProperty.id, property_id),
				eq(schema.contactProperty.organizationId, organizationId),
				isNull(schema.contactProperty.deletedAt),
			),
		});

		if (!property) {
			log.warn("Property not found or already deleted", { property_id });
			throw PropertyErrors.notFound(property_id);
		}

		await db
			.update(schema.contactProperty)
			.set({ deletedAt: new Date(), updatedAt: new Date() })
			.where(
				and(
					eq(schema.contactProperty.id, property_id),
					eq(schema.contactProperty.organizationId, organizationId),
				),
			);

		log.info("Property deleted successfully", { property_id });

		const result = {
			object: "contact_property" as const,
			success: true,
			id: property.id,
			name: property.propertyName,
			event: PROPERTY_DELETE_WEBHOOK_EVENT.id,
		};

		return result;
	} catch (error) {
		log.error("Debug deleting property", {
			property_id,
			error: error instanceof Error ? error.message : String(error),
		});
		if (error && typeof error === "object" && "status" in error) {
			throw error;
		}
		throw ContactErrors.databaseError(
			error instanceof Error ? error.message : String(error),
		);
	}
};
