import type { ChannelTypes } from "@be/contacts/types/channel.type";
import { createLog } from "@be/contacts/utils/logger";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { CHANNEL_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";
import { useLogger } from "evlog/elysia";

export const updateChannelController = async ({
	activeOrganizationId,
	channel_id,
	name,
	description,
	visibility,
	cookie,
	requestDetails,
}: {
	activeOrganizationId: string;
	channel_id: string;
	name?: string;
	description?: string;
	visibility?: "private" | "public";
	cookie?: string;
	requestDetails?: {
		endpoint?: string;
		method?: string;
		userAgent?: string;
		ipAddress?: string;
		statusCode?: number;
	};
}): Promise<ChannelTypes.ChannelResponse> => {
	const logger = useLogger();
	logger?.info("Updating channel", { channel_id, name });

	try {
		const existingChannel = await db.query.channel.findFirst({
			where: and(
				eq(schema.channel.id, channel_id),
				eq(schema.channel.organizationId, activeOrganizationId),
				isNull(schema.channel.deletedAt),
			),
		});

		if (!existingChannel) {
			logger?.warn("Channel not found", { channel_id });
			throw status(404, { message: "Channel not found" });
		}

		if (name && name !== existingChannel.name) {
			const duplicateName = await db.query.channel.findFirst({
				where: and(
					eq(schema.channel.name, name),
					eq(schema.channel.organizationId, activeOrganizationId),
					isNull(schema.channel.deletedAt),
				),
			});

			if (duplicateName) {
				logger?.warn("Channel with this name already exists", { channel_id, name });
				throw status(409, { message: "Channel with this name already exists" });
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
			logger?.error("Failed to update channel - no data returned", { channel_id });
			throw new Error("Failed to update channel");
		}

		logger?.info("Channel updated successfully", { channel_id });

		const result = {
			...updatedChannel,
			object: "channel" as const,
			event: CHANNEL_UPDATE_WEBHOOK_EVENT.id,
		};

		await createLog({
			event: CHANNEL_UPDATE_WEBHOOK_EVENT.id,
			cookie,
			metadata: result,
			requestDetails: { ...(requestDetails || {}), statusCode: 200 },
		});

		return result;
	} catch (error) {
		logger?.error("Debug updating channel", { channel_id, error: error instanceof Error ? error.message : String(error) });
		throw error;
	}
};
