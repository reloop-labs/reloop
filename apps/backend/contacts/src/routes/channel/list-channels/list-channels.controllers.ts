import type { ChannelTypes } from "@be/contacts/types/channel.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { CHANNEL_LIST_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, desc, eq, isNull, sql } from "drizzle-orm";

export const listChannelsController = async ({
	activeOrganizationId,
	page: rawPage,
	limit: rawLimit,
	logger,
}: {
	activeOrganizationId: string;
	page?: number;
	limit?: number;
	logger: Logger;
}): Promise<ChannelTypes.ChannelListResponse> => {
	const page = rawPage || 1;
	const limit = Math.min(rawLimit || 100, 100);
	const offset = (page - 1) * limit;

	logger.info({ page, limit }, "Listing channels");

	try {
		const whereClause = and(
			isNull(schema.channel.deletedAt),
			eq(schema.channel.organizationId, activeOrganizationId),
		);

		const rows = await db
			.select({
				channel: schema.channel,
				subscriberCount: sql<number>`(
          SELECT count(*)::int 
          FROM ${schema.channelSubscription} 
          WHERE ${schema.channelSubscription.channelId} = ${schema.channel.id} 
          AND ${schema.channelSubscription.status} = 'enrolled'
          AND ${schema.channelSubscription.deletedAt} IS NULL
        )`,
				total: sql<number>`COUNT(*) OVER()`,
			})
			.from(schema.channel)
			.where(whereClause)
			.orderBy(desc(schema.channel.createdAt))
			.limit(limit)
			.offset(offset);

		logger.info(
			{ total: rows[0]?.total ?? 0, page, limit },
			"Channels listed successfully",
		);
		return {
			object: "channel",
			channels: rows.map(({ channel, subscriberCount }) => ({
				id: channel.id,
				name: channel.name,
				description: channel.description,
				defaultSubscription: channel.defaultSubscription,
				visibility: channel.visibility,
				createdAt: channel.createdAt,
				updatedAt: channel.updatedAt,
				subscriberCount,
			})),
			total: Number(rows[0]?.total ?? 0),
			page,
			limit,
			event: CHANNEL_LIST_WEBHOOK_EVENT.id,
		};
	} catch (error) {
		logger.error({ error }, "Debug listing channels");
		throw error;
	}
};
