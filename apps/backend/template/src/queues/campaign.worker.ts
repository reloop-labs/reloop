import { startCampaignSend } from "@be/template/lib/campaign/dispatch";
import { sendCampaignRecipient } from "@be/template/lib/campaign/send-recipient";
import {
	CAMPAIGN_QUEUE,
	type CampaignJobData,
} from "@be/template/queues/campaign.queue";
import { templateConfig } from "@be/template/template.config";
import { Worker } from "bullmq";
import { EvlogError, log } from "evlog";

const connection = {
	url: templateConfig.REDIS_URL,
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

			for (const recipientId of job.data.recipientIds) {
				await sendCampaignRecipient(recipientId);
			}
		},
		{
			connection,
			concurrency: 5,
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
