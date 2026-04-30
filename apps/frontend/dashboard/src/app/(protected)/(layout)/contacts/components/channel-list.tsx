"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { SubscriberPreview } from "./subscriber-preview";

import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";
import { useRouter } from "next/navigation";
import { ChannelTable } from "./channel-table";

interface Channel {
	id: string;
	name: string;
	description: string | null;
	organizationId: string;
	defaultSubscription?: "opt_in" | "opt_out";
	visibility?: "private" | "public";
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface ChannelListResponse {
	channels: Channel[];
	total: number;
	page: number;
	limit: number;
}

export const ChannelList = () => {
	const { activeOrganization } = useUserOrganization();
	const { mutate } = useSWRConfig();
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [, setModal] = useQueryState("modal", { history: "replace" });
	const [, setId] = useQueryState("id", { history: "replace" });
	const [currentPage, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);
	const [pageSize, setPageSize] = useQueryState(
		"limit",
		parseAsInteger.withDefault(10),
	);

	const { data, error, isLoading } = useSWR<ChannelListResponse>(
		activeOrganization?.id
			? `/api/contacts/v1/channels/list?limit=${pageSize}&page=${currentPage}`
			: null,
		{
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
		},
	);

	// Filter channels based on search query
	const filteredChannels =
		data?.channels?.filter((channel) => {
			return (
				searchQuery === "" ||
				channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				channel.description?.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}) || [];

	const handleToggleVisibility = async (
		channelId: string,
		currentValue: "private" | "public",
	) => {
		const newValue = currentValue === "public" ? "private" : "public";
		try {
			const response = await fetch(`/api/contacts/v1/channels/${channelId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ visibility: newValue }),
			});
			if (!response.ok) throw new Error("Failed to update visibility");
			toast.success(`Visibility set to ${newValue}`);
			mutate(
				(key: string) =>
					typeof key === "string" && key.startsWith("/api/contacts/v1/channels"),
			);
		} catch {
			toast.error("Failed to update visibility");
		}
	};

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center gap-2 p-4">
				<Icon name="alert-circle" className="h-8 w-8 text-red-500" />
				<p className="text-center text-sm text-text-sub-600">
					Failed to load channels
				</p>
			</div>
		);
	}

	const allChannels = data?.channels ?? [];
	const orgName = activeOrganization?.name ?? "Your Organization";

	return (
		<div className="flex gap-6">
			{/* Left: Channel table */}
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-3">
					<div className="flex-1">
						<Input.Root size="xsmall" className="rounded-[10px]">
							<Input.Wrapper>
								<Input.Icon
									as={Icon}
									name="search"
									size="xsmall"
									className="h-3.5 w-3.5"
								/>
								<Input.Input
									placeholder="Search channels..."
									value={searchQuery}
									onChange={(e) => {
										setSearchQuery(e.target.value);
										setCurrentPage(1);
									}}
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>
				</div>

				<div className="mt-4">
					<ChannelTable
						channels={filteredChannels}
						total={data?.total || 0}
						currentPage={currentPage}
						pageSize={pageSize}
						onPageChange={setCurrentPage}
						onPageSizeChange={(size) => {
							setPageSize(size);
							setCurrentPage(1);
						}}
						isLoading={isLoading}
						loadingRows={4}
						onToggleVisibility={handleToggleVisibility}
						onEdit={(channelId) => {
							setModal("edit-channel");
							setId(channelId);
						}}
						onDelete={(channelId) => {
							setModal("delete-channel");
							setId(channelId);
						}}
						onAddChannel={() => router.push("/contacts/channels/add")}
					/>
				</div>
			</div>

			{/* Right: Subscriber preview — always shows all public channels */}
			<div className="w-[320px] flex-shrink-0">
				<div className="sticky top-6">
					<SubscriberPreview
						channels={allChannels}
						orgName={orgName}
					/>
				</div>
			</div>
		</div>
	);
};
