import { campaignsConfig } from "@be/campaigns/campaigns.config";
import { startCampaignWorker } from "@be/campaigns/queues/campaign.worker";
import { initCampaignSubscribers } from "@be/campaigns/subscribers/campaign.subscriber";
import { bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import { log } from "evlog";

export const loader = async () => {
	try {
		await db.execute("SELECT 1");
		log.info("server", "Database connection verified");
		await bus.connect(campaignsConfig.NATS_URL);
		log.info("server", "NATS connected");
		await initCampaignSubscribers();
		startCampaignWorker();
	} catch (error) {
		log.error({
			...{ error },
			message: "Failed to initialize campaigns service",
		});
		throw error;
	}

	log.info("server", "Campaigns service initialized");
};
