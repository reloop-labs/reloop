import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { useMemo, useState } from "react";
import useSWR from "swr";

export interface WebhookData {
	id: string;
	name: string;
	url: string;
	status: "active" | "paused" | "disabled" | "failed";
	successCount: number;
	failureCount: number;
	lastTriggeredAt: string | null;
	createdAt: string;
}

interface WebhookListResponse {
	webhooks: WebhookData[];
	total: number;
	page: number;
	limit: number;
}

export function useWebhooks() {
	const { activeOrganization } = useUserOrganization();
	const [statusFilter, setStatusFilter] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");

	const { data, error, isLoading, mutate } = useSWR<WebhookListResponse>(
		activeOrganization?.id
			? `/api/webhook/v1/?organizationId=${activeOrganization.id}&limit=100`
			: null,
		{
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
		},
	);

	const isTotalEmpty = !isLoading && data?.webhooks?.length === 0;

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
		mutate,
	};
}
