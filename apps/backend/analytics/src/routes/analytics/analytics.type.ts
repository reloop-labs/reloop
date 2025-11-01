import type { AnalyticsModel } from "./analytics.model";

export namespace AnalyticsTypes {
	export type TrackEventBody = typeof AnalyticsModel.trackEventBody.static;
	export type TrackEventResponse = typeof AnalyticsModel.trackEventResponse.static;
	export type ErrorResponse = typeof AnalyticsModel.errorResponse.static;
}

