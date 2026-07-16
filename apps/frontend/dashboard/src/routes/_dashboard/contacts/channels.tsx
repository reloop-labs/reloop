import { createFileRoute } from "@tanstack/react-router";
import { ChannelList } from "#/features/contacts/components/channels/channel-list";

export const Route = createFileRoute("/_dashboard/contacts/channels")({
	component: ChannelList,
	head: () => ({
		meta: [
			{ title: "Channels · Reloop" },
			{
				name: "description",
				content: "Subscription channels for your audience.",
			},
		],
	}),
});
