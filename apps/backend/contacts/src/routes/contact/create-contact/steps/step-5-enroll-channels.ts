import type { DatabaseInstance } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function enrollChannels_step5({
	contactId,
	channels,
	organizationId,
	db,
}: {
	contactId: string;
	channels?: { channelId: string; subscription: "opt_in" | "opt_out" }[];
	organizationId: string;
	db: DatabaseInstance;
}) {
	const log = useLogger();
	if (!channels || channels.length === 0) return;

	const requestedChannelIds = channels.map((c) => c.channelId);

	const validChannels = await db
		.select({ id: schema.channel.id })
		.from(schema.channel)
		.where(
			and(
				inArray(schema.channel.id, requestedChannelIds),
				eq(schema.channel.organizationId, organizationId),
				isNull(schema.channel.deletedAt),
			),
		);

	const validChannelIdSet = new Set(validChannels.map((c) => c.id));

	const dropped = requestedChannelIds.length - validChannelIdSet.size;
	if (dropped > 0) {
		log.warn("Dropped channel IDs that do not belong to the organization", {
			organizationId,
			dropped,
		});
	}

	const validEntries = channels.filter((c) =>
		validChannelIdSet.has(c.channelId),
	);

	if (validEntries.length > 0) {
		log.info("Enrolling contact in channels");
		await db.insert(schema.channelSubscription).values(
			validEntries.map((channel) => ({
				contactId,
				channelId: channel.channelId,
				organizationId,
				status: (channel.subscription === "opt_in"
					? "enrolled"
					: "unenrolled") as "enrolled" | "unenrolled",
			})),
		);
	}
}
