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

	// Upsert restores soft-deleted subscriptions instead of INSERT → unique conflict.
	await db
		.insert(schema.channelSubscription)
		.values({
			contactId,
			channelId,
			organizationId,
			status: targetStatus,
		})
		.onConflictDoUpdate({
			target: [
				schema.channelSubscription.contactId,
				schema.channelSubscription.channelId,
			],
			set: {
				status: targetStatus,
				deletedAt: null,
				updatedAt: new Date(),
			},
		});

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
