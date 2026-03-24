"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Select from "@reloop/ui/select";
import Spinner from "@reloop/ui/spinner";
import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { ContactTable } from "./components/contact-table";
import { EmptyState } from "./components/empty-state";

interface Subscription {
	id: string;
	contactId: string;
	topicId: string;
	organizationId: string;
	status: "subscribed" | "unsubscribed";
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface SubscriptionListResponse {
	subscriptions: Subscription[];
	total: number;
	page: number;
	limit: number;
}

const TopicDetailPage = () => {
	const { topicId } = useParams();
	const { mutate } = useSWRConfig();
	const { activeOrganization } = useUserOrganization();
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState<string>("");
	const { data: subscriptionData, isLoading: subscriptionLoading } =
		useSWR<SubscriptionListResponse>(
			`/api/contacts/v1/subscriptions/list?topicId=${topicId}&limit=100`,
			{
				revalidateOnFocus: true,
				revalidateOnReconnect: true,
			},
		);

	const handleUnsubscribe = async (contactId: string) => {
		try {
			await fetch("/api/contacts/v1/subscriptions/unsubscribe", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					credentials: "include",
				},
				body: JSON.stringify({ contactId, topicId }),
			});
			await mutate(
				`/api/contacts/v1/subscriptions/list?topicId=${topicId}&limit=100`,
			);
		} catch (error) {
			console.error("Failed to unsubscribe contact:", error);
		}
	};

	const filteredSubscriptions =
		subscriptionData?.subscriptions?.filter((sub) => {
			const matchesStatus =
				statusFilter === "all" || sub.status === statusFilter;
			return matchesStatus;
		}) || [];

	return (
		<>
			{subscriptionData?.subscriptions &&
			subscriptionData.subscriptions.length === 0 ? (
				<EmptyState />
			) : (
				<div>
					<div className="mb-6 flex items-center justify-between gap-3">
						<div className="flex w-full items-center gap-3">
							<div className="flex-1">
								<Input.Root size="small" className="rounded-xl">
									<Input.Wrapper>
										<Input.Icon
											as={() => <Icon name="search" className="h-4 w-4" />}
										/>
										<Input.Input
											type="text"
											placeholder="Search contacts..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
							<div className="w-48">
								<Select.Root
									size="small"
									value={statusFilter}
									onValueChange={setStatusFilter}
									disabled={subscriptionLoading}
								>
									<Select.Trigger className="rounded-xl">
										<Select.Value placeholder="Status" />
									</Select.Trigger>
									<Select.Content className="w-48">
										<Select.Item value="all">
											<div className="flex items-center gap-2 text-sm">
												<Icon name="users" className="h-4 w-4" />
												All Status
											</div>
										</Select.Item>
										<Select.Item value="subscribed">
											<div className="flex items-center gap-2 text-sm">
												<Icon
													name="bell-plus"
													className="h-4 w-4 text-success-base"
												/>
												Subscribed
											</div>
										</Select.Item>
										<Select.Item value="unsubscribed">
											<div className="flex items-center gap-2 text-sm">
												<Icon
													name="bell-minus"
													className="h-4 w-4 text-text-sub-600"
												/>
												Unsubscribed
											</div>
										</Select.Item>
									</Select.Content>
								</Select.Root>
							</div>
						</div>
					</div>

					<div className="mt-4">
						<ContactTable
							subscriptions={filteredSubscriptions}
							isLoading={subscriptionLoading}
							loadingRows={4}
							onUnsubscribe={handleUnsubscribe}
							activeOrganizationSlug={activeOrganization.slug}
						/>
					</div>
				</div>
			)}
		</>
	);
};

export default TopicDetailPage;
