import { formatAudienceResponse } from "@be/audience/routes/audience/controllers/format-audience-response";
import type { AudienceTypes } from "@be/audience/types/audience.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";
import { status } from "elysia";

export async function getAudience(
	audienceId: string,
	organizationId: string,
): Promise<AudienceTypes.AudienceResponse> {
	logger.info(
		{
			audienceId,
			organizationId,
		},
		"Getting audience",
	);

	try {
		const audience = await db.query.audience.findFirst({
			where: and(
				eq(schema.audience.id, audienceId),
				eq(schema.audience.organizationId, organizationId),
			),
			with: {
				audienceGroup: true,
			},
		});

		if (!audience) {
			logger.warn({ audienceId, organizationId }, "Audience not found");
			throw status(404, { message: "Audience not found" });
		}

		logger.info(
			{
				audienceId,
				organizationId,
			},
			"Audience retrieved successfully",
		);

		return formatAudienceResponse(audience);
	} catch (error) {
		logger.error(
			{
				audienceId,
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error getting audience",
		);
		throw error;
	}
}

export async function getAudienceHandler(
	audienceId: string,
	organizationId: string,
): Promise<AudienceTypes.AudienceResponse> {
	return getAudience(audienceId, organizationId);
}
