import { log } from "evlog";
import { initLogSubscriber } from "./log.subscriber";

export async function initSubscribers() {
	try {
		await initLogSubscriber();
		log.info("server", "Audit log subscriber initialized");
	} catch (error) {
		log.error({
			message: "Failed to initialize audit log subscriber",
			error: error instanceof Error ? error.message : String(error),
		});
	}
}
