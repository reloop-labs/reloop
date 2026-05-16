import { log } from "evlog";
import { bus, BusEvent } from "@reloop/bus";


/**
 * Creates a structured log entry in the centralized logs service.
 * This is a service-specific implementation that uses NATS for transport.
 */
export async function createLog(body: {
	event: string;
	level?: "debug" | "info" | "warn" | "error" | "fatal";
	trace_id?: string;
	metadata?: Record<string, unknown>;
	requestDetails?: {
		endpoint?: string;
		method?: string;
		userAgent?: string;
		ipAddress?: string;
		statusCode?: number;
	};
	cookie?: string;
}) {
	const {
		event,
		level = "info",
		trace_id,
		metadata = {},
		requestDetails = {},
		cookie,
	} = body;

	try {
		await bus.publish(BusEvent.LOG_CREATED, {
			event,
			level,
			trace_id:
				trace_id ||
				(typeof crypto !== "undefined" ? crypto.randomUUID() : undefined),
			metadata,
			requestDetails,
			cookie,
		});
	} catch (error) {
		log.error({ ...({ error }), message: "Error publishing log to NATS" });
	}
}

