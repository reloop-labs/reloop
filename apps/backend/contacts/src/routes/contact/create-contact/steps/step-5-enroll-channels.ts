import type { DatabaseInstance } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

type ChannelEnrollmentInput = {
	channelId: string;
	subscription: "opt_in" | "opt_out";
};

export async function enrollChannels_step5({
	contactId,
	channels,
	organizationId,
	db,
}: {
	contactId: string;
	channels?: ChannelEnrollmentInput[];
	organizationId: string;
	db: DatabaseInstance;
}) {
	const log = useLogger();

	// Channels with defaultSubscription = opt_in auto-enroll new contacts.
	const optInChannels = await db
		.select({ id: schema.channel.id })
		.from(schema.channel)
		.where(
			and(
				eq(schema.channel.organizationId, organizationId),
				eq(schema.channel.defaultSubscription, "opt_in"),
				isNull(schema.channel.deletedAt),
			),
		);

	const enrollmentByChannelId = new Map<string, "opt_in" | "opt_out">();
	for (const channel of optInChannels) {
		enrollmentByChannelId.set(channel.id, "opt_in");
	}

	// Explicit request body wins over channel defaults.
	const explicitChannels = channels ?? [];
	if (explicitChannels.length > 0) {
		const requestedChannelIds = explicitChannels.map((c) => c.channelId);
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

		for (const channel of explicitChannels) {
			if (!validChannelIdSet.has(channel.channelId)) continue;
			enrollmentByChannelId.set(channel.channelId, channel.subscription);
		}
	}

	const entries = [...enrollmentByChannelId.entries()];
	if (entries.length === 0) return;

	log.info("Enrolling contact in channels", {
		contactId,
		channelCount: entries.length,
		autoOptInCount: optInChannels.length,
		explicitCount: explicitChannels.length,
	});

	await db
		.insert(schema.channelSubscription)
		.values(
			entries.map(([channelId, subscription]) => ({
				contactId,
				channelId,
				organizationId,
				status: (subscription === "opt_in" ? "enrolled" : "unenrolled") as
					| "enrolled"
					| "unenrolled",
			})),
		)
		.onConflictDoUpdate({
			target: [
				schema.channelSubscription.contactId,
				schema.channelSubscription.channelId,
			],
			set: {
				status: sql`excluded.status`,
				deletedAt: null,
				updatedAt: new Date(),
			},
		});
}
