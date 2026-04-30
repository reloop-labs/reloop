"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { Icon } from "@reloop/ui/icon";

import { useQueryState } from "nuqs";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";
import { ChannelCards } from "./channel-cards";
import { SubscriberPreview } from "./subscriber-preview";

interface Channel {
	id: string;
	name: string;
	description: string | null;
	organizationId: string;
	defaultSubscription?: "opt_in" | "opt_out";
	visibility?: "private" | "public";
	subscriberCount?: number;
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
	const [, setModal] = useQueryState("modal", { history: "replace" });
	const [, setId] = useQueryState("id", { history: "replace" });

	const { data, error, isLoading } = useSWR<ChannelListResponse>(
		activeOrganization?.id ? "/api/contacts/v1/channels/list?limit=100" : null,
		{
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
		},
	);

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
					typeof key === "string" &&
					key.startsWith("/api/contacts/v1/channels"),
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
			{/* Left: Channel list */}
			<div className="min-w-0 flex-1">
				<div className="mt-0">
					<ChannelCards
						channels={allChannels}
						isLoading={isLoading}
						onToggleVisibility={handleToggleVisibility}
						onEdit={(channelId) => {
							setModal("edit-channel");
							setId(channelId);
						}}
						onDelete={(channelId) => {
							setModal("delete-channel");
							setId(channelId);
						}}
						onAddChannel={() => setModal("create-channel")}
					/>
				</div>
			</div>

			{/* Right: Subscriber preview — always shows all public channels */}
			<div className="w-[320px] flex-shrink-0">
				<div className="sticky top-6">
					<SubscriberPreview channels={allChannels} orgName={orgName} />
				</div>
			</div>
		</div>
	);
};
