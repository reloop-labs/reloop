import type { ChannelTypes } from "@be/contacts/types/channel.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { CHANNEL_CREATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";
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
	const logger = useLogger();
	logger?.info("Creating channel", { name });
	try {
		const existingChannel = await db.query.channel.findFirst({
			where: and(
				eq(schema.channel.name, name),
				eq(schema.channel.organizationId, organizationId),
				isNull(schema.channel.deletedAt),
			),
		});

		if (existingChannel) {
			logger?.warn("Channel already exists", { name });
			throw status(409, { message: "Channel already exists" });
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
			logger?.error("Failed to create channel - no data returned", { name });
			throw new Error("Failed to create channel");
		}

		logger?.info("Channel created successfully", { name, id: newChannel.id });

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
		logger?.error("Debug creating channel", {
			name,
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
};
