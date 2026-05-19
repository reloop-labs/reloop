import type { DatabaseInstance } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
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
	if (channels && channels.length > 0) {
		log.info("Enrolling contact in channels");
		await db.insert(schema.channelSubscription).values(
			channels.map((channel) => ({
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
