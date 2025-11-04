import type { AudienceGroupTypes } from "@reloop/audience/routes/audience-group/audience-group.type";
import { formatAudienceGroupResponse } from "@reloop/audience/routes/audience-group/controllers/format-audience-group-response";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, count, eq, isNull, sql } from "drizzle-orm";
import { status } from "elysia";

export async function getAudienceGroup(
	groupId: string,
	organizationId: string,
): Promise<AudienceGroupTypes.AudienceGroupResponse> {
	logger.info(
		{
			groupId,
			organizationId,
		},
		"Getting audience group",
	);

	try {
		const group = await db.query.audienceGroup.findFirst({
			where: and(
				eq(schema.audienceGroup.id, groupId),
				eq(schema.audienceGroup.organizationId, organizationId),
				isNull(schema.audienceGroup.deletedAt),
			),
		});

		if (!group) {
			logger.warn({ groupId, organizationId }, "Audience group not found");
			throw status(404, { message: "Audience group not found" });
		}

		// Get audience counts
		const audienceCounts = await db
			.select({
				total: count(),
				subscribed: sql<number>`COUNT(CASE WHEN ${schema.audience.status} = 'subscribed' THEN 1 END)`,
				unsubscribed: sql<number>`COUNT(CASE WHEN ${schema.audience.status} = 'unsubscribed' THEN 1 END)`,
			})
			.from(schema.audience)
			.where(
				and(
					eq(schema.audience.audienceGroupId, groupId),
					eq(schema.audience.organizationId, organizationId),
				),
			);

		const groupWithCounts = {
			...group,
			audienceCount: audienceCounts[0]?.total || 0,
			subscribedCount: audienceCounts[0]?.subscribed || 0,
			unsubscribedCount: audienceCounts[0]?.unsubscribed || 0,
		};

		logger.info(
			{
				groupId,
				organizationId,
			},
			"Audience group retrieved successfully",
		);

		return formatAudienceGroupResponse(groupWithCounts);
	} catch (error) {
		logger.error(
			{
				groupId,
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error getting audience group",
		);
		throw error;
	}
}

export async function getAudienceGroupHandler(
	groupId: string,
	organizationId: string,
): Promise<AudienceGroupTypes.AudienceGroupResponse> {
	return getAudienceGroup(groupId, organizationId);
}
