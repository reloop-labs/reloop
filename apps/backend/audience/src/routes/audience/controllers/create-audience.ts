import { formatAudienceResponse } from "@be/audience/routes/audience/controllers/format-audience-response";
import type { AudienceTypes } from "@be/audience/types/audience.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function createAudience(
	organizationId: string,
	body: AudienceTypes.CreateAudienceRequest,
): Promise<AudienceTypes.AudienceResponse> {
	logger.info(
		{
			email: body.email,
			organizationId,
		},
		"Creating audience",
	);

	try {
		// Check if audience already exists in this organization
		const existingAudience = await db
			.select()
			.from(schema.audience)
			.where(
				and(
					eq(schema.audience.email, body.email),
					eq(schema.audience.organizationId, organizationId),
					isNull(schema.audience.deletedAt),
				),
			)
			.limit(1);

		if (existingAudience.length > 0) {
			logger.warn(
				{ email: body.email },
				"Audience already exists in this organization",
			);
			throw status(409, { message: "Audience already exists" });
		}

		const [newAudience] = await db
			.insert(schema.audience)
			.values({
				email: body.email,
				firstName: body.firstName || null,
				lastName: body.lastName || null,
				organizationId,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		if (!newAudience) {
			logger.error(
				{ email: body.email },
				"Failed to create audience - no data returned",
			);
			throw status(500, { message: "Failed to create audience" });
		}

		logger.info(
			{
				email: body.email,
				id: newAudience.id,
			},
			"Audience created successfully",
		);

		return formatAudienceResponse(newAudience);
	} catch (error) {
		logger.error(
			{
				email: body.email,
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error creating audience",
		);
		throw error;
	}
}

export async function createAudienceHandler(
	organizationId: string,
	body: AudienceTypes.CreateAudienceRequest,
): Promise<AudienceTypes.AudienceResponse> {
	return createAudience(organizationId, body);
}
