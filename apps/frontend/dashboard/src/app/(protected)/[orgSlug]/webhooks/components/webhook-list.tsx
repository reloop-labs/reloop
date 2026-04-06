"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Select from "@reloop/ui/select";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

import { EmptyState } from "./empty-state";
import { WebhookTable } from "./webhook-table";

interface WebhookData {
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

export const WebhookListSidebar = () => {
	const { activeOrganization } = useUserOrganization();
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState<string>("");
	const router = useRouter();

	const { data, error, isLoading } = useSWR<WebhookListResponse>(
		activeOrganization?.id
			? `/api/webhook/v1/?organizationId=${activeOrganization.id}&limit=100`
			: null,
		{
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
		},
	);

	const isTotalEmpty = !isLoading && data?.webhooks?.length === 0;

	// Filter webhooks based on status and search query
	const filteredWebhooks =
		data?.webhooks?.filter((webhook) => {
			const matchesStatus =
				statusFilter === "all" || webhook.status === statusFilter;
			const matchesSearch =
				searchQuery === "" ||
				webhook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				webhook.url.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesStatus && matchesSearch;
		}) || [];

	return (
		<div className="pb-8">
			<div>
				{error ? (
					<div className="flex flex-col items-center justify-center gap-2 p-4">
						<Icon name="alert-circle" className="h-8 w-8 text-red-500" />
						<p className="text-center text-sm text-text-sub-600">
							Failed to load webhooks
						</p>
					</div>
				) : isTotalEmpty ? (
					<div className="mt-4 w-full">
						<EmptyState
							onCreateWebhook={() =>
								router.push(`/${activeOrganization?.slug}/webhooks/create`)
							}
						/>
					</div>
				) : (
					<div>
						<div className="flex items-center gap-3">
							<div className="flex-1">
								<Input.Root size="small" className="rounded-xl">
									<Input.Wrapper>
										<Input.Icon
											as={() => <Icon name="search" className="h-4 w-4" />}
										/>
										<Input.Input
											type="text"
											placeholder="Search webhooks..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
							<div className="w-40">
								<Select.Root
									size="small"
									value={statusFilter}
									onValueChange={setStatusFilter}
								>
									<Select.Trigger className="rounded-xl">
										<Select.Value placeholder="All statuses" />
									</Select.Trigger>
									<Select.Content>
										<Select.Item value="all">All statuses</Select.Item>
										<Select.Item value="active">Active</Select.Item>
										<Select.Item value="paused">Paused</Select.Item>
										<Select.Item value="disabled">Disabled</Select.Item>
										<Select.Item value="failed">Failed</Select.Item>
									</Select.Content>
								</Select.Root>
							</div>
						</div>

						<div className="mt-4">
							<WebhookTable
								webhooks={filteredWebhooks}
								activeOrganizationSlug={activeOrganization?.slug || ""}
								isLoading={isLoading}
								loadingRows={4}
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
