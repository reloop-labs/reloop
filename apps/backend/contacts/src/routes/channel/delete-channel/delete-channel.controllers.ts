import { log } from "evlog";
import { createLog } from "@be/contacts/utils/logger";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";

import { CHANNEL_DELETE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export const deleteChannelController = async ({
	activeOrganizationId,
	channel_id,
	logger,
	cookie,
	requestDetails,
}: {
	activeOrganizationId: string;
	channel_id: string;
	logger?: any;
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
	log.info({ ...({ channel_id }), message: "Deleting channel" });
	try {
		const channel = await db.query.channel.findFirst({
			where: and(
				eq(schema.channel.id, channel_id),
				eq(schema.channel.organizationId, activeOrganizationId),
				isNull(schema.channel.deletedAt),
			),
		});

		if (!channel) {
			log.warn({ ...({ channel_id }), message: "Channel not found or already deleted" });
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

		log.info({ ...({ channel_id }), message: "Channel deleted successfully" });

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
		log.error({ ...({ channel_id, error }), message: "Debug deleting channel" });
		throw error;
	}
};
