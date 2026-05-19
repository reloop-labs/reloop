import type { LogsModel } from "@reloop/logs/model/logs.model";

export namespace LogsTypes {
	export type LogEntryResponse = typeof LogsModel.logEntryResponse.static;
	export type LogResponse = typeof LogsModel.logResponse.static;
	export type ListLogsQuery = typeof LogsModel.listLogsQuery.static;
	export type GetLogParams = typeof LogsModel.getLogParams.static;
	export type ListLogsResponse = typeof LogsModel.listLogsResponse.static;
	export type ErrorResponse = typeof LogsModel.errorResponse.static;
}
