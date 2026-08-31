import { CampaignErrors } from "@be/template/error/campaign.error";
import { resolveSendableAudience } from "@be/template/lib/campaign/resolve-audience";
import { db } from "@reloop/db/client";
import type { Campaign } from "@reloop/db/schema";
import * as schema from "@reloop/db/schema";
import { and, count, eq } from "drizzle-orm";

const INSERT_CHUNK = 1_000;

export async function snapshotAudience(campaign: Campaign): Promise<number> {
	const existing = await db
		.select({ value: count() })
		.from(schema.campaignRecipient)
		.where(eq(schema.campaignRecipient.campaignId, campaign.id));
	const already = Number(existing[0]?.value ?? 0);
	if (already > 0) return already;

	const rows = await resolveSendableAudience(campaign);
	if (rows.length === 0) {
		throw CampaignErrors.emptyAudience();
	}

	for (let i = 0; i < rows.length; i += INSERT_CHUNK) {
		const chunk = rows.slice(i, i + INSERT_CHUNK).map((row) => ({
			campaignId: campaign.id,
			organizationId: campaign.organizationId,
			contactId: row.contactId,
			email: row.email,
			status: "pending" as const,
		}));
		await db
			.insert(schema.campaignRecipient)
			.values(chunk)
			.onConflictDoNothing();
	}

	const total = await db
		.select({ value: count() })
		.from(schema.campaignRecipient)
		.where(
			and(
				eq(schema.campaignRecipient.campaignId, campaign.id),
				eq(schema.campaignRecipient.status, "pending"),
			),
		);
	const recipientCount = Number(total[0]?.value ?? 0);
	if (recipientCount === 0) {
		throw CampaignErrors.emptyAudience();
	}

	await db
		.update(schema.campaign)
		.set({ recipientCount, updatedAt: new Date() })
		.where(eq(schema.campaign.id, campaign.id));

	return recipientCount;
}
