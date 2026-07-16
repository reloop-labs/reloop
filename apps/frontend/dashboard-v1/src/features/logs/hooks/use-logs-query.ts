import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "#/lib/query-keys";
import type { LogDetail, LogListResponse, LogsListParams } from "../types";

function buildListUrl(params: LogsListParams): string {
	const search = new URLSearchParams();
	search.set("limit", String(params.limit));
	search.set("page", String(params.page));
	if (params.search) search.set("event", params.search);
	if (params.startDate) search.set("start_date", params.startDate);
	if (params.endDate) search.set("end_date", params.endDate);
	if (params.actorId) search.set("actor_id", params.actorId);

	if (params.outcome === "succeeded" && !params.statusCode) {
		search.set("status_code", "successes");
	} else if (params.outcome === "failed" && !params.statusCode) {
		search.set("status_code", "errors");
	} else if (params.statusCode) {
		search.set("status_code", params.statusCode);
	}

	return `/api/logs/v1/list?${search.toString()}`;
}

async function fetchLogs(params: LogsListParams): Promise<LogListResponse> {
	const res = await fetch(buildListUrl(params), { credentials: "include" });
	if (!res.ok) throw new Error(`Failed to load logs (${res.status})`);
	return res.json() as Promise<LogListResponse>;
}

async function fetchLogDetail(id: string): Promise<LogDetail> {
	const res = await fetch(`/api/logs/v1/${id}`, { credentials: "include" });
	if (!res.ok) throw new Error(`Failed to load log (${res.status})`);
	return res.json() as Promise<LogDetail>;
}

export function useLogsQuery(params: LogsListParams & { enabled?: boolean }) {
	return useQuery({
		queryKey: queryKeys.logs.list({
			page: params.page,
			limit: params.limit,
			search: params.search,
			startDate: params.startDate,
			endDate: params.endDate,
			statusCode: params.statusCode,
			outcome: params.outcome,
			actorId: params.actorId ?? "",
		}),
		queryFn: () => fetchLogs(params),
		enabled: params.enabled !== false,
		placeholderData: (prev) => prev,
	});
}

export function useLogDetailQuery(logId: string | null | undefined) {
	return useQuery({
		queryKey: queryKeys.logs.detail(logId ?? ""),
		queryFn: () => fetchLogDetail(logId as string),
		enabled: !!logId,
	});
}
