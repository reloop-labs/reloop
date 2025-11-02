import { logger } from "@reloop/logger";
import { status } from "elysia";
import { insertEvent } from "../../../utils/clickhouse";
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
	const distinctId = distinct_id || userId;

	try {
		logger.info(
			{
				event,
				userId,
				organizationId: organization_id,
			},
			"Tracking event",
		);

		// Transform properties to match database type (filter null, convert boolean to string)
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

		// Store event directly in ClickHouse
		const uuid = await insertEvent(
			event,
			userId,
			distinctId,
			transformedProperties,
			organization_id || null,
		);

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
