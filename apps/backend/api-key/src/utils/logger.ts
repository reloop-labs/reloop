import logger from "@reloop/logger";

/**
 * Creates a structured log entry in the centralized logs service.
 * This is a service-specific implementation that uses the API key configuration.
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
	const baseUrl = process.env.BASE_URL || "https://local.reloop.sh";
	const url = `${baseUrl}/api/logs/v1/create`;
	const {
		event,
		level = "info",
		trace_id,
		metadata = {},
		requestDetails = {},
		cookie,
	} = body;

	try {
		await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-log-api-key": process.env.LOGS_API_KEY || "reloop-log-api-key",
				...(cookie && { cookie }),
			},
			body: JSON.stringify({
				event,
				level,
				trace_id:
					trace_id ||
					(typeof crypto !== "undefined" ? crypto.randomUUID() : undefined),
				metadata,
				status_code: requestDetails.statusCode,
				requestDetails,
			}),
		});
	} catch (error) {
		logger.error({ error }, "Error calling logs service");
	}
}
