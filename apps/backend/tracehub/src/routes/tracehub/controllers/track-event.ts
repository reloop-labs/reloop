import analytics from "@reloop/analytics/backend";
import { logger } from "@reloop/logger";
import { status } from "elysia";
import type { TraceHubTypes } from "../tracehub.type";

export async function trackEvent(
	body: TraceHubTypes.TrackEventBody,
): Promise<TraceHubTypes.TrackEventResponse> {
	const {
		event,
		properties = {},
		distinct_id,
		user_id,
		organization_id,
	} = body;
	const userId = user_id || distinct_id || "anonymous";

	try {
		logger.info(
			{
				event,
				userId,
				organizationId: organization_id,
			},
			"Tracking event",
		);

		// Use the tracehub backend package to track the event
		const tracehubInstance = analytics();

		// Transform properties to match Properties type (filter null, convert boolean to string)
		const transformedProperties: Record<string, string | number> = {};
		if (properties) {
			for (const [key, value] of Object.entries(properties)) {
				if (value !== null) {
					// Convert boolean to string, keep string/number as-is
					transformedProperties[key] =
						typeof value === "boolean" ? String(value) : value;
				}
			}
		}
		await tracehubInstance.s.event(event, userId, transformedProperties, {
			organizationId: organization_id || null,
		});
		const uuid = crypto.randomUUID();

		logger.info(
			{
				event,
				userId,
				uuid,
			},
			"Event tracked successfully",
		);

		return {
			uuid,
			event,
			message: "Event tracked successfully",
		};
	} catch (error) {
		logger.error(
			{
				event,
				userId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error tracking event",
		);

		throw status(500, {
			message: error instanceof Error ? error.message : "Failed to track event",
		});
	}
}

export async function trackEventHandler(
	body: TraceHubTypes.TrackEventBody,
): Promise<TraceHubTypes.TrackEventResponse> {
	return await trackEvent(body);
}
