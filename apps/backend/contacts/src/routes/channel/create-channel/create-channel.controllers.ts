import type { ChannelTypes } from "@be/contacts/types/channel.type";
import { createLog } from "@be/contacts/utils/logger";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { CHANNEL_CREATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export const createChannelController = async ({
	activeOrganizationId,
	userId,
	name,
	description,
	defaultSubscription,
	visibility,
	logger,
	cookie,
	requestDetails,
}: {
	activeOrganizationId: string;
	userId: string;
	name: string;
	description?: string;
	defaultSubscription?: "opt_in" | "opt_out";
	visibility?: "private" | "public";
	logger?: any;
	cookie?: string;
	requestDetails?: {
		endpoint?: string;
		method?: string;
		userAgent?: string;
		ipAddress?: string;
		statusCode?: number;
	};
}): Promise<ChannelTypes.ChannelResponse> => {
	logger?.info("Creating channel", { name });
	try {
		const existingChannel = await db.query.channel.findFirst({
			where: and(
				eq(schema.channel.name, name),
				eq(schema.channel.organizationId, activeOrganizationId),
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
				organizationId: activeOrganizationId,
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

		await createLog({
			event: CHANNEL_CREATE_WEBHOOK_EVENT.id,
			cookie,
			metadata: result,
			requestDetails: { ...(requestDetails || {}), statusCode: 201 },
		});

		return result;
	} catch (error) {
		logger?.error("Debug creating channel", { name, error });
		throw error;
	}
};
