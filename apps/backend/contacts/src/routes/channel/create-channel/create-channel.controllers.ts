import {
	ChannelErrors,
	ContactErrors,
} from "@be/contacts/error/contacts.error-response";
import type { ChannelTypes } from "@be/contacts/types/channel.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { CHANNEL_CREATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export const createChannelController = async ({
	organizationId,
	userId,
	name,
	description,
	defaultSubscription,
	visibility,
}: {
	organizationId: string;
	userId: string;
	name: string;
	description?: string;
	defaultSubscription?: "opt_in" | "opt_out";
	visibility?: "private" | "public";
}): Promise<ChannelTypes.ChannelResponse> => {
	const log = useLogger();
	log.info("Creating channel", { name });
	try {
		const existingChannel = await db.query.channel.findFirst({
			where: and(
				eq(schema.channel.name, name),
				eq(schema.channel.organizationId, organizationId),
				isNull(schema.channel.deletedAt),
			),
		});

		if (existingChannel) {
			log.warn("Channel already exists", { name });
			throw ChannelErrors.alreadyExists(name);
		}

		const [newChannel] = await db
			.insert(schema.channel)
			.values({
				name,
				description: description ?? null,
				organizationId,
				userId,
				defaultSubscription: defaultSubscription ?? "opt_in",
				visibility: visibility ?? "private",
			})
			.returning();

		if (!newChannel) {
			log.error("Failed to create channel - no data returned", { name });
			throw ContactErrors.createFailed("Failed to create channel");
		}

		log.info("Channel created successfully", { name, id: newChannel.id });

		const result = {
			id: newChannel.id,
			name: newChannel.name,
			description: newChannel.description,
			defaultSubscription: newChannel.defaultSubscription,
			visibility: newChannel.visibility,
			createdAt: newChannel.createdAt,
			updatedAt: newChannel.updatedAt,
			object: "channel" as const,
			event: CHANNEL_CREATE_WEBHOOK_EVENT.id,
		};

		return result;
	} catch (error) {
		log.error("Debug creating channel", {
			name,
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
