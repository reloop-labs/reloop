import type { LogsModel } from "@reloop/logs/model/logs.model";

export namespace LogsTypes {
	export type BaseLogBody = typeof LogsModel.baseLogBody.static;
	export type IngestLogBody = typeof LogsModel.ingestLogBody.static;
	export type IngestLogsBody = typeof LogsModel.ingestLogsBody.static;
	export type LogResponse = typeof LogsModel.logResponse.static;
	export type IngestLogResponse = typeof LogsModel.ingestLogResponse.static;
	export type IngestLogsResponse = typeof LogsModel.ingestLogsResponse.static;
	export type ErrorResponse = typeof LogsModel.errorResponse.static;
}
