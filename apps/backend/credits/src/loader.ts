import { bus } from "@reloop/bus";
import { log } from "evlog";
import { creditsConfig } from "./credits.config";
import { initSubscribers } from "./subscribers";

export async function loader() {
	log.info("server", "Initializing Credits Service Subscribers...");

	try {
		await bus.connect(creditsConfig.NATS_URL);
		log.info("server", "NATS connected in Credits Service");
		await initSubscribers();
	} catch (error) {
		log.error({
			...{ error },
			message: "Failed to connect to NATS in Credits Service",
		});
	}
}
