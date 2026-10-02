import { log } from "evlog";
import { initEmailLiveSubscriber } from "./email-live.subscriber";
import { initKumomtaSubscriber } from "./kumomta.subscriber";
import { initLogSubscriber } from "./log.subscriber";
import { initReputationSubscriber } from "./reputation.subscriber";

export async function initSubscribers() {
	try {
		await initLogSubscriber();
		await initKumomtaSubscriber();
		await initEmailLiveSubscriber();
		await initReputationSubscriber();
		log.info("server", "Subscribers initialized");
	} catch (error) {
		log.error({
			message: "Failed to initialize subscribers",
			error: error instanceof Error ? error.message : String(error),
		});
	}
}
