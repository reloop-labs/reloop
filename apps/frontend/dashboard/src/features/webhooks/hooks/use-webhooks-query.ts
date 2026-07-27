import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { queryKeys } from "#/lib/query-keys";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

export type WebhookCreatedBy = {
	id: string;
	name: string | null;
	email: string;
	image: string | null;
};

export type WebhookData = {
	id: string;
	name: string;
	url: string;
	status: "active" | "paused" | "disabled" | "failed";
	successCount: number;
	failureCount: number;
	lastTriggeredAt: string | null;
	createdAt: string;
	events?: string[];
	secret?: string | null;
	customHeaders?: Record<string, string> | null;
	rateLimitEnabled?: boolean;
	maxRequestsPerMinute?: number;
	maxRetries?: number;
	retryBackoffMultiplier?: number;
	filteringOptions?: Record<string, unknown> | null;
	consecutiveFailures?: number;
	createdBy?: WebhookCreatedBy;
	updatedAt?: string;
};

export type WebhookListResponse = {
	webhooks: WebhookData[];
	total: number;
	page: number;
	limit: number;
};

export type WebhookDetailData = WebhookData & {
	secret: string | null;
	customHeaders: Record<string, string> | null;
	rateLimitEnabled: boolean;
	maxRequestsPerMinute: number;
	maxRetries: number;
	retryBackoffMultiplier: number;
	filteringOptions: Record<string, unknown> | null;
	consecutiveFailures: number;
	updatedAt: string;
	organizationId?: string;
};

export function useWebhooksListQuery(enabled = true, limit = 100) {
	const { activeOrganization } = useActiveOrganization();
	return useQuery({
		queryKey: queryKeys.webhooks.list(activeOrganization?.id ?? "", limit),
		queryFn: async () => {
			const res = await fetch(
				`/api/webhook/v1/?organizationId=${activeOrganization?.id}&limit=${limit}`,
				{ credentials: "include" },
			);
			if (!res.ok) throw new Error(`Failed to load webhooks (${res.status})`);
			return res.json() as Promise<WebhookListResponse>;
		},
		enabled: enabled && !!activeOrganization?.id,
	});
}

export function useWebhookDetailQuery(webhookId: string | null | undefined) {
	return useQuery({
		queryKey: queryKeys.webhooks.detail(webhookId ?? ""),
		queryFn: async () => {
			const res = await fetch(`/api/webhook/v1/${webhookId}`, {
				credentials: "include",
			});
			if (!res.ok) throw new Error(`Failed to load webhook (${res.status})`);
			return res.json() as Promise<WebhookDetailData>;
		},
		enabled: !!webhookId,
	});
}

export function useInvalidateWebhooks() {
	const queryClient = useQueryClient();
	return () =>
		queryClient.invalidateQueries({ queryKey: queryKeys.webhooks.all });
}

export function useWebhooks(options?: { limit?: number }) {
	const limit = options?.limit ?? 100;
	const { activeOrganization } = useActiveOrganization();
	const [statusFilter, setStatusFilter] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");
	const invalidate = useInvalidateWebhooks();

	const { data, error, isPending, isFetching, refetch } = useWebhooksListQuery(
		!!activeOrganization?.id,
		limit,
	);

	const isLoading = isPending || (isFetching && !data);
	const isTotalEmpty = !isLoading && (data?.webhooks?.length ?? 0) === 0;

	const filteredWebhooks = useMemo(() => {
		return (
			data?.webhooks?.filter((webhook) => {
				const matchesStatus =
					statusFilter === "all" || webhook.status === statusFilter;
				const matchesSearch =
					searchQuery === "" ||
					webhook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					webhook.url.toLowerCase().includes(searchQuery.toLowerCase());
				return matchesStatus && matchesSearch;
			}) || []
		);
	}, [data?.webhooks, statusFilter, searchQuery]);

	const metrics = useMemo(() => {
		const totalDeliveries =
			data?.webhooks?.reduce(
				(acc, curr) => acc + curr.successCount + curr.failureCount,
				0,
			) || 0;

		const totalFailures =
			data?.webhooks?.reduce((acc, curr) => acc + curr.failureCount, 0) || 0;

		const failureRate =
			totalDeliveries > 0
				? ((totalFailures / totalDeliveries) * 100).toFixed(1)
				: "0.0";

		return {
			totalEndpoints: data?.total || 0,
			totalDeliveries,
			failureRate,
		};
	}, [data?.webhooks, data?.total]);

	return {
		activeOrganization,
		statusFilter,
		setStatusFilter,
		searchQuery,
		setSearchQuery,
		webhooks: filteredWebhooks,
		metrics,
		isLoading,
		error,
		isTotalEmpty,
		mutate: async () => {
			await invalidate();
			await refetch();
		},
	};
}
