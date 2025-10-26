"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Select from "@reloop/ui/select";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { CreateWebhookModal } from "./create-webhook-modal";
import { EmptyState } from "./empty-state";
import { WebhookCard } from "./webhook-card";

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

export const WebhookListTopbar = () => {
	const { activeOrganization } = useUserOrganization();
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	const { data, error, isLoading } = useSWR<WebhookListResponse>(
		activeOrganization?.id
			? `/api/webhook/v1/list?organizationId=${activeOrganization.id}&limit=100`
			: null,
		{
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
		},
	);

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
		<div className="mx-auto max-w-6xl p-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="font-medium text-2xl">
						Webhook{data?.webhooks.length !== 1 ? "s" : ""}
					</h1>
					<p className="text-sm text-text-sub-600">
						Manage your webhooks and monitor their delivery status.
					</p>
				</div>
				<Button.Root
					variant="neutral"
					size="small"
					onClick={() => setIsCreateModalOpen(true)}
				>
					<Icon name="plus" className="h-4 w-4" />
					Add webhook
				</Button.Root>
			</div>

			<div>
				{error ? (
					<div className="flex flex-col items-center justify-center gap-2 p-4">
						<Icon name="alert-circle" className="h-8 w-8 text-red-500" />
						<p className="text-center text-sm text-text-sub-600">
							Failed to load webhooks
						</p>
					</div>
				) : data?.webhooks && data.webhooks.length === 0 ? (
					<EmptyState onCreateWebhook={() => setIsCreateModalOpen(true)} />
				) : (
					<div>
						<div className="mb-6">
							<div className="flex items-center gap-3">
								<div className="flex-1">
									<Input.Root>
										<Input.Wrapper size="small">
											<Input.Icon>
												<Icon name="search" className="h-4 w-4" />
											</Input.Icon>
											<Input.Input
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
						</div>

						<div className="rounded-lg border border-stroke-soft-200">
							{isLoading
								? Array.from({ length: 6 }).map((_, i) => (
										<div
											key={i}
											className="h-16 animate-pulse rounded bg-gray-100"
										/>
									))
								: filteredWebhooks.map((webhook) => (
										<Link
											key={webhook.id}
											href={`/${activeOrganization?.slug}/webhooks/${webhook.id}`}
											className="block border-stroke-soft-200 border-b p-4 transition-colors last:border-b-0 hover:bg-bg-weak-50"
										>
											<WebhookCard webhook={webhook} />
										</Link>
									))}
						</div>
					</div>
				)}
			</div>

			<CreateWebhookModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
			/>
		</div>
	);
};
