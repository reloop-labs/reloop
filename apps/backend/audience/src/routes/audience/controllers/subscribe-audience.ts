import { formatAudienceResponse } from "@be/audience/routes/audience/controllers/format-audience-response";
import type { AudienceTypes } from "@be/audience/types/audience.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";
import { status } from "elysia";

export async function subscribeAudience(
	audienceId: string,
	organizationId: string,
	body: AudienceTypes.SubscribeAudienceRequest,
): Promise<AudienceTypes.AudienceResponse> {
	logger.info(
		{
			audienceId,
			organizationId,
			reason: body.reason,
		},
		"Subscribing audience",
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

		// Update audience status to subscribed
		const updatedAudience = await db
			.update(schema.audience)
			.set({
				status: "subscribed",
				unsubscribedAt: null,
				updatedAt: new Date(),
			})
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
				"Failed to subscribe audience - no data returned",
			);
			throw status(500, { message: "Failed to subscribe audience" });
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
			"Audience subscribed successfully",
		);

		return formatAudienceResponse(audienceWithGroup);
	} catch (error) {
		logger.error(
			{
				audienceId,
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error subscribing audience",
		);
		throw error;
	}
}

export async function subscribeAudienceHandler(
	audienceId: string,
	organizationId: string,
	body: AudienceTypes.SubscribeAudienceRequest,
): Promise<AudienceTypes.AudienceResponse> {
	return subscribeAudience(audienceId, organizationId, body);
}
