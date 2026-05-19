import {
	ChannelErrors,
	ContactErrors,
} from "@be/contacts/error/contacts.error-response";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { CHANNEL_DELETE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export const deleteChannelController = async ({
	organizationId,
	channel_id,
}: {
	organizationId: string;
	channel_id: string;
}): Promise<{
	object: "channel";
	success: boolean;
	id: string;
	name: string;
	event: string;
}> => {
	const log = useLogger();
	log.info("Deleting channel", { channel_id });
	try {
		const channel = await db.query.channel.findFirst({
			where: and(
				eq(schema.channel.id, channel_id),
				eq(schema.channel.organizationId, organizationId),
				isNull(schema.channel.deletedAt),
			),
		});

		if (!channel) {
			log.warn("Channel not found or already deleted", { channel_id });
			throw ChannelErrors.notFound(channel_id);
		}

		await db
			.update(schema.channel)
			.set({ deletedAt: new Date(), updatedAt: new Date() })
			.where(
				and(
					eq(schema.channel.id, channel_id),
					eq(schema.channel.organizationId, organizationId),
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
					eq(schema.channelSubscription.organizationId, organizationId),
					isNull(schema.channelSubscription.deletedAt),
				),
			);

		log.info("Channel deleted successfully", { channel_id });

		const result = {
			object: "channel" as const,
			success: true,
			id: channel.id,
			name: channel.name,
			event: CHANNEL_DELETE_WEBHOOK_EVENT.id,
		};

		return result;
	} catch (error) {
		log.error("Debug deleting channel", {
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
