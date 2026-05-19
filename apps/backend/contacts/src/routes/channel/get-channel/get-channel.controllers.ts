import {
	ChannelErrors,
	ContactErrors,
} from "@be/contacts/error/contacts.error-response";
import type { ChannelTypes } from "@be/contacts/types/channel.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { CHANNEL_GET_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export const getChannelController = async ({
	organizationId,
	channel_id,
}: {
	organizationId: string;
	channel_id: string;
}): Promise<ChannelTypes.ChannelResponse> => {
	const log = useLogger();
	log.info("Getting channel", { channel_id });
	try {
		const result = await db.query.channel.findFirst({
			where: and(
				eq(schema.channel.id, channel_id),
				eq(schema.channel.organizationId, organizationId),
				isNull(schema.channel.deletedAt),
			),
		});

		if (!result) {
			log.warn("Channel not found", { channel_id });
			throw ChannelErrors.notFound(channel_id);
		}

		log.info("Channel retrieved successfully", { channel_id });
		return {
			...result,
			object: "channel",
			event: CHANNEL_GET_WEBHOOK_EVENT.id,
		};
	} catch (error) {
		log.error("Debug getting channel", {
			channel_id,
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
