import {
	AuthErrors,
	ChannelErrors,
} from "@be/contacts/error/contacts.error-response";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";
import { verifyToken } from "../token.utils";

export async function updatePreferenceController({
	token,
	channelId,
	subscribe,
}: {
	token: string;
	channelId: string;
	subscribe: boolean;
}) {
	const log = useLogger();
	log.info("Updating preference", { channelId, subscribe });

	const payload = await verifyToken(token);
	if (!payload) {
		throw AuthErrors.unauthorized("Invalid or expired preferences token");
	}

	const { contactId, organizationId } = payload;

	// Verify the channel exists, is public, and belongs to this org
	const channel = await db.query.channel.findFirst({
		where: and(
			eq(schema.channel.id, channelId),
			eq(schema.channel.organizationId, organizationId),
			eq(schema.channel.visibility, "public"),
			isNull(schema.channel.deletedAt),
		),
	});

	if (!channel) {
		throw ChannelErrors.notFound(channelId);
	}

	const targetStatus = subscribe ? "enrolled" : "unenrolled";

	const existing = await db.query.channelSubscription.findFirst({
		where: and(
			eq(schema.channelSubscription.contactId, contactId),
			eq(schema.channelSubscription.channelId, channelId),
			isNull(schema.channelSubscription.deletedAt),
		),
	});

	if (existing) {
		await db
			.update(schema.channelSubscription)
			.set({ status: targetStatus, updatedAt: new Date() })
			.where(eq(schema.channelSubscription.id, existing.id));
	} else {
		await db.insert(schema.channelSubscription).values({
			contactId,
			channelId,
			organizationId,
			status: targetStatus,
		});
	}

	log.info("Preference updated", {
		contactId,
		channelId,
		currentStatus: targetStatus,
	});

	return {
		success: true,
		channelId,
		status: targetStatus,
	};
}
