import { ContactErrors } from "@be/contacts/error/contacts.error-response";
import type { ChannelTypes } from "@be/contacts/types/channel.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { CHANNEL_LIST_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export const listChannelsController = async ({
	organizationId,
	page: rawPage,
	limit: rawLimit,
}: {
	organizationId: string;
	page?: number;
	limit?: number;
}): Promise<ChannelTypes.ChannelListResponse> => {
	const log = useLogger();
	const page = rawPage || 1;
	const limit = Math.min(rawLimit || 100, 100);
	const offset = (page - 1) * limit;

	log.info("Listing channels", { page, limit });

	try {
		const whereClause = and(
			isNull(schema.channel.deletedAt),
			eq(schema.channel.organizationId, organizationId),
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

		log.info("Channels listed successfully", {
			total: rows[0]?.total ?? 0,
			page,
			limit,
		});
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
		log.error("Debug listing channels", {
			error: error instanceof Error ? error.message : String(error),
		});
		if (error && typeof error === "object" && "status" in error) {
			throw error;
		}
		throw ContactErrors.databaseError(
			error instanceof Error ? error.message : String(error),
		);
	}
};
