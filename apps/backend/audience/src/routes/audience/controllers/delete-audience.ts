import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";
import { status } from "elysia";

export async function deleteAudience(
	audienceId: string,
	organizationId: string,
): Promise<{ message: string }> {
	logger.info(
		{
			audienceId,
			organizationId,
		},
		"Deleting audience",
	);

	try {
		// Check if audience exists
		const existingAudience = await db.query.audience.findFirst({
			where: and(
				eq(schema.audience.id, audienceId),
				eq(schema.audience.organizationId, organizationId),
			),
		});

		if (!existingAudience) {
			logger.warn({ audienceId, organizationId }, "Audience not found");
			throw status(404, { message: "Audience not found" });
		}

		// Delete the audience (hard delete as it's just removing from a group)
		await db
			.delete(schema.audience)
			.where(
				and(
					eq(schema.audience.id, audienceId),
					eq(schema.audience.organizationId, organizationId),
				),
			);

		logger.info(
			{
				audienceId,
				organizationId,
			},
			"Audience deleted successfully",
		);

		return { message: "Audience deleted successfully" };
	} catch (error) {
		logger.error(
			{
				audienceId,
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error deleting audience",
		);
		throw error;
	}
}

export async function deleteAudienceHandler(
	audienceId: string,
	organizationId: string,
): Promise<{ message: string }> {
	return deleteAudience(audienceId, organizationId);
}
