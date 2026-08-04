import { Icon } from "@reloop/ui/icon";
import { useQueryState } from "nuqs";
import { useMemo } from "react";
import { toast } from "sonner";
import type { CommandAction } from "#/features/dashboard/command-menu";
import { useRegisterCommandActions } from "#/features/dashboard/command-menu-context";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import {
	useChannelsQuery,
	useInvalidateContacts,
} from "../../hooks/use-contacts-query";
import { ChannelCards } from "./channel-cards";
import { SubscriberPreview } from "./subscriber-preview";

export function ChannelList() {
	const { activeOrganization } = useActiveOrganization();
	const invalidate = useInvalidateContacts();
	const [, setModal] = useQueryState("modal", { history: "replace" });
	const [, setId] = useQueryState("id", { history: "replace" });

	const { data, error, isPending, isFetching } = useChannelsQuery(
		!!activeOrganization?.id,
	);
	const isLoading = isPending || (isFetching && !data);

	const actions = useMemo<CommandAction[]>(
		() => [
			{
				id: "create-channel",
				label: "Create Channel",
				icon: "plus",
				shortcut: { label: "C", keys: ["c"] },
				onSelect: () => void setModal("create-channel"),
			},
			{
				id: "open-api-reference",
				label: "Open API Reference",
				icon: "code",
				shortcut: { label: "S", keys: ["s"] },
				onSelect: () =>
					window.dispatchEvent(
						new CustomEvent("api-details:open", {
							detail: { docSection: "contacts/channels" },
						}),
					),
			},
			{
				id: "go-to-docs",
				label: "Go to Docs",
				icon: "file-text",
				shortcut: { label: "D", keys: ["d"] },
				onSelect: () =>
					window.open("https://reloop.sh/docs/learn/contacts", "_blank"),
			},
		],
		[setModal],
	);

	useRegisterCommandActions("channels", "Channels", actions);

	const patchChannel = async (
		channelId: string,
		body: {
			visibility?: "private" | "public";
			defaultSubscription?: "opt_in" | "opt_out";
		},
	) => {
		const response = await fetch(`/api/contacts/v1/channels/${channelId}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(body),
		});
		if (!response.ok) {
			const data = (await response.json().catch(() => ({}))) as {
				message?: string;
			};
			throw new Error(data.message || "Failed to update channel");
		}
	};

	const handleToggleVisibility = async (
		channelId: string,
		currentValue: "private" | "public",
	) => {
		const newValue = currentValue === "public" ? "private" : "public";
		try {
			await patchChannel(channelId, { visibility: newValue });
			await invalidate();
			toast.success(
				newValue === "public" ? "Channel is now public" : "Channel is now hidden",
			);
		} catch {
			toast.error("Failed to update visibility");
		}
	};

	const handleToggleDefaultSubscription = async (
		channelId: string,
		currentValue: "opt_in" | "opt_out",
	) => {
		const newValue = currentValue === "opt_in" ? "opt_out" : "opt_in";
		try {
			await patchChannel(channelId, { defaultSubscription: newValue });
			await invalidate();
			toast.success(
				newValue === "opt_in"
					? "New contacts will be subscribed by default"
					: "New contacts will not be subscribed by default",
			);
		} catch {
			toast.error("Failed to update default subscription");
		}
	};

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center gap-2 p-4">
				<Icon name="alert-circle" className="h-8 w-8 text-error-base" />
				<p className="text-center text-sm text-text-sub-600">
					Failed to load channels
				</p>
			</div>
		);
	}

	const allChannels = data?.channels ?? [];
	const orgName = activeOrganization?.name ?? "Your Organization";

	return (
		<div className="flex items-stretch gap-3">
			{/* Left: Channel list */}
			<div className="flex h-full min-w-0 flex-1 flex-col">
				<ChannelCards
					channels={allChannels}
					isLoading={isLoading}
					onAddChannel={() => void setModal("create-channel")}
					onEdit={(id) => {
						void setModal("edit-channel");
						void setId(id);
					}}
					onDelete={(id) => {
						void setModal("delete-channel");
						void setId(id);
					}}
					onToggleVisibility={handleToggleVisibility}
					onToggleDefaultSubscription={handleToggleDefaultSubscription}
				/>
			</div>

			{/* Right: Subscriber preference preview — public channels */}
			<div className="hidden w-[300px] flex-shrink-0 lg:block">
				<div className="sticky top-6">
					<SubscriberPreview channels={allChannels} orgName={orgName} />
				</div>
			</div>
		</div>
	);
}
