"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Select from "@reloop/ui/select";
import Spinner from "@reloop/ui/spinner";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { AddContact } from "./components/add-contact";
import { ContactTable } from "./components/contact-table";
import { EmptyState } from "./components/empty-state";
import { TopicHeader } from "./components/topic-header";

interface Topic {
	id: string;
	name: string;
	description: string | null;
	organizationId: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

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
	const { topicId, orgSlug } = useParams();
	const router = useRouter();
	const { mutate } = useSWRConfig();
	const { activeOrganization } = useUserOrganization();
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [showAddContact, setShowAddContact] = useState(false);

	const {
		data: topicData,
		error: topicError,
		isLoading: topicLoading,
	} = useSWR<Topic>(`/api/contacts/v1/topics/${topicId}`, {
		revalidateOnFocus: true,
		revalidateOnReconnect: true,
	});

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

	const handleDownloadCSV = () => {
		if (
			!subscriptionData?.subscriptions ||
			subscriptionData.subscriptions.length === 0
		) {
			return;
		}

		// Create CSV content
		const headers = ["Contact ID", "Status", "Created At"];
		const csvRows = subscriptionData.subscriptions.map((sub) => [
			sub.contactId,
			sub.status,
			new Date(sub.createdAt).toISOString(),
		]);

		const csvContent = [headers, ...csvRows]
			.map((row) => row.map((field) => `"${field}"`).join(","))
			.join("\n");

		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);
		link.setAttribute("href", url);
		link.setAttribute(
			"download",
			`${topicData?.name || "topic"}-subscribers.csv`,
		);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	if (topicLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (topicError) {
		return (
			<div className="mx-auto max-w-3xl sm:px-8">
				<div className="flex flex-col items-center justify-center gap-2 p-4">
					<Icon name="alert-circle" className="h-8 w-8 text-red-500" />
					<p className="text-center text-sm text-text-sub-600">
						Failed to load topic
					</p>
				</div>
			</div>
		);
	}

	const filteredSubscriptions =
		subscriptionData?.subscriptions?.filter((sub) => {
			const matchesStatus =
				statusFilter === "all" || sub.status === statusFilter;
			return matchesStatus;
		}) || [];

	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			<TopicHeader
				topic={topicData || undefined}
				isLoading={topicLoading}
				isFailed={!!topicError}
				onOpenAddContact={() => setShowAddContact(true)}
				onOpenBulkImport={() =>
					router.push(`/${orgSlug}/contacts/${topicId}/bulk-import`)
				}
			/>

			{subscriptionData?.subscriptions &&
			subscriptionData.subscriptions.length === 0 ? (
				<EmptyState onAddContact={() => setShowAddContact(true)} />
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
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="xsmall"
							onClick={handleDownloadCSV}
							disabled={
								!subscriptionData?.subscriptions ||
								subscriptionData.subscriptions.length === 0
							}
						>
							<Icon name="file-download" className="h-4 w-4" />
						</Button.Root>
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
			<AddContact
				topicId={topicId as string}
				topicName={topicData?.name || "Unknown"}
				open={showAddContact}
				onOpenChange={setShowAddContact}
			/>
		</div>
	);
};

export default TopicDetailPage;
