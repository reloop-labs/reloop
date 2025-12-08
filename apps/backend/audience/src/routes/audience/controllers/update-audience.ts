import { formatAudienceResponse } from "@be/audience/routes/audience/controllers/format-audience-response";
import type { AudienceTypes } from "@be/audience/types/audience.type";
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
				isNull(schema.audience.deletedAt),
			),
		});

		if (!existingAudience) {
			logger.warn({ audienceId, organizationId }, "Audience not found");
			throw status(404, { message: "Audience not found" });
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

		const [updatedAudience] = await db
			.update(schema.audience)
			.set(updateData)
			.where(
				and(
					eq(schema.audience.id, audienceId),
					eq(schema.audience.organizationId, organizationId),
				),
			)
			.returning();

		if (!updatedAudience) {
			logger.error(
				{ audienceId },
				"Failed to update audience - no data returned",
			);
			throw status(500, { message: "Failed to update audience" });
		}

		logger.info(
			{
				audienceId,
				organizationId,
			},
			"Audience updated successfully",
		);

		return formatAudienceResponse(updatedAudience);
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
