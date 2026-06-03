import { BusEvent, bus } from "@reloop/bus";
import { log } from "evlog";
import { receiveInboundEmailController } from "../routes/receive/receive.controllers";

export async function initInboundSubscriber() {
	log.info("subscribers", "Initializing KumoMTA inbound email subscriber");

	await bus.subscribe(BusEvent.KUMOMTA_INBOUND_RECEIVED, async (payload) => {
		log.info({
			message: "Received inbound email from KumoMTA via NATS",
			rawMessageLength: payload.rawMessage?.length || 0,
		});

		try {
			const result = await receiveInboundEmailController(payload.rawMessage);
			if (result instanceof Response) {
				const body = await result.text();
				log.warn({
					message: "Inbound email processing failed or returned response",
					status: result.status,
					body,
				});
			} else {
				log.info({
					message: "Successfully processed inbound email via NATS subscriber",
					result,
				});
			}
		} catch (err) {
			log.error({
				message: "Error processing inbound email in NATS subscriber",
				error: err instanceof Error ? err.message : String(err),
			});
		}
	});
}
