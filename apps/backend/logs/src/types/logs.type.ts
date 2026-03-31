import type { LogsModel } from "@reloop/logs/model/logs.model";

export namespace LogsTypes {
	export type TrackEventBody = typeof LogsModel.trackEventBody.static;
	export type TrackEventResponse = typeof LogsModel.trackEventResponse.static;
	export type ErrorResponse = typeof LogsModel.errorResponse.static;
}
