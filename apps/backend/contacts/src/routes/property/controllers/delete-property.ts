import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";
import { status } from "elysia";

export async function deleteProperty(
	organizationId: string,
	contactPropertyId: string,
	logger: Logger,
): Promise<{ object: "contact_property"; success: boolean }> {
	logger.info(
		{
			contactPropertyId,
			organizationId,
		},
		"Deleting property",
	);

	try {
		// Check if property exists
		const existingProperty = await db
			.select()
			.from(schema.contactProperty)
			.where(
				and(
					eq(schema.contactProperty.id, contactPropertyId),
					eq(schema.contactProperty.organizationId, organizationId),
				),
			)
			.limit(1);

		if (existingProperty.length === 0) {
			logger.warn({ contactPropertyId }, "Property not found");
			throw status(404, { message: "Property not found" });
		}

		// Hard delete - actually remove the record
		await db
			.delete(schema.contactProperty)
			.where(eq(schema.contactProperty.id, contactPropertyId));

		logger.info({ contactPropertyId }, "Property deleted successfully");

		return { object: "contact_property" as const, success: true };
	} catch (error) {
		logger.error(
			{
				contactPropertyId,
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error deleting property",
		);
		throw error;
	}
}

export async function deletePropertyHandler(
	organizationId: string,
	contactPropertyId: string,
	logger: Logger,
): Promise<{ object: "contact_property"; success: boolean }> {
	return deleteProperty(organizationId, contactPropertyId, logger);
}
