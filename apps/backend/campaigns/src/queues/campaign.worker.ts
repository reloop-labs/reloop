import { campaignsConfig } from "@be/campaigns/campaigns.config";
import {
	sendCampaignBatch,
	startCampaignSend,
} from "@be/campaigns/lib/campaign/dispatch";
import {
	CAMPAIGN_QUEUE,
	type CampaignJobData,
} from "@be/campaigns/queues/campaign.queue";
import { Worker } from "bullmq";
import { EvlogError, log } from "evlog";

const connection = {
	url: campaignsConfig.REDIS_URL,
};

export function startCampaignWorker(): Worker {
	const worker = new Worker<CampaignJobData>(
		CAMPAIGN_QUEUE,
		async (job) => {
			if (job.data.type === "start_campaign") {
				await startCampaignSend({
					campaignId: job.data.campaignId,
					organizationId: job.data.organizationId,
				});
				return;
			}

			await sendCampaignBatch({
				campaignId: job.data.campaignId,
				organizationId: job.data.organizationId,
				batchIndex: job.data.batchIndex ?? 0,
				recipientIds: job.data.recipientIds,
			});
		},
		{
			connection,
			// Multiple campaigns may run at once; each campaign only has one
			// active batch so a single org cannot fan out past the mail caps.
			concurrency: 3,
		},
	);

	worker.on("failed", (job, err) => {
		log.error({
			message: "Campaign job failed",
			jobId: job?.id,
			type: job?.data.type,
			error: err.message,
			...(err instanceof EvlogError && err.why ? { why: err.why } : {}),
		});
	});

	worker.on("error", (err) => {
		log.error({
			message: "Campaign worker error",
			error: err.message,
		});
	});

	log.info("worker", "Campaign worker started");
	return worker;
}
