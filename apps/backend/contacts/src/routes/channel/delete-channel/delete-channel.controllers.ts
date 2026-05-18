import { createLog } from "@be/contacts/utils/logger";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { CHANNEL_DELETE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";
import { useLogger } from "evlog/elysia";

export const deleteChannelController = async ({
	activeOrganizationId,
	channel_id,
	cookie,
	requestDetails,
}: {
	activeOrganizationId: string;
	channel_id: string;
	cookie?: string;
	requestDetails?: {
		endpoint?: string;
		method?: string;
		userAgent?: string;
		ipAddress?: string;
		statusCode?: number;
	};
}): Promise<{
	object: "channel";
	success: boolean;
	id: string;
	name: string;
	event: string;
}> => {
	const logger = useLogger();
	logger?.info("Deleting channel", { channel_id });
	try {
		const channel = await db.query.channel.findFirst({
			where: and(
				eq(schema.channel.id, channel_id),
				eq(schema.channel.organizationId, activeOrganizationId),
				isNull(schema.channel.deletedAt),
			),
		});

		if (!channel) {
			logger?.warn("Channel not found or already deleted", { channel_id });
			throw status(404, { message: "Channel not found" });
		}

		await db
			.update(schema.channel)
			.set({ deletedAt: new Date(), updatedAt: new Date() })
			.where(
				and(
					eq(schema.channel.id, channel_id),
					eq(schema.channel.organizationId, activeOrganizationId),
					isNull(schema.channel.deletedAt),
				),
			);

		// Unsubscribe all contacts gracefully by soft deleting their enrollments
		await db
			.update(schema.channelSubscription)
			.set({ deletedAt: new Date(), updatedAt: new Date() })
			.where(
				and(
					eq(schema.channelSubscription.channelId, channel_id),
					eq(schema.channelSubscription.organizationId, activeOrganizationId),
					isNull(schema.channelSubscription.deletedAt),
				),
			);

		logger?.info("Channel deleted successfully", { channel_id });

		const result = {
			object: "channel" as const,
			success: true,
			id: channel.id,
			name: channel.name,
			event: CHANNEL_DELETE_WEBHOOK_EVENT.id,
		};

		await createLog({
			event: CHANNEL_DELETE_WEBHOOK_EVENT.id,
			cookie,
			metadata: result,
			requestDetails: { ...(requestDetails || {}), statusCode: 200 },
		});

		return result;
	} catch (error) {
		logger?.error("Debug deleting channel", { channel_id, error: error instanceof Error ? error.message : String(error) });
		throw error;
	}
};
