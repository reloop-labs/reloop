import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useQueryState } from "nuqs";
import { toast } from "sonner";
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
			await invalidate();
		} catch {
			toast.error("Failed to update visibility");
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
