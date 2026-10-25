import {
	ContactErrors,
	isAppError,
} from "@be/contacts/error/contacts.error-response";
import type { ChannelTypes } from "@be/contacts/types/channel.type";
import { db } from "@reloop/db/client";
import {
	afterCursor,
	cursorOrderBy,
	decodeCursor,
	toCursorPage,
} from "@reloop/db/pagination";
import * as schema from "@reloop/db/schema";
import { CHANNEL_LIST_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export const listChannelsController = async ({
	organizationId,
	page: rawPage,
	limit: rawLimit,
	cursor,
}: {
	organizationId: string;
	page?: number;
	limit?: number;
	cursor?: string;
}): Promise<ChannelTypes.ChannelListResponse> => {
	const log = useLogger();
	const page = rawPage || 1;
	const limit = Math.min(rawLimit || 100, 100);
	// With a cursor, pagination is keyset-based and `page` is ignored.
	const position = cursor ? decodeCursor(cursor) : null;
	const offset = position ? 0 : (page - 1) * limit;

	log.info("Listing channels", { page, limit });

	try {
		const whereClause = and(
			isNull(schema.channel.deletedAt),
			eq(schema.channel.organizationId, organizationId),
		);

		// Counted separately: COUNT(*) OVER() would only see rows after the cursor.
		const [totalResult, rows] = await Promise.all([
			db
				.select({ total: sql<number>`COUNT(*)`.mapWith(Number) })
				.from(schema.channel)
				.where(whereClause),
			db
				.select({
					channel: schema.channel,
					createdAt: schema.channel.createdAt,
					id: schema.channel.id,
				})
				.from(schema.channel)
				.where(
					position
						? and(whereClause, afterCursor(schema.channel, position))
						: whereClause,
				)
				.orderBy(...cursorOrderBy(schema.channel))
				.limit(limit + 1)
				.offset(offset),
		]);
		const { items, hasMore, nextCursor } = toCursorPage(rows, limit);
		const total = Number(totalResult[0]?.total ?? 0);

		const channelIds = items.map(({ channel }) => channel.id);
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
			total,
			page,
			limit,
		});
		return {
			object: "channel",
			channels: items.map(({ channel }) => ({
				id: channel.id,
				name: channel.name,
				description: channel.description,
				defaultSubscription: channel.defaultSubscription,
				visibility: channel.visibility,
				createdAt: channel.createdAt,
				updatedAt: channel.updatedAt,
				subscriberCount: countByChannelId.get(channel.id) ?? 0,
			})),
			total,
			page,
			limit,
			hasMore,
			nextCursor,
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
