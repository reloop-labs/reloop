import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "#/lib/query-keys";

export type EmailStatsResponse = {
	dates: string[];
	sent: number[];
	delivered: number[];
	bounced: number[];
	complaint: number[];
	opened?: number[];
	unsubscribed?: number[];
	rate: number[];
	bounceBreakdown?: {
		transient: number[];
		permanent: number[];
		undetermined: number[];
	};
};

export type EmailStatsParams = {
	startDate: string;
	endDate: string;
	domain: string;
	enabled?: boolean;
};

export function useEmailStatsQuery(params: EmailStatsParams) {
	return useQuery({
		queryKey: queryKeys.metrics.emailStats(params),
		queryFn: async () => {
			const search = new URLSearchParams();
			if (params.startDate) search.set("start_date", params.startDate);
			if (params.endDate) search.set("end_date", params.endDate);
			if (params.domain && params.domain !== "all") {
				search.set("domain_id", params.domain);
			}
			const res = await fetch(
				`/api/logs/v1/emails/stats?${search.toString()}`,
				{ credentials: "include" },
			);
			if (!res.ok) throw new Error(`Failed to load stats (${res.status})`);
			return res.json() as Promise<EmailStatsResponse>;
		},
		enabled: params.enabled !== false,
	});
}
