import type { TraceHubModel } from "./tracehub.model";

export namespace TraceHubTypes {
	export type TrackEventBody = typeof TraceHubModel.trackEventBody.static;
	export type TrackEventResponse =
		typeof TraceHubModel.trackEventResponse.static;
	export type ErrorResponse = typeof TraceHubModel.errorResponse.static;
}
