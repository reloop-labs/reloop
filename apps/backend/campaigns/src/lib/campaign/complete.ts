import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, count, eq, inArray } from "drizzle-orm";

export async function maybeCompleteCampaign(campaignId: string): Promise<void> {
	const remaining = await db
		.select({ value: count() })
		.from(schema.campaignRecipient)
		.where(
			and(
				eq(schema.campaignRecipient.campaignId, campaignId),
				inArray(schema.campaignRecipient.status, ["pending", "sending"]),
			),
		);

	if (Number(remaining[0]?.value ?? 0) > 0) return;

	await db
		.update(schema.campaign)
		.set({
			status: "sent",
			sentAt: new Date(),
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(schema.campaign.id, campaignId),
				eq(schema.campaign.status, "sending"),
			),
		);
}
