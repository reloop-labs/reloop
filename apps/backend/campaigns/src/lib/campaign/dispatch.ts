import {
	CAMPAIGN_BATCH_SIZE,
	nextBatchDelayMs,
} from "@be/campaigns/lib/campaign/batch";
import { maybeCompleteCampaign } from "@be/campaigns/lib/campaign/complete";
import { sendCampaignRecipient } from "@be/campaigns/lib/campaign/send-recipient";
import { snapshotAudience } from "@be/campaigns/lib/campaign/snapshot";
import {
	campaignHasQueuedSend,
	enqueueCampaignBatch,
} from "@be/campaigns/queues/campaign.queue";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, asc, eq, inArray } from "drizzle-orm";

export { CAMPAIGN_BATCH_SIZE } from "@be/campaigns/lib/campaign/batch";
export { maybeCompleteCampaign } from "@be/campaigns/lib/campaign/complete";
export { scheduleCampaignStart } from "@be/campaigns/queues/campaign.queue";

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

	if (await campaignHasQueuedSend(campaign.id)) return;

	await enqueueCampaignBatch({
		campaignId: campaign.id,
		organizationId: campaign.organizationId,
		batchIndex: 0,
	});
}

export async function sendCampaignBatch(params: {
	campaignId: string;
	organizationId: string;
	batchIndex: number;
	recipientIds?: string[];
}): Promise<void> {
	const campaign = await db.query.campaign.findFirst({
		where: eq(schema.campaign.id, params.campaignId),
	});
	if (!campaign || campaign.status === "cancelled" || campaign.deletedAt) {
		return;
	}

	const isSequential = !params.recipientIds?.length;
	if (isSequential) {
		// A crashed worker can leave recipients stuck in `sending`. Sequential
		// batches are the only active send for this campaign, so reclaim them.
		await db
			.update(schema.campaignRecipient)
			.set({ status: "pending", updatedAt: new Date() })
			.where(
				and(
					eq(schema.campaignRecipient.campaignId, params.campaignId),
					eq(schema.campaignRecipient.status, "sending"),
				),
			);
	}

	const recipientIds = isSequential
		? await loadNextRecipientIds(params.campaignId)
		: (params.recipientIds ?? []);

	if (recipientIds.length === 0) {
		await maybeCompleteCampaign(params.campaignId);
		return;
	}

	for (const recipientId of recipientIds) {
		const result = await sendCampaignRecipient(recipientId);
		if (result.outcome === "quota_exceeded") {
			return;
		}
		if (result.outcome === "rate_limited") {
			await enqueueCampaignBatch({
				campaignId: params.campaignId,
				organizationId: params.organizationId,
				batchIndex: params.batchIndex + 1,
				delayMs: nextBatchDelayMs({
					rateLimited: true,
					retryAfterSeconds: result.retryAfterSeconds,
				}),
			});
			return;
		}
	}

	const morePending = await hasPendingRecipients(params.campaignId);
	if (morePending) {
		await enqueueCampaignBatch({
			campaignId: params.campaignId,
			organizationId: params.organizationId,
			batchIndex: params.batchIndex + 1,
			delayMs: nextBatchDelayMs({}),
		});
		return;
	}

	await maybeCompleteCampaign(params.campaignId);
}

async function loadNextRecipientIds(campaignId: string): Promise<string[]> {
	const rows = await db
		.select({ id: schema.campaignRecipient.id })
		.from(schema.campaignRecipient)
		.where(
			and(
				eq(schema.campaignRecipient.campaignId, campaignId),
				eq(schema.campaignRecipient.status, "pending"),
			),
		)
		.orderBy(
			asc(schema.campaignRecipient.createdAt),
			asc(schema.campaignRecipient.id),
		)
		.limit(CAMPAIGN_BATCH_SIZE);

	return rows.map((row) => row.id);
}

async function hasPendingRecipients(campaignId: string): Promise<boolean> {
	const rows = await db
		.select({ id: schema.campaignRecipient.id })
		.from(schema.campaignRecipient)
		.where(
			and(
				eq(schema.campaignRecipient.campaignId, campaignId),
				inArray(schema.campaignRecipient.status, ["pending", "sending"]),
			),
		)
		.limit(1);
	return rows.length > 0;
}
