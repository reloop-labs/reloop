import type { ErrorCodeMap } from "../errors/reloop-error";
import type { ReloopClient } from "./client";
import { emailLogEndpoints } from "./endpoints";
import type {
	EmailLog,
	EmailLogListResponse,
	EmailStatsQuery,
	EmailStatsResponse,
	ListEmailLogsQuery,
} from "./types";

const EMAIL_LOG_CODES: ErrorCodeMap = { 404: "email_not_found" };

export class EmailLogsApi {
	readonly #client: ReloopClient;

	constructor(client: ReloopClient) {
		this.#client = client;
	}

	list(query: ListEmailLogsQuery = {}): Promise<EmailLogListResponse> {
		return this.#client.request<EmailLogListResponse>({
			method: "GET",
			path: emailLogEndpoints.list,
			query: {
				page: query.page,
				limit: query.limit,
				search: query.search,
				status: query.status,
				domain: query.domain,
				recipient: query.recipient,
				start_date: query.start_date,
				end_date: query.end_date,
			},
			codes: EMAIL_LOG_CODES,
			idempotent: true,
		});
	}

	retrieve(id: string): Promise<EmailLog> {
		return this.#client.request<EmailLog>({
			method: "GET",
			path: emailLogEndpoints.byId(id),
			codes: EMAIL_LOG_CODES,
			idempotent: true,
		});
	}

	stats(query: EmailStatsQuery = {}): Promise<EmailStatsResponse> {
		return this.#client.request<EmailStatsResponse>({
			method: "GET",
			path: emailLogEndpoints.stats,
			query: {
				domain_id: query.domain_id,
				start_date: query.start_date,
				end_date: query.end_date,
				interval: query.interval,
			},
			codes: EMAIL_LOG_CODES,
			idempotent: true,
		});
	}
}
