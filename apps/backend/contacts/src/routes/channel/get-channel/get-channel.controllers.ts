import { log } from "evlog";
import type { ChannelTypes } from "@be/contacts/types/channel.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";

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
	logger?: any;
}): Promise<ChannelTypes.ChannelResponse> => {
	log.info({ ...({ channel_id }), message: "Getting channel" });
	try {
		const result = await db.query.channel.findFirst({
			where: and(
				eq(schema.channel.id, channel_id),
				eq(schema.channel.organizationId, activeOrganizationId),
				isNull(schema.channel.deletedAt),
			),
		});

		if (!result) {
			log.warn({ ...({ channel_id }), message: "Channel not found" });
			throw status(404, { message: "Channel not found" });
		}

		log.info({ ...({ channel_id }), message: "Channel retrieved successfully" });
		return {
			...result,
			object: "channel",
			event: CHANNEL_GET_WEBHOOK_EVENT.id,
		};
	} catch (error) {
		log.error({ ...({ channel_id, error }), message: "Debug getting channel" });
		throw error;
	}
};
