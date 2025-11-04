import type { AudienceGroupTypes } from "@reloop/audience/routes/audience-group/audience-group.type";
import { formatAudienceGroupResponse } from "@reloop/audience/routes/audience-group/controllers/format-audience-group-response";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function createAudienceGroup(
	organizationId: string,
	userId: string,
	body: AudienceGroupTypes.CreateAudienceGroupRequest,
): Promise<AudienceGroupTypes.AudienceGroupResponse> {
	logger.info(
		{
			name: body.name,
			organizationId,
			userId,
		},
		"Creating audience group",
	);

	try {
		const existingGroup = await db
			.select()
			.from(schema.audienceGroup)
			.where(
				and(
					eq(schema.audienceGroup.name, body.name),
					eq(schema.audienceGroup.organizationId, organizationId),
					isNull(schema.audienceGroup.deletedAt),
				),
			)
			.limit(1);

		if (existingGroup.length > 0) {
			logger.warn(
				{ name: body.name, organizationId },
				"Audience group already exists",
			);
			throw status(409, {
				message: "Audience group with this name already exists",
			});
		}

		const newGroup = await db
			.insert(schema.audienceGroup)
			.values({
				name: body.name,
				description: body.description || null,
				organizationId,
				userId,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		if (!newGroup[0]) {
			logger.error(
				{ name: body.name },
				"Failed to create audience group - no data returned",
			);
			throw status(500, { message: "Failed to create audience group" });
		}

		logger.info(
			{
				name: body.name,
				id: newGroup[0].id,
				organizationId,
			},
			"Audience group created successfully",
		);

		return formatAudienceGroupResponse(newGroup[0]);
	} catch (error) {
		logger.error(
			{
				name: body.name,
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error creating audience group",
		);
		throw error;
	}
}

export async function createAudienceGroupHandler(
	organizationId: string,
	userId: string,
	body: AudienceGroupTypes.CreateAudienceGroupRequest,
): Promise<AudienceGroupTypes.AudienceGroupResponse> {
	return createAudienceGroup(organizationId, userId, body);
}
