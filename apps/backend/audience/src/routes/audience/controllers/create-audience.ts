import type { AudienceTypes } from "@be/audience/types/audience.type";
import { formatAudienceResponse } from "@reloop/audience/routes/audience/controllers/format-audience-response";
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
			audienceGroupId: body.audienceGroupId,
			organizationId,
		},
		"Creating audience",
	);

	try {
		// Check if audience group exists and belongs to organization
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

		// Check if audience already exists in this group
		const existingAudience = await db
			.select()
			.from(schema.audience)
			.where(
				and(
					eq(schema.audience.email, body.email),
					eq(schema.audience.audienceGroupId, body.audienceGroupId),
					eq(schema.audience.organizationId, organizationId),
				),
			)
			.limit(1);

		if (existingAudience.length > 0) {
			logger.warn(
				{ email: body.email, audienceGroupId: body.audienceGroupId },
				"Audience already exists in this group",
			);
			throw status(409, { message: "Audience already exists in this group" });
		}

		const newAudience = await db
			.insert(schema.audience)
			.values({
				email: body.email,
				firstName: body.firstName || null,
				lastName: body.lastName || null,
				organizationId,
				audienceGroupId: body.audienceGroupId,
				status: body.status || "subscribed",
				addedAt: new Date(),
				unsubscribedAt: body.status === "unsubscribed" ? new Date() : null,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		if (!newAudience[0]) {
			logger.error(
				{ email: body.email },
				"Failed to create audience - no data returned",
			);
			throw status(500, { message: "Failed to create audience" });
		}

		// Get the audience with group information
		const audienceWithGroup = await db.query.audience.findFirst({
			where: eq(schema.audience.id, newAudience[0].id),
			with: {
				audienceGroup: true,
			},
		});

		if (!audienceWithGroup) {
			logger.error(
				{ email: body.email },
				"Failed to fetch audience with group information",
			);
			throw status(500, { message: "Failed to fetch audience data" });
		}

		logger.info(
			{
				email: body.email,
				id: newAudience[0].id,
				audienceGroupId: body.audienceGroupId,
			},
			"Audience created successfully",
		);

		return formatAudienceResponse(audienceWithGroup);
	} catch (error) {
		logger.error(
			{
				email: body.email,
				audienceGroupId: body.audienceGroupId,
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
