import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function deleteAudienceGroup(
	groupId: string,
	organizationId: string,
): Promise<{ message: string }> {
	logger.info(
		{
			groupId,
			organizationId,
		},
		"Deleting audience group",
	);

	try {
		// Check if audience group exists
		const existingGroup = await db.query.audienceGroup.findFirst({
			where: and(
				eq(schema.audienceGroup.id, groupId),
				eq(schema.audienceGroup.organizationId, organizationId),
				isNull(schema.audienceGroup.deletedAt),
			),
		});

		if (!existingGroup) {
			logger.warn({ groupId, organizationId }, "Audience group not found");
			throw status(404, { message: "Audience group not found" });
		}

		// Soft delete the audience group
		await db
			.update(schema.audienceGroup)
			.set({
				deletedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(schema.audienceGroup.id, groupId),
					eq(schema.audienceGroup.organizationId, organizationId),
				),
			);

		logger.info(
			{
				groupId,
				organizationId,
			},
			"Audience group deleted successfully",
		);

		return { message: "Audience group deleted successfully" };
	} catch (error) {
		logger.error(
			{
				groupId,
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error deleting audience group",
		);
		throw error;
	}
}

export async function deleteAudienceGroupHandler(
	groupId: string,
	organizationId: string,
): Promise<{ message: string }> {
	return deleteAudienceGroup(groupId, organizationId);
}
