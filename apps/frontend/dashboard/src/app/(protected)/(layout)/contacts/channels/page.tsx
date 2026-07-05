import { ChannelList } from "@fe/dashboard/app/(protected)/(layout)/contacts/components/channels/channel-list";
import type { Metadata } from "next";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
	title: "Channels · Reloop",
	description: "Manage your communication channels.",
};

const ChannelsPage = () => <ChannelList />;

export default ChannelsPage;
