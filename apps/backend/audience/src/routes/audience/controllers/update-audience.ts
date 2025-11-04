import type { AudienceTypes } from "@reloop/audience/routes/audience/audience.type";
import { formatAudienceResponse } from "@reloop/audience/routes/audience/controllers/format-audience-response";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function updateAudience(
	audienceId: string,
	organizationId: string,
	body: AudienceTypes.UpdateAudienceRequest,
): Promise<AudienceTypes.AudienceResponse> {
	logger.info(
		{
			audienceId,
			organizationId,
			body,
		},
		"Updating audience",
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

		// If changing audience group, verify the new group exists and belongs to organization
		if (
			body.audienceGroupId &&
			body.audienceGroupId !== existingAudience.audienceGroupId
		) {
			const audienceGroup = await db.query.audienceGroup.findFirst({
				where: and(
					eq(schema.audienceGroup.id, body.audienceGroupId),
					eq(schema.audienceGroup.organizationId, organizationId),
					isNull(schema.audienceGroup.deletedAt),
				),
			});

			if (!audienceGroup) {
				logger.warn(
					{ audienceGroupId: body.audienceGroupId, organizationId },
					"Audience group not found",
				);
				throw status(404, { message: "Audience group not found" });
			}
		}

		// Update the audience
		const updateData: Partial<typeof schema.audience.$inferInsert> = {
			updatedAt: new Date(),
		};

		if (body.firstName !== undefined) {
			updateData.firstName = body.firstName;
		}
		if (body.lastName !== undefined) {
			updateData.lastName = body.lastName;
		}
		if (body.audienceGroupId !== undefined) {
			updateData.audienceGroupId = body.audienceGroupId;
		}

		const updatedAudience = await db
			.update(schema.audience)
			.set(updateData)
			.where(
				and(
					eq(schema.audience.id, audienceId),
					eq(schema.audience.organizationId, organizationId),
				),
			)
			.returning();

		if (!updatedAudience[0]) {
			logger.error(
				{ audienceId },
				"Failed to update audience - no data returned",
			);
			throw status(500, { message: "Failed to update audience" });
		}

		// Get the updated audience with group information
		const audienceWithGroup = await db.query.audience.findFirst({
			where: eq(schema.audience.id, audienceId),
			with: {
				audienceGroup: true,
			},
		});

		if (!audienceWithGroup) {
			logger.error(
				{ audienceId },
				"Failed to fetch updated audience with group information",
			);
			throw status(500, { message: "Failed to fetch audience data" });
		}

		logger.info(
			{
				audienceId,
				organizationId,
			},
			"Audience updated successfully",
		);

		return formatAudienceResponse(audienceWithGroup);
	} catch (error) {
		logger.error(
			{
				audienceId,
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error updating audience",
		);
		throw error;
	}
}

export async function updateAudienceHandler(
	audienceId: string,
	organizationId: string,
	body: AudienceTypes.UpdateAudienceRequest,
): Promise<AudienceTypes.AudienceResponse> {
	return updateAudience(audienceId, organizationId, body);
}
