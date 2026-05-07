import type { ChannelTypes } from "@be/contacts/types/channel.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { CHANNEL_GET_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export const getChannelController = async ({
	activeOrganizationId,
	channel_id,
	logger,
}: {
	activeOrganizationId: string;
	channel_id: string;
	logger: Logger;
}): Promise<ChannelTypes.ChannelResponse> => {
	logger.info({ channel_id }, "Getting channel");
	try {
		const result = await db.query.channel.findFirst({
			where: and(
				eq(schema.channel.id, channel_id),
				eq(schema.channel.organizationId, activeOrganizationId),
				isNull(schema.channel.deletedAt),
			),
		});

		if (!result) {
			logger.warn({ channel_id }, "Channel not found");
			throw status(404, { message: "Channel not found" });
		}

		logger.info({ channel_id }, "Channel retrieved successfully");
		return {
			...result,
			object: "channel",
			event: CHANNEL_GET_WEBHOOK_EVENT.id,
		};
	} catch (error) {
		logger.error({ channel_id, error }, "Debug getting channel");
		throw error;
	}
};
