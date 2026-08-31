import { snapshotAudience } from "@be/template/lib/campaign/snapshot";
import {
	campaignBatchJobId,
	campaignQueue,
	enqueueCampaignStart,
} from "@be/template/queues/campaign.queue";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, count, eq, inArray } from "drizzle-orm";

export const CAMPAIGN_BATCH_SIZE = 50;

export async function startCampaignSend(params: {
	campaignId: string;
	organizationId: string;
}): Promise<void> {
	const [campaign] = await db
		.update(schema.campaign)
		.set({
			status: "sending",
			startedAt: new Date(),
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(schema.campaign.id, params.campaignId),
				eq(schema.campaign.organizationId, params.organizationId),
				inArray(schema.campaign.status, ["draft", "scheduled", "sending"]),
			),
		)
		.returning();

	if (!campaign) return;

	try {
		await snapshotAudience(campaign);
	} catch (error) {
		await db
			.update(schema.campaign)
			.set({
				status: campaign.scheduledAt ? "scheduled" : "draft",
				lastError: error instanceof Error ? error.message : String(error),
				updatedAt: new Date(),
			})
			.where(eq(schema.campaign.id, campaign.id));
		throw error;
	}

	const pending = await db
		.select({ id: schema.campaignRecipient.id })
		.from(schema.campaignRecipient)
		.where(
			and(
				eq(schema.campaignRecipient.campaignId, campaign.id),
				eq(schema.campaignRecipient.status, "pending"),
			),
		);

	if (pending.length === 0) {
		await maybeCompleteCampaign(campaign.id);
		return;
	}

	for (let i = 0; i < pending.length; i += CAMPAIGN_BATCH_SIZE) {
		const recipientIds = pending
			.slice(i, i + CAMPAIGN_BATCH_SIZE)
			.map((row) => row.id);
		const firstId = recipientIds[0];
		if (!firstId) continue;
		await campaignQueue.add(
			"send_batch",
			{
				type: "send_batch",
				campaignId: campaign.id,
				organizationId: campaign.organizationId,
				recipientIds,
			},
			{ jobId: campaignBatchJobId(campaign.id, firstId) },
		);
	}
}

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

export async function scheduleCampaignStart(params: {
	campaignId: string;
	organizationId: string;
	scheduledAt: Date;
}): Promise<void> {
	const delayMs = Math.max(0, params.scheduledAt.getTime() - Date.now());
	await enqueueCampaignStart({
		campaignId: params.campaignId,
		organizationId: params.organizationId,
		delayMs,
	});
}
