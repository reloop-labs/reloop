import type { ChannelTypes } from "@be/contacts/types/channel.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { CHANNEL_GET_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";
import { useLogger } from "evlog/elysia";

export const getChannelController = async ({
	activeOrganizationId,
	channel_id,
}: {
	activeOrganizationId: string;
	channel_id: string;
}): Promise<ChannelTypes.ChannelResponse> => {
	const logger = useLogger();
	logger?.info("Getting channel", { channel_id });
	try {
		const result = await db.query.channel.findFirst({
			where: and(
				eq(schema.channel.id, channel_id),
				eq(schema.channel.organizationId, activeOrganizationId),
				isNull(schema.channel.deletedAt),
			),
		});

		if (!result) {
			logger?.warn("Channel not found", { channel_id });
			throw status(404, { message: "Channel not found" });
		}

		logger?.info("Channel retrieved successfully", { channel_id });
		return {
			...result,
			object: "channel",
			event: CHANNEL_GET_WEBHOOK_EVENT.id,
		};
	} catch (error) {
		logger?.error("Debug getting channel", { channel_id, error: error instanceof Error ? error.message : String(error) });
		throw error;
	}
};
