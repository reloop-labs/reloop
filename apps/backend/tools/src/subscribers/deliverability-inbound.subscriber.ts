import { AsyncLocalStorage } from "node:async_hooks";
import { BusEvent, bus } from "@reloop/bus";
import { createLogger, log } from "evlog";
import { processInboundTesterEmail } from "../routes/tools/deliverability-test/deliverability-test.controllers";

const subscriberContext = new AsyncLocalStorage();
const processedMessages = new Set<string>();

export async function initDeliverabilityInboundSubscriber() {
	log.info("subscribers", "Initializing Deliverability Tester inbound email subscriber");

	try {
		await bus.subscribe(
			BusEvent.KUMOMTA_INBOUND_RECEIVED,
			async (payload) => {
				const raw = payload.rawMessage || "";
				if (!raw) return;

				// Fast filter: only handle messages destined for tester addresses
				if (
					!raw.includes("mail-test.") &&
					!raw.includes("@mail-test.") &&
					!raw.includes("mailtest.") &&
					!raw.includes("@mailtest.")
				) {
					return;
				}

				const match = raw.match(/Message-ID:\s*(<[^>]+>)/i);
				const messageKey = match && match[1] ? match[1].trim() : raw.substring(0, 300);

				if (processedMessages.has(messageKey)) {
					return;
				}

				processedMessages.add(messageKey);
				setTimeout(() => processedMessages.delete(messageKey), 60_000);

				await subscriberContext.run({}, async () => {
					const msgLogger = createLogger({
						service: "tools",
						subscriber: "deliverability-inbound",
					});

					msgLogger.info("Processing inbound email for deliverability tester");

					try {
						const result = await processInboundTesterEmail(raw);
						if (result.success) {
							msgLogger.info(
								`Successfully processed deliverability test for token: ${result.token}`,
							);
						}
					} catch (err) {
						log.error({
							message: "Error processing deliverability test message",
							error: err instanceof Error ? err.message : String(err),
						});
					}
				});
			},
			{ queue: "tools-deliverability-inbound" },
		);
	} catch (e) {
		log.error({
			message: "Failed to initialize deliverability inbound subscriber",
			error: e instanceof Error ? e.message : String(e),
		});
	}
}
