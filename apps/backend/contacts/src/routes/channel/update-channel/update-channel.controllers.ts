import {
	ChannelErrors,
	ContactErrors,
} from "@be/contacts/error/contacts.error-response";
import type { ChannelTypes } from "@be/contacts/types/channel.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { CHANNEL_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export const updateChannelController = async ({
	organizationId,
	channel_id,
	name,
	description,
	visibility,
}: {
	organizationId: string;
	channel_id: string;
	name?: string;
	description?: string;
	visibility?: "private" | "public";
}): Promise<ChannelTypes.ChannelResponse> => {
	const log = useLogger();
	log.info("Updating channel", { channel_id, name });

	try {
		const existingChannel = await db.query.channel.findFirst({
			where: and(
				eq(schema.channel.id, channel_id),
				eq(schema.channel.organizationId, organizationId),
				isNull(schema.channel.deletedAt),
			),
		});

		if (!existingChannel) {
			log.warn("Channel not found", { channel_id });
			throw ChannelErrors.notFound(channel_id);
		}

		if (name && name !== existingChannel.name) {
			const duplicateName = await db.query.channel.findFirst({
				where: and(
					eq(schema.channel.name, name),
					eq(schema.channel.organizationId, organizationId),
					isNull(schema.channel.deletedAt),
				),
			});

			if (duplicateName) {
				log.warn("Channel with this name already exists", {
					channel_id,
					name,
				});
				throw ChannelErrors.alreadyExists(name);
			}
		}

		const [updatedChannel] = await db
			.update(schema.channel)
			.set({
				...(name && { name }),
				...(description !== undefined && { description }),
				...(visibility && { visibility }),
				updatedAt: new Date(),
			})
			.where(eq(schema.channel.id, channel_id))
			.returning();

		if (!updatedChannel) {
			log.error("Failed to update channel - no data returned", {
				channel_id,
			});
			throw ContactErrors.databaseError("Failed to update channel");
		}

		log.info("Channel updated successfully", { channel_id });

		const result = {
			...updatedChannel,
			object: "channel" as const,
			event: CHANNEL_UPDATE_WEBHOOK_EVENT.id,
		};

		return result;
	} catch (error) {
		log.error("Debug updating channel", {
			channel_id,
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
};
