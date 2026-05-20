import type { LogsModel } from "@reloop/logs/model/logs.model";

export namespace LogsTypes {
	export type LogEntryResponse = typeof LogsModel.logEntryResponse.static;
	export type LogDetailResponse = typeof LogsModel.logDetailResponse.static;
	export type ListLogsQuery = typeof LogsModel.listLogsQuery.static;
	export type GetLogParams = typeof LogsModel.getLogParams.static;
	export type ListLogsResponse = typeof LogsModel.listLogsResponse.static;

	export type LogNotFound = typeof LogsModel.logNotFound.static;
	export type EmailLogNotFound = typeof LogsModel.emailLogNotFound.static;
	export type Unauthorized = typeof LogsModel.unauthorized.static;
	export type Forbidden = typeof LogsModel.forbidden.static;
	export type BadRequest = typeof LogsModel.badRequest.static;
	export type InternalServerError = typeof LogsModel.internalServerError.static;

	export type ListEmailLogsQuery = typeof LogsModel.listEmailLogsQuery.static;
	export type ListEmailLogsResponse =
		typeof LogsModel.listEmailLogsResponse.static;
	export type EmailLogFullEntry = typeof LogsModel.emailLogFullEntry.static;
	export type EmailStatsQuery = typeof LogsModel.emailStatsQuery.static;
	export type EmailStatsResponse = typeof LogsModel.emailStatsResponse.static;
}
