import { AsyncLocalStorage } from "node:async_hooks";
import { BusEvent, bus } from "@reloop/bus";
import { createLogger, log } from "evlog";
import { receiveInboundEmailController } from "../lib/receive-inbound-email";

/**
 * Isolated AsyncLocalStorage to prevent Elysia's evlog plugin
 * (which uses enterWith()) from contaminating NATS subscriber contexts.
 */
const subscriberContext = new AsyncLocalStorage();

export async function initInboundSubscriber() {
	log.info("subscribers", "Initializing KumoMTA inbound email subscriber");

	await bus.subscribe(BusEvent.KUMOMTA_INBOUND_RECEIVED, async (payload) => {
		// Run inside a fresh async context to isolate from Elysia's
		// evlog AsyncLocalStorage that uses enterWith() and leaks
		// across async boundaries in Bun's event loop.
		await subscriberContext.run({}, async () => {
			const msgLogger = createLogger({
				service: "inbox",
				subscriber: "kumomta-inbound",
				rawMessageLength: payload.rawMessage?.length || 0,
			});

			msgLogger.info("Received inbound email from KumoMTA via NATS");

			try {
				const result = await receiveInboundEmailController(
					payload.rawMessage,
				);
				log.info({
					message:
						"Successfully processed inbound email via NATS subscriber",
					result,
				});
			} catch (err) {
				log.error({
					message: "Error processing inbound email in NATS subscriber",
					error: err instanceof Error ? err.message : String(err),
				});
			}
		});
	});
}
