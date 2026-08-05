import {
	ContactErrors,
	isAppError,
} from "@be/contacts/error/contacts.error-response";
import type { ChannelTypes } from "@be/contacts/types/channel.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { CHANNEL_LIST_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
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
				total: sql<number>`COUNT(*) OVER()`.mapWith(Number),
			})
			.from(schema.channel)
			.where(whereClause)
			.orderBy(desc(schema.channel.createdAt))
			.limit(limit)
			.offset(offset);

		const channelIds = rows.map(({ channel }) => channel.id);
		const countByChannelId = new Map<string, number>();

		if (channelIds.length > 0) {
			const counts = await db
				.select({
					channelId: schema.channelSubscription.channelId,
					count: sql<number>`count(*)::int`.mapWith(Number),
				})
				.from(schema.channelSubscription)
				.where(
					and(
						inArray(schema.channelSubscription.channelId, channelIds),
						eq(schema.channelSubscription.status, "enrolled"),
						isNull(schema.channelSubscription.deletedAt),
					),
				)
				.groupBy(schema.channelSubscription.channelId);

			for (const row of counts) {
				countByChannelId.set(row.channelId, row.count);
			}
		}

		log.info("Channels listed successfully", {
			total: rows[0]?.total ?? 0,
			page,
			limit,
		});
		return {
			object: "channel",
			channels: rows.map(({ channel }) => ({
				id: channel.id,
				name: channel.name,
				description: channel.description,
				defaultSubscription: channel.defaultSubscription,
				visibility: channel.visibility,
				createdAt: channel.createdAt,
				updatedAt: channel.updatedAt,
				subscriberCount: countByChannelId.get(channel.id) ?? 0,
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
		if (isAppError(error)) {
			throw error;
		}
		throw ContactErrors.databaseError(
			error instanceof Error ? error.message : String(error),
		);
	}
};
