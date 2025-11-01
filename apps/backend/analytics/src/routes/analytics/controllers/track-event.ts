import analytics from "@reloop/analytics/backend";
import type { AnalyticsTypes } from "../analytics.type";
import { logger } from "@reloop/logger";
import { status } from "elysia";

export async function trackEvent(
	body: AnalyticsTypes.TrackEventBody,
): Promise<AnalyticsTypes.TrackEventResponse> {
	const { event, properties = {}, distinct_id, user_id, organization_id } = body;

	// Use user_id or distinct_id or "anonymous" as fallback
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

		// Use the analytics backend package to track the event
		const analyticsInstance = analytics();

		// Track the event - just pass properties as-is, no enrichment
		await analyticsInstance.s.event(
			event,
			userId,
			properties || {},
			{
				organizationId: organization_id || null,
			},
		);

		// Generate a UUID for the response (the analytics package generates one internally)
		// For now, we'll return a success response
		// In a real implementation, you might want to capture the UUID from the tracker
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
	body: AnalyticsTypes.TrackEventBody,
): Promise<AnalyticsTypes.TrackEventResponse> {
	return await trackEvent(body);
}

