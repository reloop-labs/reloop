import { BusEvent, bus } from "@reloop/bus";
import { broadcastEmailLogLive } from "@reloop/logs/lib/broadcast-email-log";
import { log } from "evlog";

/**
 * Fan-out (no queue group) so every logs replica can push to its WS clients.
 * DB writes stay on the queued kumomta/log workers.
 */
export async function initEmailLiveSubscriber() {
	const live = async (emailLogId: string) => {
		await broadcastEmailLogLive(emailLogId);
	};

	await bus.subscribe(BusEvent.EMAIL_SENT, (payload) =>
		live(payload.emailLogId),
	);
	await bus.subscribe(BusEvent.EMAIL_SCHEDULED, (payload) =>
		live(payload.emailLogId),
	);
	await bus.subscribe(BusEvent.EMAIL_OPENED, (payload) =>
		live(payload.emailLogId),
	);
	await bus.subscribe(BusEvent.EMAIL_CLICKED, (payload) =>
		live(payload.emailLogId),
	);
	await bus.subscribe(BusEvent.EMAIL_FAILED, (payload) =>
		live(payload.emailLogId),
	);

	log.info("server", "Email live subscriber registered");
}
