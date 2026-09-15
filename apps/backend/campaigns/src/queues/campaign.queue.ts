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
			batchIndex: number;
			/** Legacy fan-out jobs may still carry a frozen recipient list. */
			recipientIds?: string[];
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
	batchIndex: number,
): string {
	return `campaign-send-${campaignId}-${batchIndex}`;
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

export async function enqueueCampaignBatch(params: {
	campaignId: string;
	organizationId: string;
	batchIndex: number;
	delayMs?: number;
	recipientIds?: string[];
}): Promise<void> {
	const jobId = campaignBatchJobId(params.campaignId, params.batchIndex);
	const existing = await campaignQueue.getJob(jobId);
	if (existing) {
		const state = await existing.getState();
		if (state === "active" || state === "waiting" || state === "delayed") {
			return;
		}
		await existing.remove().catch(() => undefined);
	}

	await campaignQueue.add(
		"send_batch",
		{
			type: "send_batch",
			campaignId: params.campaignId,
			organizationId: params.organizationId,
			batchIndex: params.batchIndex,
			...(params.recipientIds ? { recipientIds: params.recipientIds } : {}),
		},
		{
			jobId,
			delay: Math.max(0, params.delayMs ?? 0),
		},
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

export async function cancelCampaignStart(campaignId: string): Promise<void> {
	await removeJobIfIdle(campaignStartJobId(campaignId));
}

export async function campaignHasQueuedSend(
	campaignId: string,
): Promise<boolean> {
	const jobs = await campaignQueue.getJobs([
		"wait",
		"waiting",
		"delayed",
		"active",
		"paused",
		"waiting-children",
	]);
	return jobs.some(
		(job) =>
			job.data.campaignId === campaignId && job.data.type === "send_batch",
	);
}

export async function cancelCampaignJobs(campaignId: string): Promise<void> {
	await cancelCampaignStart(campaignId);
	const jobs = await campaignQueue.getJobs([
		"wait",
		"waiting",
		"delayed",
		"paused",
		"waiting-children",
	]);
	await Promise.all(
		jobs
			.filter((job) => job.data.campaignId === campaignId)
			.map((job) => job.remove().catch(() => undefined)),
	);
}

async function removeJobIfIdle(jobId: string): Promise<void> {
	const existing = await campaignQueue.getJob(jobId);
	if (!existing) return;
	const state = await existing.getState();
	if (state === "active") return;
	await existing.remove().catch(() => undefined);
}
