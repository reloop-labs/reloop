import { AsyncLocalStorage } from "node:async_hooks";
import { BusEvent, bus } from "@reloop/bus";
import { createLogger, log } from "evlog";
import { receiveInboundEmailController } from "../lib/receive-inbound-email";

/**
 * Isolated AsyncLocalStorage to prevent Elysia's evlog plugin
 * (which uses enterWith()) from contaminating NATS subscriber contexts.
 */
const subscriberContext = new AsyncLocalStorage();

const processedMessages = new Set<string>();

export async function initInboundSubscriber() {
	log.info("subscribers", "Initializing KumoMTA inbound email subscriber");

	await bus.subscribe(
		BusEvent.KUMOMTA_INBOUND_RECEIVED,
		async (payload) => {
			const raw = payload.rawMessage || "";
			const match = raw.match(/Message-ID:\s*(<[^>]+>)/i);
			const messageKey = match ? match[1].trim() : raw.substring(0, 300);

			if (processedMessages.has(messageKey)) {
				log.info(
					`[INBOX] Deduplicated concurrent NATS event for message: ${messageKey}`,
				);
				return;
			}

			processedMessages.add(messageKey);
			// Keep in cache for 60 seconds to drop duplicate event deliveries
			setTimeout(() => processedMessages.delete(messageKey), 60_000);

			// Run inside a fresh async context to isolate from Elysia's
			// evlog AsyncLocalStorage that uses enterWith() and leaks
			// across async boundaries in Bun's event loop.
			await subscriberContext.run({}, async () => {
				const msgLogger = createLogger({
					service: "inbox",
					subscriber: "kumomta-inbound",
					rawMessageLength: raw.length,
				});

				msgLogger.info("Received inbound email from KumoMTA via NATS");

				try {
					const result = await receiveInboundEmailController(raw);
					log.info({
						message: "Successfully processed inbound email via NATS subscriber",
						result,
					});
				} catch (err) {
					log.error({
						message: "Error processing inbound email in NATS subscriber",
						error: err instanceof Error ? err.message : String(err),
					});
				}
			});
		},
		{ queue: "inbox-inbound" },
	);
}
