import { ChannelList } from "@fe/dashboard/app/(protected)/(layout)/contacts/components/channel-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Channels · Reloop",
	description: "Manage your communication channels.",
};

const ChannelsPage = () => <ChannelList />;

export default ChannelsPage;
