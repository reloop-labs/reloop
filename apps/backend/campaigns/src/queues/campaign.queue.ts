import { campaignsConfig } from "@be/campaigns/campaigns.config";
import { Queue } from "bullmq";

export type CampaignJobData =
	| {
			type: "start_campaign";
			campaignId: string;
			organizationId: string;
	  }
	| {
			type: "send_batch";
			campaignId: string;
			organizationId: string;
			recipientIds: string[];
	  };

const connection = {
	url: campaignsConfig.REDIS_URL,
};

export const CAMPAIGN_QUEUE = "campaign-send";

export const campaignQueue = new Queue<CampaignJobData>(CAMPAIGN_QUEUE, {
	connection,
	defaultJobOptions: {
		attempts: 5,
		backoff: {
			type: "exponential",
			delay: 2000,
		},
		removeOnComplete: { count: 200 },
		removeOnFail: { count: 500 },
	},
});

export function campaignStartJobId(campaignId: string): string {
	return `campaign-start-${campaignId}`;
}

export function campaignBatchJobId(
	campaignId: string,
	batchStart: string,
): string {
	return `campaign-send-${campaignId}-${batchStart}`;
}

export async function enqueueCampaignStart(params: {
	campaignId: string;
	organizationId: string;
	delayMs?: number;
}): Promise<void> {
	const jobId = campaignStartJobId(params.campaignId);
	const existing = await campaignQueue.getJob(jobId);
	if (existing) {
		const state = await existing.getState();
		if (state === "active" || state === "waiting" || state === "delayed") {
			if ((params.delayMs ?? 0) > 0 && state === "delayed") {
				await existing.remove().catch(() => undefined);
			} else {
				return;
			}
		} else {
			await existing.remove().catch(() => undefined);
		}
	}

	await campaignQueue.add(
		"start_campaign",
		{
			type: "start_campaign",
			campaignId: params.campaignId,
			organizationId: params.organizationId,
		},
		{
			jobId,
			delay: Math.max(0, params.delayMs ?? 0),
		},
	);
}

export async function cancelCampaignStart(campaignId: string): Promise<void> {
	const existing = await campaignQueue.getJob(campaignStartJobId(campaignId));
	if (!existing) return;
	const state = await existing.getState();
	if (state === "active") return;
	await existing.remove().catch(() => undefined);
}
