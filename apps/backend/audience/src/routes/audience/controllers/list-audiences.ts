import { formatAudienceResponse } from "@be/audience/routes/audience/controllers/format-audience-response";
import type { AudienceTypes } from "@be/audience/types/audience.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, count, desc, eq, ilike, isNull, or, type SQL } from "drizzle-orm";

export async function listAudiences(
	organizationId: string,
	query: AudienceTypes.AudienceListQuery,
): Promise<AudienceTypes.AudienceListResponse> {
	logger.info(
		{
			organizationId,
			query,
		},
		"Listing audiences",
	);

	try {
		const page = query.page || 1;
		const limit = query.limit || 10;
		const offset = (page - 1) * limit;

		// Build where conditions
		const whereConditions: Array<SQL<unknown>> = [
			eq(schema.audience.organizationId, organizationId),
			isNull(schema.audience.deletedAt),
		];

		if (query.search) {
			const searchCondition = or(
				ilike(schema.audience.email, `%${query.search}%`),
				ilike(schema.audience.firstName, `%${query.search}%`),
				ilike(schema.audience.lastName, `%${query.search}%`),
			);

			if (searchCondition) {
				whereConditions.push(searchCondition);
			}
		}

		// Get total count
		const totalResult = await db
			.select({ count: count() })
			.from(schema.audience)
			.where(and(...whereConditions));

		const total = totalResult[0]?.count || 0;

		// Get audiences
		const audiences = await db.query.audience.findMany({
			where: and(...whereConditions),
			orderBy: desc(schema.audience.createdAt),
			limit,
			offset,
		});

		const formattedAudiences = audiences.map(formatAudienceResponse);

		logger.info(
			{
				organizationId,
				total,
				page,
				limit,
			},
			"Audience listed successfully",
		);

		return {
			audiences: formattedAudiences,
			total,
			page,
			limit,
		};
	} catch (error) {
		logger.error(
			{
				organizationId,
				query,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error listing audiences",
		);
		throw error;
	}
}

export async function listAudiencesHandler(
	organizationId: string,
	query: AudienceTypes.AudienceListQuery,
): Promise<AudienceTypes.AudienceListResponse> {
	return listAudiences(organizationId, query);
}
