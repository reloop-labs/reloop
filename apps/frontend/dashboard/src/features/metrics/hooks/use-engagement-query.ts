import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "#/lib/query-keys";

export type EngagementBucket = { name: string; count: number };

export type EngagementResponse = {
	totals: { opens: number; machineOpens: number; clicks: number };
	clients: EngagementBucket[];
	devices: EngagementBucket[];
	countries: EngagementBucket[];
	bestTime: {
		timeZone: string;
		/** 7 rows (Monday first) by 24 hours. */
		heatmap: number[][];
		/** day 0 = Monday. */
		best: { day: number; hour: number } | null;
		sampleSize: number;
	};
};

export function viewerTimeZone(): string {
	return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

/**
 * Who opened and clicked, plus when readers open. Org-wide by default;
 * pass a campaign to scope it. `days` bounds the window (default 90).
 */
export function useEngagementQuery(params: {
	campaignId?: string;
	days?: number;
	enabled?: boolean;
}) {
	const days = params.days ?? 90;
	const tz = viewerTimeZone();
	return useQuery({
		queryKey: queryKeys.metrics.engagement({
			campaignId: params.campaignId,
			days,
			tz,
		}),
		queryFn: async () => {
			const search = new URLSearchParams({ tz });
			if (params.campaignId) {
				search.set("campaign_id", params.campaignId);
			} else {
				search.set(
					"start_date",
					new Date(Date.now() - days * 86_400_000).toISOString(),
				);
			}
			const res = await fetch(`/api/logs/v1/engagement?${search}`, {
				credentials: "include",
			});
			if (!res.ok) {
				throw new Error(`Failed to load engagement (${res.status})`);
			}
			return res.json() as Promise<EngagementResponse>;
		},
		enabled: params.enabled !== false,
		staleTime: 5 * 60_000,
	});
}
