import { initKumomtaContactSubscriber } from "@be/contacts/subscribers/kumomta.subscriber";
import { log } from "evlog";

export async function initSubscribers() {
	try {
		await Promise.all([initKumomtaContactSubscriber()]);

		log.info("server", "All contacts subscribers initialized");
	} catch (error) {
		log.error({
			error: error instanceof Error ? error.message : String(error),
			message: "Failed to initialize contacts subscribers",
		});
	}
}
