import { bus, BusEvent } from "@reloop/bus";
import { log } from "evlog";

/**
 * Creates a structured log entry in the centralized logs service.
 * This is a service-specific implementation that uses NATS for transport.
 */
export async function createLog(body: {
	event: string;
	level?: "debug" | "info" | "warn" | "error" | "fatal";
	trace_id?: string;
	metadata?: Record<string, unknown>;
	// Context fields
	cookie?: string;
	requestDetails?: {
		endpoint?: string;
		method?: string;
		userAgent?: string;
		ipAddress?: string;
		statusCode?: number;
	};
	organization_id?: string;
	user_id?: string;
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
		// Log locally if remote logging fails
		log.error({
			message: "[Domain Service] Error publishing log to NATS",
			error,
		});
	}
}

